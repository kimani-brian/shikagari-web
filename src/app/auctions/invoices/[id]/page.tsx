"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import auctionApi from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";
import { Invoice } from "@/types/settlement";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Countdown to the payment deadline, rendered from the server's timestamp so
// a skewed device clock cannot invent extra hours.
function useCountdown(targetIso: string | null) {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		if (!targetIso) return;
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [targetIso]);
	if (!targetIso) return null;
	const ms = Math.max(0, Date.parse(targetIso) - now);
	return {
		overdue: ms <= 0,
		hours: Math.floor(ms / 3_600_000),
		minutes: Math.floor((ms % 3_600_000) / 60_000),
	};
}

const STATUS_COPY: Record<string, { title: string; tone: string }> = {
	issued: { title: "Payment due", tone: "text-amber-700" },
	part_paid: { title: "Partly paid", tone: "text-amber-700" },
	paid: { title: "Paid in full", tone: "text-green-700" },
	defaulted: { title: "Defaulted", tone: "text-red-700" },
	refunded: { title: "Refunded", tone: "text-neutral-500" },
	disputed: { title: "Under review", tone: "text-neutral-500" },
};

export default function InvoicePage() {
	const { id } = useParams<{ id: string }>();
	const { isLoggedIn } = useAuth();
	const [invoice, setInvoice] = useState<Invoice | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [phone, setPhone] = useState("");
	const [paying, setPaying] = useState(false);
	const countdown = useCountdown(invoice?.payment_due_at ?? null);

	const fetchInvoice = async () => {
		try {
			setLoading(true);
			const res = await auctionApi.get(`/invoices/${id}`);
			setInvoice(res.data.data ?? null);
		} catch {
			setError("Could not load this invoice.");
			setInvoice(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInvoice();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	if (!isLoggedIn) {
		return (
			<div className="bg-white">
				<PageWrapper className="py-14 max-w-lg">
					<h1 className="text-2xl font-semibold text-neutral-900">Invoice</h1>
					<p className="text-sm text-neutral-500 mt-2">Sign in to view this invoice.</p>
					<Link href="/login" className="inline-block mt-4">
						<Button variant="primary">Sign in</Button>
					</Link>
				</PageWrapper>
			</div>
		);
	}

	if (loading) return <PageLoader />;

	if (error || !invoice) {
		return (
			<div className="bg-white">
				<PageWrapper className="py-14 max-w-lg">
					<p className="text-sm text-neutral-500">{error ?? "Invoice not found."}</p>
				</PageWrapper>
			</div>
		);
	}

	const status = STATUS_COPY[invoice.status] ?? STATUS_COPY.issued;
	const payable = invoice.status === "issued" || invoice.status === "part_paid";

	const pay = async () => {
		if (!phone.trim() || phone.replace(/[^0-9]/g, "").length < 9) {
			toast.error("Enter the M-Pesa number to charge.");
			return;
		}
		try {
			setPaying(true);
			await auctionApi.post(`/invoices/${invoice.id}/pay`, { phone: phone.trim() });
			toast.success("Approve the M-Pesa prompt on your phone.");
			setPhone("");
			setTimeout(fetchInvoice, 3000);
		} catch (err: unknown) {
			const data = (err as { response?: { data?: { error?: { message?: string } } } })
				?.response?.data?.error;
			toast.error(data?.message ?? "Could not start the payment.");
		} finally {
			setPaying(false);
		}
	};

	return (
		<div className="bg-white">
			<PageWrapper className="py-10 max-w-xl">
				<Link
					href="/auctions/me/invoices"
					className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
				>
					← My invoices
				</Link>
				<div className="mt-3 flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold text-neutral-900">
							{invoice.lot_title || "Auction invoice"}
						</h1>
						<p className="text-xs text-neutral-400 mt-1">
							Issued {invoice.created_at ? timeAgo(invoice.created_at) : ""}
						</p>
					</div>
					<span className={cn("shrink-0 text-sm font-bold", status.tone)}>
						{status.title}
					</span>
				</div>

				<div className="mt-5 rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
					{(invoice.lines ?? []).map((line) => (
						<div key={line.label} className="flex items-center justify-between px-5 py-3">
							<span className="text-sm text-neutral-600">{line.label}</span>
							<span className="text-sm font-semibold text-neutral-900 tabular-nums">
								{formatKES(line.amount_kes)}
							</span>
						</div>
					))}
					<div className="flex items-center justify-between px-5 py-3 bg-neutral-50 rounded-b-2xl">
						<span className="text-sm font-bold text-neutral-900">Total due</span>
						<span className="text-base font-bold text-neutral-900 tabular-nums">
							{formatKES(invoice.total_kes)}
						</span>
					</div>
				</div>

				{payable && countdown && !countdown.overdue && (
					<div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs font-medium text-amber-800 tabular-nums">
						Pay within {countdown.hours}h {countdown.minutes}m or the sale
						defaults and your deposit is forfeited.
					</div>
				)}
				{payable && countdown?.overdue && (
					<div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
						This invoice is overdue. Pay now to avoid default.
					</div>
				)}

				{payable ? (
					<form
						className="mt-4 rounded-2xl border border-neutral-200 p-5 space-y-3"
						onSubmit={(e) => {
							e.preventDefault();
							pay();
						}}
					>
						<h2 className="text-sm font-semibold text-neutral-900">
							Pay with M-Pesa
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
						<Button variant="primary" fullWidth type="submit" loading={paying}>
							Pay {formatKES(invoice.total_kes)}
						</Button>
					</form>
				) : invoice.status === "defaulted" ? (
					<div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
						<p className="text-sm text-red-800 leading-relaxed">
							This sale defaulted on non-payment. The deposit was forfeited
							and the car goes back to auction.
						</p>
					</div>
				) : invoice.status === "paid" ? (
					<div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">
						<p className="text-sm text-green-800 leading-relaxed">
							Paid in full
							{invoice.paid_at ? ` ${timeAgo(invoice.paid_at)}` : ""}. Arrange
							pickup with the seller within 3 days to avoid storage fees.
						</p>
					</div>
				) : null}
			</PageWrapper>
		</div>
	);
}