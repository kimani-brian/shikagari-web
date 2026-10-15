"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUCTION_API_URL, auctionSocketUrl } from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";

export type RoomConnection = "connecting" | "live" | "reconnecting" | "offline";

export interface RoomSnapshot {
	status: string;
	current_price: number;
	bid_count: number;
	leader: boolean;
	deadline_at?: string;
	server_time_utc: string;
	version: number;
}

export interface RoomState {
	price: number;
	version: number;
	deadlineAt: number | null;
	leaderId: string | null;
	iLead: boolean;
	outbidNotice: string | null;
	extendedFlash: boolean;
	reserveMet: boolean | null;
	result: { outcome: string; price: number } | null;
}

interface IncomingMessage {
	type: string;
	lot_id?: string;
	version?: number;
	data?: Record<string, unknown>;
}

// useAuctionRoom owns the socket for one lot: subscribe, snapshot, live
// events, bid submission, and reconnect with resync. The server is
// authoritative — the client never decides the price or the outcome, it only
// renders what the server says and corrects its clock on every tick.
export function useAuctionRoom(lotId: string) {
	const { user } = useAuth();
	const [connection, setConnection] = useState<RoomConnection>("connecting");
	const [state, setState] = useState<RoomState>({
		price: 0,
		version: -1,
		deadlineAt: null,
		leaderId: null,
		iLead: false,
		outbidNotice: null,
		extendedFlash: false,
		reserveMet: null,
		result: null,
	});
	// Your pre-bid ceiling on this lot, when you have one. The room shows it
	// as "auto-bidding to your max" so a proxy answer never surprises you.
	const [myMax, setMyMax] = useState<number | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const token = localStorage.getItem("shikagari_token");
				if (!token) return;
				const res = await fetch(`${AUCTION_API_URL}/me/lots/${lotId}/pre-bids`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) return;
				const body = await res.json();
				if (!cancelled && body?.data?.max_amount_kes) {
					setMyMax(Number(body.data.max_amount_kes));
				}
			} catch {
				// No ceiling, or offline — the room works without it.
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [lotId]);
	const [rejection, setRejection] = useState<string | null>(null);
	const [sending, setSending] = useState(false);

	const wsRef = useRef<WebSocket | null>(null);
	const retryRef = useRef(0);
	const userIdRef = useRef(user?.id ?? null);
	userIdRef.current = user?.id ?? null;
	const stateRef = useRef(state);
	stateRef.current = state;

	const applyEvent = useCallback((msg: IncomingMessage) => {
		if (msg.lot_id && msg.lot_id !== lotId) return;
		const uid = userIdRef.current;

		switch (msg.type) {
			case "SNAPSHOT": {
				const d = msg.data ?? {};
				setState((prev) => ({
					...prev,
					price: Number(d.current_price ?? prev.price),
					iLead: Boolean(d.you_lead),
					version: msg.version ?? prev.version,
					deadlineAt: d.deadline_at ? Date.parse(String(d.deadline_at)) : null,
					reserveMet:
						typeof d.reserve_met === "boolean" ? (d.reserve_met as boolean) : prev.reserveMet,
					result:
						String(d.status ?? "") === "sold" ||
						String(d.status ?? "") === "pending_approval" ||
						String(d.status ?? "") === "unsold"
							? { outcome: String(d.status), price: Number(d.current_price ?? 0) }
							: prev.result,
				}));
				break;
			}
			case "BID_ACCEPTED": {
				const d = msg.data ?? {};
				const bidderId = String(d.bidder_id ?? "");
				// Stale events arrive out of order on reconnect; the version
				// is the ordering key and old ones are discarded.
				setState((prev) => {
					if ((msg.version ?? 0) <= prev.version) return prev;
					return {
						...prev,
						price: Number(d.amount_kes ?? prev.price),
						version: msg.version ?? prev.version,
						reserveMet:
							typeof d.reserve_met === "boolean"
								? (d.reserve_met as boolean)
								: prev.reserveMet,
						deadlineAt: d.deadline_at ? Date.parse(String(d.deadline_at)) : prev.deadlineAt,
						leaderId: bidderId || null,
						iLead: !!uid && bidderId === uid,
						outbidNotice:
							prev.iLead && bidderId !== uid
								? `Outbid at ${Number(d.amount_kes ?? 0).toLocaleString()}`
								: null,
						extendedFlash: Boolean(d.extended),
					};
				});
				setSending(false);
				break;
			}
			case "BID_REJECTED": {
				const d = msg.data ?? {};
				setRejection(String(d.message ?? "Bid rejected."));
				setSending(false);
				break;
			}
			case "TIMER_TICK": {
				const d = msg.data ?? {};
				if (d.deadline_at) {
					const at = Date.parse(String(d.deadline_at));
					setState((prev) => ({ ...prev, deadlineAt: at }));
				}
				break;
			}
			case "TIMER_EXTENDED": {
				const d = msg.data ?? {};
				setState((prev) => ({
					...prev,
					deadlineAt: d.deadline_at ? Date.parse(String(d.deadline_at)) : prev.deadlineAt,
					extendedFlash: true,
				}));
				break;
			}
			case "YOU_WERE_OUTBID": {
				const d = msg.data ?? {};
				setState((prev) => ({
					...prev,
					outbidNotice: `Outbid at ${Number(d.new_amount_kes ?? 0).toLocaleString()}`,
					iLead: false,
				}));
				break;
			}
			case "LOT_HAMMERED":
			case "LOT_APPROVAL_REQUIRED": {
				const d = msg.data ?? {};
				setState((prev) => ({
					...prev,
					result: {
						outcome: msg.type === "LOT_HAMMERED" ? String((d.outcome as string) ?? "sold") : "pending_approval",
						price: Number((d.hammer_price_kes as number) ?? prev.price),
					},
					deadlineAt: null,
				}));
				break;
			}
		}
	}, [lotId]);

	useEffect(() => {
		let cancelled = false;
		let ws: WebSocket | null = null;
		let retryTimer: ReturnType<typeof setTimeout> | null = null;

		const token =
			typeof window === "undefined"
				? null
				: localStorage.getItem("shikagari_token");

		const connect = () => {
			if (cancelled) return;
			setConnection(retryRef.current === 0 ? "connecting" : "reconnecting");
			try {
				ws = new WebSocket(auctionSocketUrl(token));
			} catch {
				scheduleRetry();
				return;
			}
			wsRef.current = ws;

			ws.onopen = () => {
				if (cancelled) return;
				retryRef.current = 0;
				setConnection("live");
				ws?.send(JSON.stringify({ type: "SUBSCRIBE", channels: [`lot:${lotId}`] }));
			};
			ws.onmessage = (ev) => {
				if (cancelled) return;
				try {
					applyEvent(JSON.parse(String(ev.data)));
				} catch {
					// A malformed frame must never kill the room.
				}
			};
			ws.onerror = () => {
				ws?.close();
			};
			ws.onclose = () => {
				if (cancelled) return;
				wsRef.current = null;
				scheduleRetry();
			};
		};

		const scheduleRetry = () => {
			if (cancelled) return;
			setConnection(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "reconnecting");
			const delay = Math.min(1000 * 2 ** retryRef.current, 10000);
			retryRef.current += 1;
			retryTimer = setTimeout(connect, delay + Math.random() * 500);
		};

		const onOnline = () => {
			if (wsRef.current?.readyState !== WebSocket.OPEN) connect();
		};
		if (typeof window !== "undefined") {
			window.addEventListener("online", onOnline);
		}

		connect();
		return () => {
			cancelled = true;
			if (retryTimer) clearTimeout(retryTimer);
			if (typeof window !== "undefined") {
				window.removeEventListener("online", onOnline);
			}
			try {
				ws?.close();
			} catch {
				// Already gone.
			}
			wsRef.current = null;
		};
		// Reconnect when the lot changes; auth changes flow through localStorage reads on reconnect.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lotId]);

	const placeBid = useCallback(
		(amountKES: number) => {
			const ws = wsRef.current;
			if (!ws || ws.readyState !== WebSocket.OPEN) {
				setRejection("You're offline. Reconnect to bid.");
				return;
			}
			setRejection(null);
			setSending(true);
			ws.send(
				JSON.stringify({
					type: "BID_SUBMIT",
					lot_id: lotId,
					amount_kes: amountKES,
					client_bid_id:
						typeof crypto !== "undefined" && "randomUUID" in crypto
							? crypto.randomUUID()
							: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
				})
			);
			// If no verdict arrives, the button must not spin forever.
			setTimeout(() => {
				setSending((sendingNow) => {
					if (sendingNow) {
						setRejection("Still processing — watch the room for the outcome.");
						return false;
					}
					return sendingNow;
				});
			}, 6000);
		},
		[lotId]
	);

	const clearRejection = useCallback(() => setRejection(null), []);

	return { connection, state, myMax, rejection, sending, placeBid, clearRejection };
}