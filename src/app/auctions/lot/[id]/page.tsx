"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import auctionApi from "@/lib/auction";
import { API_ORIGIN } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { useAuctionLot, useBuyingPower } from "@/hooks/useAuctions";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES, formatMileage, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Image URLs from the frozen snapshot may be marketplace-relative paths.
function imgSrc(path: string) {
	if (!path) return "";
	if (path.startsWith("http")) return path;
	return `${API_ORIGIN}${path}`;
}

export default function AuctionLotPage() {
	const { id } = useParams<{ id: string }>();
	const { isLoggedIn } = useAuth();
	const { lot, loading, error, refetch } = useAuctionLot(id);
	const { power, refetch: refetchPower } = useBuyingPower();

	const [maxAmount, setMaxAmount] = useState("");
	const [busy, setBusy] = useState(false);
	const [activePhoto, setActivePhoto] = useState(0);

	if (loading) return <PageLoader />;

	if (error || !lot) {
		return (
			<div className="bg-white">
				<PageWrapper className="py-14">
					<p className="text-sm text-neutral-500">{error ?? "Lot not found."}</p>
					<Link href="/auctions" className="inline-block mt-4">
						<Button variant="secondary" size="sm">
							Back to auctions
						</Button>
					</Link>
				</PageWrapper>
			</div>
		);
	}

	const liveNow = lot.status === "on_block" || lot.status === "open";
	const v = lot.vehicle ?? ({} as Record<string, string | number | string[]>);
	const photos = (Array.isArray(v.images) ? v.images : []) as string[];
	const current = photos[activePhoto] ?? photos[0];
	const preBiddingOpen = lot.status === "scheduled";

	const submitPreBid = async () => {
		const max = Number(maxAmount.replace(/[^0-9]/g, ""));
		if (!max || max < lot.opening_bid_kes) {
			toast.error(`Your maximum must reach ${formatKES(lot.opening_bid_kes)}.`);
			return;
		}
		try {
			setBusy(true);
			await auctionApi.post(`/me/lots/${lot.id}/pre-bids`, {
				max_amount_kes: max,
			});
			toast.success("Pre-bid recorded. The system will bid for you up to your maximum.");
			setMaxAmount("");
			refetch();
			refetchPower();
		} catch (err: unknown) {
			const data = (err as { response?: { data?: { error?: { message?: string } } } })
				?.response?.data?.error;
			toast.error(data?.message ?? "Could not place your pre-bid.");
		} finally {
			setBusy(false);
		}
	};

	const withdrawPreBid = async () => {
		try {
			setBusy(true);
			await auctionApi.delete(`/me/lots/${lot.id}/pre-bids`);
			toast.success("Pre-bid withdrawn. Your hold is released.");
			refetch();
			refetchPower();
		} catch (err: unknown) {
			const data = (err as { response?: { data?: { error?: { message?: string } } } })
				?.response?.data?.error;
			toast.error(data?.message ?? "Could not withdraw the pre-bid.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="bg-white">
			<PageWrapper className="py-8">
				<Link
					href="/auctions"
					className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
				>
					← All auctions
				</Link>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
					{/* Vehicle */}
					<div className="lg:col-span-2 space-y-5">
						<div className="rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-100">
							<div className="relative aspect-[16/10]">
								{current ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={imgSrc(current)}
										alt={String(v.title ?? "Vehicle")}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-neutral-400">
										<Icon name="directions_car" size={36} />
									</div>
								)}
							</div>
							{photos.length > 1 && (
								<div className="flex gap-1.5 overflow-x-auto p-2 bg-white border-t border-neutral-200">
									{photos.map((p, i) => (
										<button
											key={`${p}-${i}`}
											type="button"
											onClick={() => setActivePhoto(i)}
											aria-label={`Show photo ${i + 1}`}
											className={cn(
												"w-16 h-12 shrink-0 rounded-lg overflow-hidden",
												i === activePhoto
													? "ring-2 ring-neutral-900"
													: "opacity-60 hover:opacity-100"
											)}
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img src={imgSrc(p)} alt="" className="w-full h-full object-cover" />
										</button>
									))}
								</div>
							)}
						</div>

						<div>
							<h1 className="text-2xl font-semibold text-neutral-900">
								{String(v.title ?? "Vehicle")}
							</h1>
							<p className="text-sm text-neutral-500 mt-1">
								{String(v.location ?? "")} · Listed{" "}
								{lot.created_at ? timeAgo(lot.created_at) : ""}
							</p>
						</div>

						<dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 rounded-2xl border border-neutral-200 p-5">
							{spec("Year", String(v.year ?? "—"))}
							{spec("Mileage", v.mileage ? formatMileage(Number(v.mileage)) : "—")}
							{spec("Fuel", String(v.fuel_type ?? "—"))}
							{spec("Transmission", String(v.transmission ?? "—"))}
							{spec("Body", String(v.body_type ?? "—"))}
							{spec("Drive", String(v.drivetrain || "—"))}
							{spec("Engine", String(v.engine_size || "—"))}
							{spec("Colour", String(v.color || "—"))}
						</dl>

						{v.description ? (
							<p className="text-sm text-neutral-600 leading-relaxed">
								{String(v.description)}
							</p>
						) : null}
					</div>

					{/* Bid panel */}
					<div className="space-y-4">
						<div className="rounded-2xl border border-neutral-200 p-5">
							<div className="flex items-baseline justify-between gap-3">
								<div>
									<p className="text-[11px] uppercase tracking-wider text-neutral-400">
										Opening bid
									</p>
									<p className="text-2xl font-semibold text-neutral-900">
										{formatKES(lot.opening_bid_kes)}
									</p>
								</div>
								<span className="text-xs font-semibold text-neutral-500 capitalize">
									{lot.status.replace("_", " ")}
								</span>
							</div>

							<div className="mt-4 rounded-xl bg-neutral-50 border border-neutral-200 p-3">
								{lot.sale_type === "pure_sale" ? (
									<p className="text-xs text-neutral-600">
										<span className="font-semibold text-neutral-900">
											No reserve.
										</span>{" "}
										The highest bid wins when the clock runs out.
									</p>
								) : (
									<p className="text-xs text-neutral-600">
										<span className="font-semibold text-neutral-900">
											Reserve: not disclosed.
										</span>{" "}
										If bidding stops below it, the dealer decides
										whether to accept.
									</p>
								)}
							</div>

							{!isLoggedIn ? (
								<div className="mt-4">
									<Link href="/login">
										<Button variant="primary" fullWidth>
											Sign in to bid
										</Button>
									</Link>
									<p className="text-xs text-neutral-400 mt-2 text-center">
										Guests can look, but only signed-in buyers can bid.
									</p>
								</div>
							) : liveNow ? (
								<div className="mt-4 space-y-3">
									<Link href={`/auctions/room/${lot.id}`}>
										<Button variant="primary" fullWidth size="lg">
											Join the live room
										</Button>
									</Link>
									<p className="text-xs text-neutral-400 text-center">
										This lot is on the block right now.
									</p>
								</div>
							) : preBiddingOpen ? (
								<div className="mt-4 space-y-3">
									<Input
										label="Your maximum bid (KES)"
										type="text"
										inputMode="numeric"
										value={maxAmount}
										onChange={(e) => setMaxAmount(e.target.value)}
										placeholder={String(lot.opening_bid_kes)}
										hint="The system bids for you up to this amount — never above it."
									/>
									<Button
										variant="primary"
										fullWidth
										loading={busy}
										onClick={submitPreBid}
									>
										Place pre-bid
									</Button>
									<button
										type="button"
										onClick={withdrawPreBid}
										disabled={busy}
										className="w-full text-xs font-semibold text-neutral-500 hover:text-neutral-900 disabled:opacity-50"
									>
										Withdraw my pre-bid
									</button>
								</div>
							) : (
								<p className="text-sm text-neutral-500 mt-4">
									Pre-bidding has closed for this lot.
								</p>
							)}
						</div>

						{isLoggedIn && (
							<div className="rounded-2xl border border-neutral-200 p-5">
								<h2 className="text-sm font-semibold text-neutral-900">
									Your buying power
								</h2>
								{power ? (
									<div className="mt-2 space-y-1 text-sm">
										<PowerRow label="Deposited" value={formatKES(power.deposited_kes)} />
										<PowerRow label="Held on bids" value={formatKES(power.held_kes)} />
										<PowerRow label="Free" value={formatKES(power.available_kes)} strong />
										<p className="text-xs text-neutral-400 pt-1">
											Covers bids up to {formatKES(power.max_bid_kes)}.
										</p>
									</div>
								) : (
									<p className="text-xs text-neutral-400 mt-2">
										Fund a deposit to unlock bidding.
									</p>
								)}
								<Link href="/auctions/me/power" className="block mt-3">
									<Button variant="secondary" size="sm" fullWidth>
										Top up deposit
									</Button>
								</Link>
							</div>
						)}

						<div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
							<p className="text-xs text-neutral-500 leading-relaxed">
								Sold by ShikaGari as auctioneer. Buyer premium applies on top
								of the hammer price. Payment is due within 72 hours.
							</p>
						</div>
					</div>
				</div>
			</PageWrapper>
		</div>
	);
}

function spec(label: string, value: string) {
	return (
		<div className="min-w-0">
			<dt className="text-[10px] uppercase tracking-wider text-neutral-400">
				{label}
			</dt>
			<dd className="text-sm font-medium text-neutral-900 capitalize truncate">
				{value}
			</dd>
		</div>
	);
}

function PowerRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-neutral-500 text-xs">{label}</span>
			<span className={cn("text-sm", strong ? "font-bold text-neutral-900" : "font-medium text-neutral-700")}>
				{value}
			</span>
		</div>
	);
}
