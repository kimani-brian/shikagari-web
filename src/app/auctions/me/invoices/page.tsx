"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import auctionApi from "@/lib/auction";
import { Invoice } from "@/types/settlement";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
	issued: "text-amber-700",
	part_paid: "text-amber-700",
	paid: "text-green-700",
	defaulted: "text-red-700",
};

export default function MyInvoicesPage() {
	const { isLoggedIn } = useAuth();
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await auctionApi.get("/me/invoices");
				if (!cancelled) setInvoices(res.data.data ?? []);
			} catch {
				if (!cancelled) setInvoices([]);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	if (!isLoggedIn) {
		return (
			<div className="bg-white">
				<PageWrapper className="py-14 max-w-lg">
					<h1 className="text-2xl font-semibold text-neutral-900">My invoices</h1>
					<p className="text-sm text-neutral-500 mt-2">Sign in to see your invoices.</p>
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
				<h1 className="text-2xl font-semibold text-neutral-900 mt-3">My invoices</h1>

				{invoices.length === 0 ? (
					<div className="mt-6">
						<EmptyState
							variant="generic"
							title="No invoices yet"
							description="Win a lot and the bill appears here."
							actionLabel="Browse auctions"
							actionHref="/auctions"
						/>
					</div>
				) : (
					<div className="mt-6 space-y-3">
						{invoices.map((inv) => (
							<Link
								key={inv.id}
								href={`/auctions/invoices/${inv.id}`}
								className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 hover:border-neutral-900 transition-colors"
							>
								<div className="min-w-0">
									<p className="text-sm font-semibold text-neutral-900 truncate">
										{inv.lot_title || "Auction invoice"}
									</p>
									<p className="text-xs text-neutral-400 mt-0.5">
										{inv.created_at ? timeAgo(inv.created_at) : ""} ·{" "}
										<span className={cn("font-semibold capitalize", TONE[inv.status] ?? "text-neutral-500")}>
											{inv.status.replace("_", " ")}
										</span>
									</p>
								</div>
								<p className="shrink-0 text-sm font-bold text-neutral-900 tabular-nums">
									{formatKES(inv.total_kes)}
								</p>
							</Link>
						))}
					</div>
				)}
			</PageWrapper>
		</div>
	);
}