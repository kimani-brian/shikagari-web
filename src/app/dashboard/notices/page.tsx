"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import auctionApi from "@/lib/auction";
import { useAuth } from "@/contexts/AuthContext";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { timeAgo } from "@/lib/utils";

interface Notice {
	id: string;
	kind: string;
	title: string;
	body: string;
	reference_type: string;
	reference_id: string;
	read: boolean;
	created_at: string;
}

export default function NoticesPage() {
	const { isLoggedIn } = useAuth();
	const [items, setItems] = useState<Notice[]>([]);
	const [unread, setUnread] = useState(0);
	const [loading, setLoading] = useState(true);

	const fetchNotices = async () => {
		try {
			const res = await auctionApi.get("/me/notifications");
			setItems(res.data.data.items ?? []);
			setUnread(res.data.data.unread ?? 0);
		} catch {
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isLoggedIn) fetchNotices();
		else setLoading(false);
		 
	}, [isLoggedIn]);

	const markAllRead = async () => {
		try {
			await auctionApi.post("/me/notifications/read-all");
			setItems((prev) => prev.map((n) => ({ ...n, read: true })));
			setUnread(0);
		} catch {
			// Best effort.
		}
	};

	const openNotice = async (n: Notice) => {
		if (!n.read) {
			try {
				await auctionApi.post(`/me/notifications/${n.id}/read`);
			} catch {
				// Best effort.
			}
			setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
			setUnread((u) => Math.max(0, u - 1));
		}
	};

	if (!isLoggedIn) {
		return (
			<div className="bg-white">
				<PageWrapper className="py-14 max-w-lg">
					<h1 className="text-2xl font-semibold text-neutral-900">Notices</h1>
					<p className="text-sm text-neutral-500 mt-2">Sign in to see your notices.</p>
					<Link href="/login" className="inline-block mt-4">
						<Button variant="primary">Sign in</Button>
					</Link>
				</PageWrapper>
			</div>
		);
	}

	if (loading) return <PageLoader />;

	const target = (n: Notice) => {
		if (n.reference_type === "invoice" && n.reference_id) {
			return `/auctions/invoices/${n.reference_id}`;
		}
		if (n.reference_type === "lot" && n.reference_id) {
			return `/auctions/lot/${n.reference_id}`;
		}
		return null;
	};

	return (
		<div className="bg-white">
			<PageWrapper className="py-10 max-w-2xl">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold text-neutral-900">Notices</h1>
						<p className="text-sm text-neutral-500 mt-1">
							{unread > 0 ? `${unread} unread` : "All caught up."}
						</p>
					</div>
					{unread > 0 && (
						<button
							type="button"
							onClick={markAllRead}
							className="shrink-0 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
						>
							Mark all read
						</button>
					)}
				</div>

				{items.length === 0 ? (
					<div className="mt-6">
						<EmptyState
							variant="generic"
							title="No notices yet"
							description="Invoices, payments and counter-offers will appear here."
							actionLabel="Browse auctions"
							actionHref="/auctions"
						/>
					</div>
				) : (
					<div className="mt-6 space-y-2">
						{items.map((n) => {
							const href = target(n);
							const body = (
								<>
									<span
										className={
											n.read
												? "w-2 h-2 rounded-full bg-neutral-200 shrink-0 mt-1.5"
												: "w-2 h-2 rounded-full bg-neutral-900 shrink-0 mt-1.5"
										}
									/>
									<span className="min-w-0">
										<span className="block text-sm font-semibold text-neutral-900">
											{n.title}
										</span>
										<span className="block text-sm text-neutral-600 mt-0.5 leading-relaxed">
											{n.body}
										</span>
										<span className="block text-xs text-neutral-400 mt-1">
											{n.created_at ? timeAgo(n.created_at) : ""}
										</span>
									</span>
								</>
							);
							const cls =
								"flex items-start gap-3 rounded-xl border border-neutral-200 px-4 py-3 transition-colors " +
								(href ? "hover:border-neutral-900" : "");
							return href ? (
								<Link key={n.id} href={href} onClick={() => openNotice(n)} className={cls}>
									{body}
								</Link>
							) : (
								<div key={n.id} className={cls} onClick={() => openNotice(n)}>
									{body}
								</div>
							);
						})}
					</div>
				)}
			</PageWrapper>
		</div>
	);
}
