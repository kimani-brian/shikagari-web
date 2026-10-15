"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useAuctionLot } from "@/hooks/useAuctions";
import { useAuctionRoom } from "@/hooks/useAuctionRoom";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import CountdownRing from "@/components/auctions/CountdownRing";
import BuyingPowerMeter from "@/components/auctions/BuyingPowerMeter";
import { useBuyingPower } from "@/hooks/useAuctions";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AuctionRoomPage() {
	const { lotId } = useParams<{ lotId: string }>();
	const { isLoggedIn } = useAuth();
	const { lot } = useAuctionLot(lotId);
	const { connection, state, myMax, rejection, sending, placeBid, clearRejection } =
		useAuctionRoom(lotId);
	const { power } = useBuyingPower();
	const [custom, setCustom] = useState("");
	const [flash, setFlash] = useState(false);

	// The soft-close flash is momentary by design. Both state changes live
	// in timer callbacks, never in the effect body.
	useEffect(() => {
		if (!state.extendedFlash) return;
		const show = setTimeout(() => setFlash(true), 0);
		const hide = setTimeout(() => setFlash(false), 2500);
		return () => {
			clearTimeout(show);
			clearTimeout(hide);
		};
	}, [state.extendedFlash, state.version]);

	const vehicle = (lot?.vehicle ?? {}) as Record<string, string | number | string[]>;
	const title = String(vehicle.title ?? lot?.id ?? "Lot");
	const nextBid = state.price > 0 ? state.price + (lot?.increment_kes ?? 0) : (lot?.opening_bid_kes ?? 0);
	const ended = state.result != null;
	const canBid = isLoggedIn && connection === "live" && !ended;

	const submitCustom = () => {
		const amount = Number(custom.replace(/[^0-9]/g, ""));
		if (!amount || (state.price > 0 && amount <= state.price)) {
			return;
		}
		placeBid(amount);
		setCustom("");
	};

	return (
		<div className="bg-white min-h-screen">
			<PageWrapper className="py-6 max-w-5xl">
				<div className="flex items-center justify-between gap-3">
					<Link
						href={lotId ? `/auctions/lot/${lotId}` : "/auctions"}
						className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
					>
						← Lot details
					</Link>
					<span
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
							connection === "live"
								? "bg-red-50 text-red-600"
								: "bg-amber-50 text-amber-700"
						)}
					>
						<span
							className={cn(
								"w-2 h-2 rounded-full",
								connection === "live" ? "bg-red-500 animate-pulse" : "bg-amber-500"
							)}
						/>
						{connection === "live"
							? "LIVE"
							: connection === "offline"
								? "OFFLINE"
								: connection === "reconnecting"
									? "RECONNECTING"
									: "CONNECTING"}
					</span>
				</div>

				{connection !== "live" && (
					<div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs font-medium text-amber-800">
						{connection === "offline"
							? "You're offline. Reconnect to bid — your last bid is safe."
							: "Reconnecting — your last bid is safe."}
					</div>
				)}

				<div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Lot */}
					<div className="lg:col-span-2 space-y-4">
						<div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-neutral-200 p-5">
							<CountdownRing deadlineAt={state.deadlineAt} />
							<div className="text-center sm:text-left">
								<h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
								<p className="text-2xl font-bold text-neutral-900 mt-1 tabular-nums">
									{state.price > 0 ? formatKES(state.price) : "Opening soon"}
								</p>
								<p className="text-xs text-neutral-400 mt-1">
									{state.version >= 0 ? `${state.version} bids` : "Waiting for the room…"}
								</p>
								{state.reserveMet != null && (
									<p
										className={cn(
											"text-xs font-semibold mt-1",
											state.reserveMet ? "text-green-700" : "text-amber-700"
										)}
									>
										{state.reserveMet ? "Reserve met" : "Below reserve"}
									</p>
								)}
							</div>
						</div>

						{flash && (
							<div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs font-medium text-blue-800 animate-fade-in">
								Bid placed — the clock was extended.
							</div>
						)}

						{state.outbidNotice && !ended && (
							<div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-700">
								{state.outbidNotice}
							</div>
						)}

						{state.result && (
							<div className="rounded-2xl border border-neutral-900 bg-neutral-900 text-white p-5">
								<p className="text-xs uppercase tracking-wider text-neutral-400">
									{state.result.outcome === "sold"
										? "Hammer — sold"
										: state.result.outcome === "pending_approval"
											? "Hammer — waiting on the dealer"
											: "Hammer — no sale"}
								</p>
								<p className="text-2xl font-bold mt-1 tabular-nums">
									{formatKES(state.result.price)}
								</p>
							</div>
						)}
					</div>

					{/* Bid pad */}
					<div className="space-y-4">
						<div className="rounded-2xl border border-neutral-200 p-5 lg:sticky lg:top-20">
							{state.iLead && !ended ? (
								<div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-800 flex items-center gap-2">
									<Icon name="check_circle" size={18} />
									You&apos;re highest — {formatKES(state.price)}
								</div>
							) : null}

							{!isLoggedIn ? (
								<div className="space-y-3">
									<Link href="/login">
										<Button variant="primary" fullWidth size="lg">
											Register to bid
										</Button>
									</Link>
									<p className="text-xs text-neutral-400 text-center">
										Guests can watch. Bidding needs an account.
									</p>
								</div>
							) : ended ? (
								<Link href="/auctions">
									<Button variant="secondary" fullWidth>
										Back to auctions
									</Button>
								</Link>
							) : (
								<div className="space-y-3">
									{myMax != null && (
										<p className="rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs text-neutral-600">
											Auto-bidding to your max of{" "}
											<span className="font-semibold text-neutral-900">
												{formatKES(myMax)}
											</span>
											. You will never pay more than this.
										</p>
									)}
									<Button
										variant="primary"
										fullWidth
										size="lg"
										loading={sending}
										disabled={!canBid}
										onClick={() => placeBid(nextBid)}
									>
										Bid {formatKES(nextBid)}
									</Button>
									<div className="flex gap-2">
										<Input
											label=""
											type="text"
											inputMode="numeric"
											value={custom}
											onChange={(e) => setCustom(e.target.value)}
											placeholder="Bid more"
										/>
										<Button
											variant="secondary"
											disabled={!canBid || sending}
											onClick={submitCustom}
										>
											Bid
										</Button>
									</div>
									{rejection && (
										<div className="rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs text-neutral-700 flex items-start justify-between gap-2">
											<span>{rejection}</span>
											<button
												type="button"
												onClick={clearRejection}
												className="font-bold text-neutral-400 hover:text-neutral-900"
												aria-label="Dismiss"
											>
												×
											</button>
										</div>
									)}
									{!canBid && connection !== "live" && (
										<p className="text-xs text-neutral-400 text-center">
											Bidding resumes when you reconnect.
										</p>
									)}
								</div>
							)}
						</div>

						{power && (
							<BuyingPowerMeter
								deposited={power.deposited_kes}
								held={power.held_kes}
								ratioPercent={power.ratio_percent}
								tier={power.tier}
								compact
							/>
						)}
						<div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
							<p className="text-xs text-neutral-500 leading-relaxed">
								Sold by ShikaGari as auctioneer. Bids inside the final
								seconds extend the clock so everyone gets a fair last say.
							</p>
						</div>
					</div>
				</div>
			</PageWrapper>

			{/* Mobile sticky bid bar — the thumb never travels. */}
			{isLoggedIn && !ended && (
				<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
					<Button
						variant="primary"
						fullWidth
						size="lg"
						loading={sending}
						disabled={!canBid}
						onClick={() => placeBid(nextBid)}
					>
						{state.iLead ? `Leading — ${formatKES(state.price)}` : `Bid ${formatKES(nextBid)}`}
					</Button>
				</div>
			)}
		</div>
	);
}

export function RoomSkeleton() {
	return <PageLoader />;
}
