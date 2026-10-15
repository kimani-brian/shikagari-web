"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import auctionApi from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";
import { AuctionLot } from "@/types/auction";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES } from "@/lib/utils";

// Dealer console for pending-approval hammers: see what the top bid was and
// answer it with a price. The buyer gets 24 hours on every counter.
export default function DealerOffersPage() {
	const router = useRouter();
	const { user, isLoggedIn, isLoading } = useAuth();
	const [lots, setLots] = useState<AuctionLot[]>([]);
	const [loading, setLoading] = useState(true);
	const [amounts, setAmounts] = useState<Record<string, string>>({});
	const [busyId, setBusyId] = useState<string | null>(null);
	const [sent, setSent] = useState<Record<string, number>>({});

	useEffect(() => {
		if (isLoading) return;
		if (!isLoggedIn) {
			router.replace("/login");
			return;
		}
		if (user?.role !== "dealer" && user?.role !== "admin") {
			router.replace("/dashboard");
		}
	}, [isLoading, isLoggedIn, user?.role, router]);

	const fetchLots = async () => {
		try {
			setLoading(true);
			const res = await auctionApi.get("/dealer/lots?status=pending_approval");
			setLots(res.data.data ?? []);
		} catch {
			setLots([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isLoading && isLoggedIn && (user?.role === "dealer" || user?.role === "admin")) {
			fetchLots();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, isLoggedIn, user?.role]);

	if (isLoading || loading) return <PageLoader />;
	if (user?.role !== "dealer" && user?.role !== "admin") return null;

	const propose = async (lotId: string) => {
		const amount = Number((amounts[lotId] ?? "").replace(/[^0-9]/g, ""));
		if (!amount) {
			toast.error("Enter a counter amount.");
			return;
		}
		try {
			setBusyId(lotId);
			await auctionApi.post(`/dealer/lots/${lotId}/counter`, {
				amount_kes: amount,
			});
			toast.success("Counter-offer sent. The buyer has 24 hours.");
			setAmounts((prev) => ({ ...prev, [lotId]: "" }));
			setSent((prev) => ({ ...prev, [lotId]: amount }));
		} catch (err: unknown) {
			const data = (err as { response?: { data?: { error?: { message?: string } } } })
				?.response?.data?.error;
			toast.error(data?.message ?? "Could not send the counter-offer.");
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="bg-white">
			<PageWrapper className="py-10 max-w-2xl">
				<Link
					href="/dashboard"
					className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
				>
					← Dashboard
				</Link>
				<h1 className="text-2xl font-semibold text-neutral-900 mt-3">
					Offers to review
				</h1>
				<p className="text-sm text-neutral-500 mt-2 leading-relaxed">
					Hammers below your reserve wait here. Counter with a price and the
					winning bidder has 24 hours to take it or leave it.
				</p>

				{lots.length === 0 ? (
					<p className="text-sm text-neutral-500 mt-8">
						Nothing waiting on you right now.
					</p>
				) : (
					<div className="mt-6 space-y-4">
						{lots.map((lot) => (
							<div
								key={lot.id}
								className="rounded-2xl border border-neutral-200 p-5 space-y-3"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="text-sm font-semibold text-neutral-900">
											{String(lot.vehicle.title ?? "Vehicle")}
										</p>
										<p className="text-xs text-neutral-400 mt-0.5">
											Hammered at {formatKES(lot.current_price_kes)} ·
											reserve not met
										</p>
									</div>
								</div>
								{sent[lot.id] != null && (
									<p className="text-xs text-neutral-500">
										Counter sent:{" "}
										<span className="font-semibold text-neutral-900">
											{formatKES(sent[lot.id])}
										</span>{" "}
										— waiting on the buyer. Sending again replaces it.
									</p>
								)}
								<div className="flex gap-2">
									<Input
										label=""
										type="text"
										inputMode="numeric"
										value={amounts[lot.id] ?? ""}
										onChange={(e) =>
											setAmounts((prev) => ({ ...prev, [lot.id]: e.target.value }))
										}
										placeholder="Counter amount (KES)"
									/>
									<Button
										variant="primary"
										loading={busyId === lot.id}
										onClick={() => propose(lot.id)}
									>
										Send
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</PageWrapper>
		</div>
	);
}