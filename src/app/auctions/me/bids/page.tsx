"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPreBids } from "@/hooks/useAuctions";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES, timeAgo } from "@/lib/utils";

export default function MyBidsPage() {
	const { isLoggedIn } = useAuth();
	const { bids, loading } = useMyPreBids();

	if (!isLoggedIn) {
		return (
			<div className="bg-white">
				<PageWrapper className="py-14 max-w-lg">
					<h1 className="text-2xl font-semibold text-neutral-900">My bids</h1>
					<p className="text-sm text-neutral-500 mt-2">
						Sign in to see your bids.
					</p>
					<Link href="/login" className="inline-block mt-4">
						<Button variant="primary">Sign in</Button>
					</Link>
				</PageWrapper>
			</div>
		);
	}

	if (loading) return <PageLoader />;

	return (
		<div className="bg-white">
			<PageWrapper className="py-10 max-w-2xl">
				<Link
					href="/auctions"
					className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
				>
					← All auctions
				</Link>
				<h1 className="text-2xl font-semibold text-neutral-900 mt-3">My bids</h1>

				{bids.length === 0 ? (
					<div className="mt-6">
						<EmptyState
							variant="generic"
							title="No bids yet"
							description="Your pre-bids will appear here."
							actionLabel="Browse auctions"
							actionHref="/auctions"
						/>
					</div>
				) : (
					<div className="mt-6 space-y-3">
						{bids.map((b) => (
							<Link
								key={b.id}
								href={`/auctions/lot/${b.lot_id}`}
								className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 hover:border-neutral-900 transition-colors"
							>
								<div className="min-w-0">
									<p className="text-sm font-semibold text-neutral-900">
										Max {formatKES(b.max_amount_kes)}
									</p>
									<p className="text-xs text-neutral-400 mt-0.5">
										{b.created_at ? timeAgo(b.created_at) : ""} ·{" "}
										{formatKES(b.hold_amount_kes)} held
									</p>
								</div>
								<span className="shrink-0 text-xs font-semibold text-neutral-700">
									View lot →
								</span>
							</Link>
						))}
					</div>
				)}
			</PageWrapper>
		</div>
	);
}