"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import auctionApi from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SignalLot {
	id: string;
	title: string;
	status: string;
	price: number;
	bids: number;
}

interface Signals {
	shared_ips: { ip: string; bidder_ids: string[]; bid_count: number }[];
	shared_devices: { ip: string; user_agent: string; bidder_ids: string[] }[];
	bids_last_minute: number;
	total_bids: number;
	distinct_bidders: number;
}

// Fraud review: pick a lot, see who looks coordinated. Shared office Wi-Fi
// explains most shared IPs — these are signals for a human, not verdicts.
export default function AdminReviewPage() {
	const router = useRouter();
	const { user, isLoggedIn, isLoading } = useAuth();
	const [lotId, setLotId] = useState("");
	const [signals, setSignals] = useState<Signals | null>(null);
	const [loading, setLoading] = useState(false);
	const [recent, setRecent] = useState<SignalLot[]>([]);

	useEffect(() => {
		if (isLoading) return;
		if (!isLoggedIn) {
			router.replace("/login");
			return;
		}
		if (user?.role !== "admin") router.replace("/dashboard");
	}, [isLoading, isLoggedIn, user?.role, router]);

	useEffect(() => {
		if (isLoading || !isLoggedIn || user?.role !== "admin") return;
		let cancelled = false;
		(async () => {
			try {
				const res = await auctionApi.get("/lots", { params: { per_page: 20 } });
				if (cancelled) return;
				setRecent(
					(res.data.data ?? []).map((l: Record<string, unknown>) => ({
						id: String(l.id ?? ""),
						title: String((l.vehicle as Record<string, unknown> | undefined)?.title ?? l.title ?? "Lot"),
						status: String(l.status ?? ""),
						price: Number(l.current_price_kes ?? 0),
						bids: Number(l.bid_count ?? 0),
					}))
				);
			} catch {
				if (!cancelled) setRecent([]);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [isLoading, isLoggedIn, user?.role]);

	if (isLoading || !isLoggedIn) return <PageLoader />;
	if (user?.role !== "admin") return null;

	const inspect = async (id: string) => {
		const target = id.trim();
		if (!target) return;
		try {
			setLoading(true);
			setLotId(target);
			const res = await auctionApi.get(`/admin/lots/${target}/signals`);
			setSignals(res.data.data ?? null);
		} catch {
			setSignals(null);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<header className="bg-white rounded-2xl border border-neutral-200 p-6">
				<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Admin tools</p>
				<h1 className="font-display text-3xl text-neutral-900 mt-1">Fraud review</h1>
				<p className="text-sm text-neutral-500 mt-2 max-w-2xl">
					Bidders sharing an address or a device, and abnormal bid velocity.
					Signals for a human — a shared office explains most of them.
				</p>
				<Link href="/dashboard/admin" className="inline-block mt-3 text-sm font-semibold text-neutral-500 hover:text-neutral-900">
					← Seller approvals
				</Link>
			</header>

			<div className="bg-white rounded-2xl border border-neutral-200 p-6">
				<h2 className="font-display text-xl text-neutral-900 mb-3">Recent lots</h2>
				{recent.length === 0 ? (
					<p className="text-sm text-neutral-500">No lots yet.</p>
				) : (
					<div className="space-y-2">
						{recent.map((l) => (
							<button
								key={l.id}
								type="button"
								onClick={() => inspect(l.id)}
								className={cn(
									"w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
									lotId === l.id
										? "border-neutral-900 bg-neutral-50"
										: "border-neutral-200 hover:border-neutral-900"
								)}
							>
								<span className="min-w-0">
									<span className="block text-sm font-semibold text-neutral-900 truncate">
										{l.title}
									</span>
									<span className="block text-xs text-neutral-400">
										{l.status.replace("_", " ")} · {l.bids} bids
									</span>
								</span>
								<span className="shrink-0 text-sm font-bold text-neutral-900 tabular-nums">
									{formatKES(l.price)}
								</span>
							</button>
						))}
					</div>
				)}
				<div className="mt-4 flex gap-2">
					<Input
						label=""
						value={lotId}
						onChange={(e) => setLotId(e.target.value)}
						placeholder="Or paste a lot UUID"
					/>
					<Button variant="secondary" onClick={() => inspect(lotId)}>
						Inspect
					</Button>
				</div>
			</div>

			{loading && <p className="text-sm text-neutral-400">Loading signals…</p>}

			{!loading && signals && (
				<div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
					<div className="grid grid-cols-3 gap-3 text-center">
						<Stat label="Bids" value={String(signals.total_bids)} />
						<Stat label="Bidders" value={String(signals.distinct_bidders)} />
						<Stat label="Last minute" value={String(signals.bids_last_minute)} />
					</div>
					{signals.shared_ips.length === 0 && signals.shared_devices.length === 0 ? (
						<p className="text-sm text-neutral-500">
							Nothing shared. Every bidder came from their own address and device.
						</p>
					) : (
						<>
							{signals.shared_ips.map((s) => (
								<div key={s.ip} className="rounded-xl bg-amber-50 border border-amber-200 p-3">
									<p className="text-xs font-bold text-amber-800">
										Shared IP {s.ip} — {s.bidder_ids.length} bidders, {s.bid_count} bids
									</p>
									<p className="text-[11px] font-mono text-amber-700 mt-1 break-all">
										{s.bidder_ids.join(", ")}
									</p>
								</div>
							))}
							{signals.shared_devices.map((s, i) => (
								<div key={`${s.ip}-${i}`} className="rounded-xl bg-red-50 border border-red-200 p-3">
									<p className="text-xs font-bold text-red-700">
										Shared device on {s.ip} — {s.bidder_ids.length} bidders
									</p>
									<p className="text-[11px] text-red-600 mt-1 break-all">{s.user_agent}</p>
									<p className="text-[11px] font-mono text-red-600 break-all">
										{s.bidder_ids.join(", ")}
									</p>
								</div>
							))}
						</>
					)}
				</div>
			)}
		</div>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl bg-neutral-50 border border-neutral-200 py-3">
			<p className="text-lg font-bold text-neutral-900 tabular-nums">{value}</p>
			<p className="text-[11px] uppercase tracking-wider text-neutral-400">{label}</p>
		</div>
	);
}
