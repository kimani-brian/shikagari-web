"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import auctionApi from "@/lib/auction";
import { SessionDetail } from "@/types/auction";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES } from "@/lib/utils";

function formatDateTime(iso: string) {
	return new Date(iso).toLocaleDateString("en-KE", {
		weekday: "long",
		day: "numeric",
		month: "long",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function AuctionSessionPage() {
	const { id } = useParams<{ id: string }>();
	const [detail, setDetail] = useState<SessionDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await auctionApi.get(`/auctions/${id}`);
				if (!cancelled) setDetail(res.data.data);
			} catch {
				if (!cancelled) setError("Could not load this auction.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [id]);

	if (loading) return <PageLoader />;

	if (error || !detail) {
		return (
			<div className="bg-white">
				<PageWrapper className="py-14">
					<p className="text-sm text-neutral-500">{error ?? "Auction not found."}</p>
					<Link href="/auctions" className="inline-block mt-4">
						<Button variant="secondary" size="sm">
							Back to auctions
						</Button>
					</Link>
				</PageWrapper>
			</div>
		);
	}

	const { session, lanes, lots } = detail;
	const lotsByLane = new Map<string, typeof lots>();
	for (const lot of lots) {
		const key = lot.lane_id ?? "unscheduled";
		lotsByLane.set(key, [...(lotsByLane.get(key) ?? []), lot]);
	}

	return (
		<div className="bg-white">
			<section className="border-b border-neutral-200">
				<PageWrapper className="py-10">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
						{formatDateTime(session.starts_at)}
					</p>
					<div className="flex items-start justify-between gap-4 mt-2">
						<div>
							<h1 className="text-3xl font-semibold text-neutral-900">
								{session.name}
							</h1>
							<p className="text-sm text-neutral-500 mt-2">
								{lanes.length} {lanes.length === 1 ? "lane" : "lanes"} ·{" "}
								{lots.length} {lots.length === 1 ? "lot" : "lots"}
							</p>
						</div>
						{session.status === "live" && (
							<span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
								<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
								LIVE
							</span>
						)}
					</div>

					{lanes.length === 0 && lots.length === 0 && (
						<p className="text-sm text-neutral-500 mt-8">
							Lots for this session have not been published yet.
						</p>
					)}

					{lanes.map((lane) => (
						<div key={lane.id} className="mt-8">
							<h2 className="text-sm font-semibold text-neutral-900">
								Lane {lane.code} — {lane.name}
							</h2>
							<div className="mt-3 space-y-2">
								{(lotsByLane.get(lane.id) ?? []).map((lot) => (
									<Link
										key={lot.id}
										href={`/auctions/lot/${lot.id}`}
										className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 hover:border-neutral-900 transition-colors"
									>
										<div className="min-w-0">
											<p className="text-sm font-semibold text-neutral-900 truncate">
												{String(lot.vehicle.title ?? "Vehicle")}
											</p>
											<p className="text-xs text-neutral-400 mt-0.5">
												Opens {formatDateTime(lot.scheduled_start)} ·{" "}
												{lot.status.replace("_", " ")}
											</p>
										</div>
										<p className="shrink-0 text-sm font-semibold text-neutral-900">
											{formatKES(lot.opening_bid_kes)}
										</p>
									</Link>
								))}
								{(lotsByLane.get(lane.id) ?? []).length === 0 && (
									<p className="text-xs text-neutral-400">
										No lots assigned to this lane yet.
									</p>
								)}
							</div>
						</div>
					))}

					<div className="mt-10 rounded-2xl bg-neutral-50 border border-neutral-200 p-5">
						<p className="text-xs text-neutral-500 leading-relaxed">
							Sold by ShikaGari as auctioneer. Buyer premium applies on top of
							the hammer price, and payment is due within 72 hours. Storage
							fees start on day 3 after the sale.
						</p>
					</div>
				</PageWrapper>
			</section>
		</div>
	);
}