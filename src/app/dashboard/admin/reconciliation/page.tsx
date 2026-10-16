"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import auctionApi from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { formatKES } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ReconReport {
	from: string;
	to: string;
	deposits_funded_kes: number;
	payments_confirmed_kes: number;
	seller_payouts_owed_kes: number;
	premiums_accrued_kes: number;
	penalties_taken_kes: number;
	ledger_imbalance_kes: number;
	overpaid_invoices: string[];
}

interface MatchResult {
	matched: string[];
	amount_mismatched: string[];
	unknown_to_us: string[];
	confirmed_unmatched: string[];
}

export default function AdminReconciliationPage() {
	const router = useRouter();
	const { user, isLoggedIn, isLoading } = useAuth();
	const [report, setReport] = useState<ReconReport | null>(null);
	const [loading, setLoading] = useState(true);
	const [file, setFile] = useState<File | null>(null);
	const [matching, setMatching] = useState(false);
	const [match, setMatch] = useState<MatchResult | null>(null);

	useEffect(() => {
		if (isLoading) return;
		if (!isLoggedIn) {
			router.replace("/login");
			return;
		}
		if (user?.role !== "admin") router.replace("/dashboard");
	}, [isLoading, isLoggedIn, user?.role, router]);

	const fetchReport = async () => {
		try {
			setLoading(true);
			const res = await auctionApi.get("/admin/reconciliation");
			setReport(res.data.data ?? null);
		} catch {
			setReport(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isLoading && isLoggedIn && user?.role === "admin") fetchReport();
		 
	}, [isLoading, isLoggedIn, user?.role]);

	if (isLoading || !isLoggedIn) return <PageLoader />;
	if (user?.role !== "admin") return null;

	const matchStatement = async () => {
		if (!file) {
			toast.error("Attach the provider statement CSV first.");
			return;
		}
		try {
			setMatching(true);
			const form = new FormData();
			form.append("statement", file);
			const res = await auctionApi.post("/admin/reconciliation/match", form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setMatch(res.data.data ?? null);
			toast.success("Statement matched.");
		} catch (err: unknown) {
			const data = (err as { response?: { data?: { error?: { message?: string } } } })
				?.response?.data?.error;
			toast.error(data?.message ?? "Could not match the statement.");
		} finally {
			setMatching(false);
		}
	};

	return (
		<div className="space-y-6">
			<header className="bg-white rounded-2xl border border-neutral-200 p-6">
				<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Admin tools</p>
				<h1 className="font-display text-3xl text-neutral-900 mt-1">Reconciliation</h1>
				<p className="text-sm text-neutral-500 mt-2 max-w-2xl">
					Every shilling grouped by what it is. An imbalance other than zero is
					a bug — nothing else matters until it is explained.
				</p>
				<Link href="/dashboard/admin" className="inline-block mt-3 text-sm font-semibold text-neutral-500 hover:text-neutral-900">
					← Seller approvals
				</Link>
			</header>

			{loading ? (
				<p className="text-sm text-neutral-400">Loading report…</p>
			) : !report ? (
				<p className="text-sm text-neutral-500">Could not build the report.</p>
			) : (
				<div className="bg-white rounded-2xl border border-neutral-200 p-6">
					<div
						className={cn(
							"rounded-xl px-4 py-3 text-sm font-bold mb-4",
							report.ledger_imbalance_kes !== 0
								? "bg-red-50 text-red-700 border border-red-200"
								: "bg-green-50 text-green-700 border border-green-200"
						)}
					>
						Ledger imbalance: {formatKES(report.ledger_imbalance_kes)}
						{report.ledger_imbalance_kes === 0 && " — books balance"}
					</div>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
						<Row label="Deposits funded" value={report.deposits_funded_kes} />
						<Row label="Payments confirmed" value={report.payments_confirmed_kes} />
						<Row label="Seller payouts owed" value={report.seller_payouts_owed_kes} />
						<Row label="Premiums accrued" value={report.premiums_accrued_kes} />
						<Row label="Penalties taken" value={report.penalties_taken_kes} />
					</dl>
					{report.overpaid_invoices.length > 0 && (
						<div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
							<p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
								Overpaid invoices
							</p>
							{report.overpaid_invoices.map((id) => (
								<p key={id} className="text-xs text-amber-700 font-mono">{id}</p>
							))}
						</div>
					)}
					<Button variant="secondary" size="sm" className="mt-4" onClick={fetchReport}>
						Refresh
					</Button>
				</div>
			)}

			<div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
				<h2 className="font-display text-xl text-neutral-900">Match a provider statement</h2>
				<p className="text-xs text-neutral-500">
					Upload the M-Pesa statement CSV (receipt, amount, phone, date). Receipts
					match by number, amounts must agree to the shilling.
				</p>
				<label className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-brand-400 hover:bg-neutral-50 transition-all">
					<span className="text-sm font-semibold text-neutral-700">
						{file ? file.name : "Choose statement CSV"}
					</span>
					<input
						type="file"
						accept=".csv,text/csv"
						onChange={(e) => {
							const f = e.target.files?.[0] ?? null;
							e.target.value = "";
							setFile(f);
							setMatch(null);
						}}
						className="sr-only"
					/>
				</label>
				<Button variant="primary" loading={matching} disabled={!file} onClick={matchStatement}>
					Match statement
				</Button>
				{match && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<MatchBox title={`Matched (${match.matched.length})`} tone="green" items={match.matched} />
						<MatchBox title={`Amount differs (${match.amount_mismatched.length})`} tone="amber" items={match.amount_mismatched} />
						<MatchBox title={`Unknown to us (${match.unknown_to_us.length})`} tone="red" items={match.unknown_to_us} />
						<MatchBox title={`Missing from statement (${match.confirmed_unmatched.length})`} tone="red" items={match.confirmed_unmatched} />
					</div>
				)}
			</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<dt className="text-sm text-neutral-500">{label}</dt>
			<dd className="text-sm font-bold text-neutral-900 tabular-nums">{formatKES(value)}</dd>
		</div>
	);
}

function MatchBox({ title, tone, items }: { title: string; tone: "green" | "amber" | "red"; items: string[] }) {
	return (
		<div
			className={cn(
				"rounded-xl border p-3",
				tone === "green" && "bg-green-50 border-green-200",
				tone === "amber" && "bg-amber-50 border-amber-200",
				tone === "red" && "bg-red-50 border-red-200"
			)}
		>
			<p
				className={cn(
					"text-xs font-bold mb-1.5",
					tone === "green" && "text-green-800",
					tone === "amber" && "text-amber-800",
					tone === "red" && "text-red-700"
				)}
			>
				{title}
			</p>
			{items.length === 0 ? (
				<p className="text-xs text-neutral-400">None</p>
			) : (
				items.slice(0, 20).map((id) => (
					<p key={id} className="text-[11px] font-mono text-neutral-600 truncate">{id}</p>
				))
			)}
		</div>
	);
}
