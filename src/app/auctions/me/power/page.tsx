"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import auctionApi from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";
import { useBuyingPower } from "@/hooks/useAuctions";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BuyingPowerMeter from "@/components/auctions/BuyingPowerMeter";
import { PageLoader } from "@/components/shared/LoadingSpinner";

export default function BuyingPowerPage() {
	const { isLoggedIn } = useAuth();
	const { power, loading, refetch } = useBuyingPower();
	const [phone, setPhone] = useState("");
	const [amount, setAmount] = useState("");
	const [busy, setBusy] = useState(false);

	if (!isLoggedIn) {
		return (
			<div className="bg-white">
				<PageWrapper className="py-14 max-w-lg">
					<h1 className="text-2xl font-semibold text-neutral-900">Buying power</h1>
					<p className="text-sm text-neutral-500 mt-2">
						Sign in to fund your deposit and bid.
					</p>
					<Link href="/login" className="inline-block mt-4">
						<Button variant="primary">Sign in</Button>
					</Link>
				</PageWrapper>
			</div>
		);
	}

	if (loading) return <PageLoader />;

	const topUp = async () => {
		const kes = Number(amount.replace(/[^0-9]/g, ""));
		if (!phone.trim() || phone.replace(/[^0-9]/g, "").length < 9) {
			toast.error("Enter the M-Pesa number to charge.");
			return;
		}
		if (!kes || kes < 100) {
			toast.error("Minimum top-up is KES 100.");
			return;
		}
		try {
			setBusy(true);
			await auctionApi.post("/me/deposits", {
				phone: phone.trim(),
				amount_kes: kes,
			});
			toast.success("Deposit received.");
			setPhone("");
			setAmount("");
			refetch();
		} catch (err: unknown) {
			const data = (err as { response?: { data?: { error?: { message?: string } } } })
				?.response?.data?.error;
			toast.error(data?.message ?? "Could not start the deposit.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="bg-white">
			<PageWrapper className="py-10 max-w-lg">
				<Link
					href="/auctions"
					className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
				>
					← All auctions
				</Link>
				<h1 className="text-2xl font-semibold text-neutral-900 mt-3">
					Buying power
				</h1>
				<p className="text-sm text-neutral-500 mt-2 leading-relaxed">
					Your deposit backs your bids. A KES 4,000,000 bid needs KES 400,000
					held. Money locked on a bid is released the moment you are outbid.
				</p>

				<div className="mt-6">
					<BuyingPowerMeter
						deposited={power?.deposited_kes ?? 0}
						held={power?.held_kes ?? 0}
						ratioPercent={power?.ratio_percent}
						tier={power?.tier}
					/>
				</div>

				<form
					className="mt-4 rounded-2xl border border-neutral-200 p-5 space-y-3"
					onSubmit={(e) => {
						e.preventDefault();
						topUp();
					}}
				>
					<h2 className="text-sm font-semibold text-neutral-900">
						Top up with M-Pesa
					</h2>
					<Input
						label="M-Pesa number"
						type="tel"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="0712 345 678"
						autoComplete="tel"
						required
					/>
					<Input
						label="Amount (KES)"
						type="text"
						inputMode="numeric"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="400000"
						required
					/>
					<Button variant="primary" fullWidth type="submit" loading={busy}>
						Send deposit request
					</Button>
					<p className="text-xs text-neutral-400">
						You will get an M-Pesa prompt on your phone to approve.
					</p>
				</form>
			</PageWrapper>
		</div>
	);
}
