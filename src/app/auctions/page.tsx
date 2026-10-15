"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import auctionApi from "@/lib/auction";
import { AuctionSession } from "@/types/auction";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { timeAgo } from "@/lib/utils";

function formatSessionDate(iso: string) {
	const d = new Date(iso);
	return d.toLocaleDateString("en-KE", {
		weekday: "short",
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function AuctionsCalendarPage() {
	const [sessions, setSessions] = useState<AuctionSession[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await auctionApi.get("/auctions");
				if (!cancelled) setSessions(res.data.data ?? []);
			} catch {
				if (!cancelled) setError("Could not load the auction calendar.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) return <PageLoader />;

	return (
		<div className="bg-white">
			<section className="border-b border-neutral-200">
				<PageWrapper className="py-14">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
						Timed vehicle sales
					</p>
					<h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900 mt-2">
						Auctions
					</h1>
					<p className="text-sm text-neutral-500 mt-3 max-w-2xl leading-relaxed">
						Dealers list cars for timed bidding. Fund a deposit once, then bid
						from your phone — no haggling, no ghosting.
					</p>

					{error && (
						<div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
							{error}
						</div>
					)}

					{!error && sessions.length === 0 && (
						<div className="mt-8">
							<EmptyState
								variant="generic"
								title="No auctions scheduled"
								description="The next sale has not been announced yet. Browse the marketplace meanwhile."
								actionLabel="Browse vehicles"
								actionHref="/listings"
							/>
						</div>
					)}

					{!error && sessions.length > 0 && (
						<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
							{sessions.map((s) => (
								<Link
									key={s.id}
									href={`/auctions/session/${s.id}`}
									className="block rounded-2xl border border-neutral-200 bg-white p-6 shadow-card hover:shadow-nav hover:-translate-y-0.5 transition-all"
								>
									<div className="flex items-center justify-between gap-2">
										<p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
											{formatSessionDate(s.starts_at)}
										</p>
										{s.status === "live" && (
											<span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
												<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
												LIVE
											</span>
										)}
									</div>
									<h2 className="text-lg font-semibold text-neutral-900 mt-2">
										{s.name}
									</h2>
									<p className="text-xs text-neutral-400 mt-1">
										Announced {timeAgo(s.created_at)}
									</p>
									<span className="inline-block mt-4 text-sm font-semibold text-neutral-900">
										View lots →
									</span>
								</Link>
							))}
						</div>
					)}

					<div className="mt-10 rounded-2xl bg-neutral-50 border border-neutral-200 p-5">
						<p className="text-xs text-neutral-500 leading-relaxed">
							Sold by ShikaGari as auctioneer. Buyer premium and payment terms
							are shown on every lot before you bid — never only on the
							invoice.
						</p>
						<div className="flex flex-wrap gap-3 mt-4">
							<Link href="/register?role=dealer">
								<Button variant="secondary" size="sm">
									Register as a dealer
								</Button>
							</Link>
						</div>
					</div>
				</PageWrapper>
			</section>
		</div>
	);
}