import PageWrapper from "@/components/layout/PageWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Auction fees",
	description: "What bidding and selling at ShikaGari auctions costs.",
};

interface Fees {
	buyer_premium_percent: number;
	platform_fee_kes: number;
	buyer_ratio_percent: number;
	dealer_ratio_percent: number;
	payment_window_hours: number;
	approval_window_hours: number;
	storage_free_days: number;
	storage_fee_per_day_kes: number;
	licensee: string;
	license_number: string;
}

async function getFees(): Promise<Fees | null> {
	const base =
		process.env.NEXT_PUBLIC_AUCTION_API_URL ?? "http://localhost:8090/api/v1";
	try {
		const res = await fetch(`${base}/auctions/fees`, { next: { revalidate: 300 } });
		if (!res.ok) return null;
		const body = await res.json();
		return body.data ?? null;
	} catch {
		return null;
	}
}

function kes(n: number) {
	return `Ksh ${Number(n ?? 0).toLocaleString()}`;
}

export default async function AuctionFeesPage() {
	const fees = await getFees();

	return (
		<div className="bg-white">
			<section className="border-b border-neutral-200">
				<PageWrapper className="py-14 max-w-2xl">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
						Published rates
					</p>
					<h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900 mt-2">
						Auction fees
					</h1>
					<p className="text-sm text-neutral-500 mt-3 leading-relaxed">
						The same figures the engine charges from — this page and your
						invoice can never disagree.
					</p>

					{!fees ? (
						<p className="text-sm text-neutral-500 mt-8">
							The fee schedule is unavailable right now.
						</p>
					) : (
						<div className="mt-8 rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
							<Row
								label="Buyer premium"
								value={`${fees.buyer_premium_percent}% of the hammer price`}
								hint="Added to every winning bid."
							/>
							<Row
								label="Platform fee"
								value={fees.platform_fee_kes > 0 ? kes(fees.platform_fee_kes) : "None"}
								hint="Flat, per completed sale."
							/>
							<Row
								label="Buyer deposit rate"
								value={`${fees.buyer_ratio_percent}% of your maximum bid`}
								hint="Held while you bid, released when you are outbid."
							/>
							<Row
								label="Dealer deposit rate"
								value={`${fees.dealer_ratio_percent}% of the maximum bid`}
								hint="Approved dealerships only."
							/>
							<Row
								label="Payment window"
								value={`${fees.payment_window_hours} hours`}
								hint="After the hammer. Unpaid sales default and the deposit is forfeited."
							/>
							<Row
								label="Approval window"
								value={`${fees.approval_window_hours} hours`}
								hint="How long a seller has to answer a below-reserve hammer."
							/>
							<Row
								label="Free storage"
								value={`${fees.storage_free_days} days after the sale`}
								hint={
									fees.storage_fee_per_day_kes > 0
										? `Then ${kes(fees.storage_fee_per_day_kes)} per day until pickup.`
										: "Then pickup at your convenience."
								}
							/>
							<Row
								label="Auctioneer"
								value={fees.licensee || "ShikaGari"}
								hint={
									fees.license_number
										? `Licence no. ${fees.license_number}.`
										: "Licence pending — public auctions open once it is granted."
								}
							/>
						</div>
					)}
				</PageWrapper>
			</section>
		</div>
	);
}

function Row({ label, value, hint }: { label: string; value: string; hint: string }) {
	return (
		<div className="px-5 py-4">
			<div className="flex items-baseline justify-between gap-4">
				<p className="text-sm font-medium text-neutral-500">{label}</p>
				<p className="text-sm font-bold text-neutral-900 text-right">{value}</p>
			</div>
			<p className="text-xs text-neutral-400 mt-1">{hint}</p>
		</div>
	);
}
