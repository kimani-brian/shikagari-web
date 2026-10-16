"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import auctionApi from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { timeAgo } from "@/lib/utils";

interface AuditEntry {
	id: number;
	actor_id: string;
	actor_role: string;
	entity_type: string;
	entity_id: string;
	action: string;
	created_at: string;
}

export default function AdminAuditPage() {
	const router = useRouter();
	const { user, isLoggedIn, isLoading } = useAuth();
	const [entityType, setEntityType] = useState("");
	const [entityId, setEntityId] = useState("");
	const [entries, setEntries] = useState<AuditEntry[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isLoading) return;
		if (!isLoggedIn) {
			router.replace("/login");
			return;
		}
		if (user?.role !== "admin") router.replace("/dashboard");
	}, [isLoading, isLoggedIn, user?.role, router]);

	const fetchAudit = async () => {
		try {
			setLoading(true);
			const params: Record<string, string> = {};
			if (entityType.trim()) params.entity_type = entityType.trim();
			if (entityId.trim()) params.entity_id = entityId.trim();
			const res = await auctionApi.get("/admin/audit", { params });
			setEntries(res.data.data ?? []);
		} catch {
			setEntries([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isLoading && isLoggedIn && user?.role === "admin") fetchAudit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, isLoggedIn, user?.role]);

	if (isLoading || !isLoggedIn) return <PageLoader />;
	if (user?.role !== "admin") return null;

	return (
		<div className="space-y-6">
			<header className="bg-white rounded-2xl border border-neutral-200 p-6">
				<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Admin tools</p>
				<h1 className="font-display text-3xl text-neutral-900 mt-1">Audit log</h1>
				<p className="text-sm text-neutral-500 mt-2 max-w-2xl">
					The compliance record. Append-only — corrections are compensating
					entries, never edits.
				</p>
				<Link href="/dashboard/admin" className="inline-block mt-3 text-sm font-semibold text-neutral-500 hover:text-neutral-900">
					← Seller approvals
				</Link>
			</header>

			<div className="bg-white rounded-2xl border border-neutral-200 p-6">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<Input
						label="Entity type"
						value={entityType}
						onChange={(e) => setEntityType(e.target.value)}
						placeholder="lot, invoice, session…"
					/>
					<Input
						label="Entity id"
						value={entityId}
						onChange={(e) => setEntityId(e.target.value)}
						placeholder="UUID (optional)"
					/>
					<div className="flex items-end">
						<button
							type="button"
							onClick={fetchAudit}
							className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
						>
							Search
						</button>
					</div>
				</div>

				<div className="mt-5">
					{loading ? (
						<p className="text-sm text-neutral-400">Loading…</p>
					) : entries.length === 0 ? (
						<p className="text-sm text-neutral-500">No entries match.</p>
					) : (
						<div className="divide-y divide-neutral-100">
							{entries.map((e) => (
								<div key={e.id} className="py-3 flex items-start justify-between gap-4">
									<div className="min-w-0">
										<p className="text-sm font-semibold text-neutral-900">
											{e.action}{" "}
											<span className="font-normal text-neutral-500">
												{e.entity_type} {e.entity_id.slice(0, 8)}
											</span>
										</p>
										<p className="text-xs text-neutral-400 mt-0.5">
											{e.actor_role || "system"}
											{e.actor_id ? ` · ${e.actor_id.slice(0, 8)}` : ""} ·{" "}
											{e.created_at ? timeAgo(e.created_at) : ""}
										</p>
									</div>
									<span className="shrink-0 text-xs text-neutral-300 font-mono">
										#{e.id}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
