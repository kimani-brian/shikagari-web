"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import auctionApi from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Input";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Dispute {
	id: string;
	reporter_id: string;
	entity_type: string;
	entity_id: string;
	reason: string;
	status: string;
	resolution: string;
	created_at: string;
}

const ACTIONS = [
	{ value: "dismiss", label: "Dismiss — reporter was wrong, nothing moves" },
	{ value: "refund_forfeit", label: "Refund — return forfeited money from the invoice" },
	{ value: "cancel_sale", label: "Cancel sale — unwind it, lot back to market" },
];

export default function AdminDisputesPage() {
	const router = useRouter();
	const { user, isLoggedIn, isLoading } = useAuth();
	const [status, setStatus] = useState("");
	const [disputes, setDisputes] = useState<Dispute[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionFor, setActionFor] = useState<Record<string, string>>({ dismiss: "dismiss" });
	const [busyId, setBusyId] = useState<string | null>(null);

	useEffect(() => {
		if (isLoading) return;
		if (!isLoggedIn) {
			router.replace("/login");
			return;
		}
		if (user?.role !== "admin") router.replace("/dashboard");
	}, [isLoading, isLoggedIn, user?.role, router]);

	const fetchDisputes = async () => {
		try {
			setLoading(true);
			const res = await auctionApi.get("/admin/disputes", { params: status ? { status } : {} });
			setDisputes(res.data.data ?? []);
		} catch {
			setDisputes([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isLoading && isLoggedIn && user?.role === "admin") fetchDisputes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, isLoggedIn, user?.role, status]);

	if (isLoading || !isLoggedIn) return <PageLoader />;
	if (user?.role !== "admin") return null;

	const resolve = async (id: string) => {
		const action = actionFor[id] ?? "dismiss";
		try {
			setBusyId(id);
			await auctionApi.post(`/admin/disputes/${id}/resolve`, {
				action,
				resolution: "",
			});
			toast.success("Dispute resolved.");
			fetchDisputes();
		} catch (err: unknown) {
			const data = (err as { response?: { data?: { error?: { message?: string } } } })
				?.response?.data?.error;
			toast.error(data?.message ?? "Could not resolve.");
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="space-y-6">
			<header className="bg-white rounded-2xl border border-neutral-200 p-6">
				<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Admin tools</p>
				<h1 className="font-display text-3xl text-neutral-900 mt-1">Disputes</h1>
				<div className="flex flex-wrap items-center gap-3 mt-4">
					<Link href="/dashboard/admin" className="text-sm font-semibold text-neutral-500 hover:text-neutral-900">
						← Seller approvals
					</Link>
					<SelectField
						label=""
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						options={[
							{ value: "", label: "All statuses" },
							{ value: "open", label: "Open" },
							{ value: "in_review", label: "In review" },
							{ value: "resolved", label: "Resolved" },
							{ value: "refunded", label: "Refunded" },
							{ value: "sale_cancelled", label: "Sale cancelled" },
							{ value: "dismissed", label: "Dismissed" },
						]}
					/>
				</div>
			</header>

			{loading ? (
				<p className="text-sm text-neutral-400">Loading disputes…</p>
			) : disputes.length === 0 ? (
				<p className="text-sm text-neutral-500">No disputes in this view.</p>
			) : (
				<div className="space-y-3">
					{disputes.map((d) => (
						<article key={d.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="text-sm font-semibold text-neutral-900">
										{d.entity_type} · <span className="font-mono text-xs">{d.entity_id.slice(0, 8)}</span>
									</p>
									<p className="text-xs text-neutral-400 mt-0.5">
										{d.created_at ? timeAgo(d.created_at) : ""}
									</p>
								</div>
								<span
									className={cn(
										"shrink-0 text-xs font-bold uppercase tracking-wide",
										d.status === "open" ? "text-red-600" : "text-neutral-500"
									)}
								>
									{d.status.replace("_", " ")}
								</span>
							</div>
							<p className="text-sm text-neutral-700 leading-relaxed border-l-2 border-neutral-200 pl-3">
								{d.reason}
							</p>
							{d.resolution && (
								<p className="text-xs text-neutral-500">
									Resolution: {d.resolution}
								</p>
							)}
							{(d.status === "open" || d.status === "in_review") && (
								<div className="flex flex-col sm:flex-row gap-2">
									<SelectField
										label=""
										value={actionFor[d.id] ?? "dismiss"}
										onChange={(e) =>
											setActionFor((prev) => ({ ...prev, [d.id]: e.target.value }))
										}
										options={ACTIONS.map((a) => ({ value: a.value, label: a.label }))}
									/>
									<Button
										variant="primary"
										size="sm"
										loading={busyId === d.id}
										onClick={() => resolve(d.id)}
										className="shrink-0"
									>
										Resolve
									</Button>
								</div>
							)}
						</article>
					))}
				</div>
			)}
		</div>
	);
}
