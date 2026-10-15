"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import auctionApi from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";
import { useMyListings } from "@/hooks/useListings";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input, { SelectField } from "@/components/ui/Input";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES } from "@/lib/utils";

// Dealer-only: turns one of the dealer's own live listings into an auction
// lot. Ownership and dealer approval are checked again by the engine — the
// form listing is convenience, not authority.
export default function ConvertLotPage() {
	const router = useRouter();
	const { user, isLoggedIn, isLoading } = useAuth();
	const { listings, loading: listingsLoading } = useMyListings(1, 50);

	const [listingId, setListingId] = useState("");
	const [saleType, setSaleType] = useState("pure_sale");
	const [reserve, setReserve] = useState("");
	const [opening, setOpening] = useState("");
	const [increment, setIncrement] = useState("50000");
	const [startsAt, setStartsAt] = useState("");
	const [busy, setBusy] = useState(false);
	const [apiError, setApiError] = useState("");

	useEffect(() => {
		if (!isLoading && !isLoggedIn) router.replace("/login");
	}, [isLoading, isLoggedIn, router]);

	if (isLoading || listingsLoading) return <PageLoader />;

	if (user?.role !== "dealer") {
		return (
			<div className="bg-white">
				<PageWrapper className="py-14 max-w-lg">
					<h1 className="text-2xl font-semibold text-neutral-900">
						Dealers only
					</h1>
					<p className="text-sm text-neutral-500 mt-2">
						Only approved dealerships can put cars up for auction.
					</p>
					<Link href="/register?role=dealer" className="inline-block mt-4">
						<Button variant="primary">Register as a dealer</Button>
					</Link>
				</PageWrapper>
			</div>
		);
	}

	const liveListings = listings.filter((l) => l.status === "active");

	const submit = async () => {
		setApiError("");
		const openingKES = Number(opening.replace(/[^0-9]/g, ""));
		const incrementKES = Number(increment.replace(/[^0-9]/g, ""));
		const reserveKES = Number(reserve.replace(/[^0-9]/g, "")) || 0;

		if (!listingId) {
			setApiError("Choose the car to auction.");
			return;
		}
		if (!openingKES || !incrementKES) {
			setApiError("Enter an opening bid and a bid increment.");
			return;
		}
		if (saleType !== "pure_sale" && !reserveKES) {
			setApiError("This sale type needs a reserve price.");
			return;
		}
		if (!startsAt) {
			setApiError("Choose when the lot should open.");
			return;
		}

		try {
			setBusy(true);
			const res = await auctionApi.post("/lots", {
				listing_id: listingId,
				sale_type: saleType,
				reserve_price_kes: reserveKES,
				opening_bid_kes: openingKES,
				increment_kes: incrementKES,
				scheduled_start: new Date(startsAt).toISOString(),
			});
			toast.success("Lot scheduled for auction.");
			router.push(`/auctions/lot/${res.data.data.id}`);
		} catch (err: unknown) {
			const data = (err as { response?: { data?: { error?: { message?: string } } } })
				?.response?.data?.error;
			const msg = data?.message ?? "Could not schedule this lot.";
			setApiError(msg);
			toast.error(msg);
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="bg-white">
			<PageWrapper className="py-10 max-w-xl">
				<Link
					href="/dashboard/listings"
					className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
				>
					← My listings
				</Link>
				<h1 className="text-2xl font-semibold text-neutral-900 mt-3">
					Auction a car
				</h1>
				<p className="text-sm text-neutral-500 mt-2 leading-relaxed">
					Pick one of your live listings. Its photos and details are frozen
					into the lot, so what bidders see is exactly what you listed.
				</p>

				{apiError && (
					<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
						{apiError}
					</div>
				)}

				<div className="mt-6 space-y-4">
					<SelectField
						label="Car to auction"
						value={listingId}
						onChange={(e) => setListingId(e.target.value)}
						options={[
							{ value: "", label: liveListings.length ? "Select a car" : "No live listings" },
							...liveListings.map((l) => ({
								value: l.id,
								label: `${l.title} — ${formatKES(l.price_kes)}`,
							})),
						]}
						required
					/>

					<SelectField
						label="Sale type"
						value={saleType}
						onChange={(e) => setSaleType(e.target.value)}
						options={[
							{ value: "pure_sale", label: "Pure sale — highest bid wins, no reserve" },
							{ value: "reserve", label: "Reserve — hidden minimum, you approve below it" },
							{ value: "on_approval", label: "On approval — you decide on every winning bid" },
						]}
						required
					/>

					{saleType !== "pure_sale" && (
						<Input
							label="Reserve price (KES)"
							type="text"
							inputMode="numeric"
							value={reserve}
							onChange={(e) => setReserve(e.target.value)}
							placeholder="2000000"
							hint="Hidden from bidders. You approve anything below it."
							required
						/>
					)}

					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Opening bid (KES)"
							type="text"
							inputMode="numeric"
							value={opening}
							onChange={(e) => setOpening(e.target.value)}
							placeholder="1000000"
							required
						/>
						<Input
							label="Bid increment (KES)"
							type="text"
							inputMode="numeric"
							value={increment}
							onChange={(e) => setIncrement(e.target.value)}
							placeholder="50000"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-neutral-700 mb-1.5">
							Opens at
						</label>
						<input
							type="datetime-local"
							value={startsAt}
							onChange={(e) => setStartsAt(e.target.value)}
							className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
							required
						/>
					</div>

					<Button variant="primary" fullWidth loading={busy} onClick={submit}>
						Schedule lot
					</Button>
				</div>
			</PageWrapper>
		</div>
	);
}