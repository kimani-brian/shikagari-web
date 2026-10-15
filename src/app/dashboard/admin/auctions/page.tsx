"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import auctionApi from "@/lib/auction";
import { AuctionSession } from "@/types/auction";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input, { SelectField } from "@/components/ui/Input";
import { PageLoader } from "@/components/shared/LoadingSpinner";

// Internal ops: schedule auction days before the licence lands. Everything
// here writes through the licence gate — public sessions are refused until it
// is granted, and this page runs rehearsals in the meantime.
export default function AdminAuctionsPage() {
	const router = useRouter();
	const { user, isLoggedIn, isLoading } = useAuth();

	const [sessions, setSessions] = useState<AuctionSession[]>([]);
	const [loading, setLoading] = useState(true);

	const [sessionName, setSessionName] = useState("");
	const [startsAt, setStartsAt] = useState("");
	const [endsAt, setEndsAt] = useState("");
	const [saving, setSaving] = useState(false);

	const [laneSession, setLaneSession] = useState("");
	const [laneCode, setLaneCode] = useState("A");
	const [laneName, setLaneName] = useState("");
	const [laneBusy, setLaneBusy] = useState(false);

	const [lotId, setLotId] = useState("");
	const [schedSession, setSchedSession] = useState("");
	const [schedLanes, setSchedLanes] = useState<{ id: string; code: string; name: string }[]>([]);
	const [schedLane, setSchedLane] = useState("");
	const [schedAt, setSchedAt] = useState("");
	const [schedBusy, setSchedBusy] = useState(false);
	const [openLotId, setOpenLotId] = useState("");
	const [openSession, setOpenSession] = useState("");
	const [openLane, setOpenLane] = useState("");
	const [openLanes, setOpenLanes] = useState<{ id: string; code: string; name: string }[]>([]);
	const [openBusy, setOpenBusy] = useState(false);

	const [licenseNumber, setLicenseNumber] = useState("");
	const [licenseBusy, setLicenseBusy] = useState(false);

	useEffect(() => {
		if (isLoading) return;
		if (!isLoggedIn) {
			router.replace("/login");
			return;
		}
		if (user?.role !== "admin") {
			router.replace("/dashboard");
		}
	}, [isLoading, isLoggedIn, user?.role, router]);

	const fetchSessions = async () => {
		try {
			setLoading(true);
			const res = await auctionApi.get("/auctions");
			setSessions(res.data.data ?? []);
		} catch {
			setSessions([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isLoading && isLoggedIn && user?.role === "admin") fetchSessions();
	}, [isLoading, isLoggedIn, user?.role]);

	useEffect(() => {
		if (!schedSession) {
			setSchedLanes([]);
			setSchedLane("");
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const res = await auctionApi.get(`/auctions/${schedSession}`);
				if (!cancelled) setSchedLanes(res.data.data.lanes ?? []);
			} catch {
				if (!cancelled) setSchedLanes([]);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [schedSession]);


	if (isLoading || !isLoggedIn) return <PageLoader />;
	if (user?.role !== "admin") return null;

	const errMsg = (err: unknown, fallback: string) =>
		(err as { response?: { data?: { error?: { message?: string } } } })
			?.response?.data?.error?.message ?? fallback;

	const createSession = async (internal: boolean) => {
		if (!sessionName.trim() || !startsAt || !endsAt) {
			toast.error("Name the session and set its start and end.");
			return;
		}
		try {
			setSaving(true);
			const body = {
				name: sessionName.trim(),
				starts_at: new Date(startsAt).toISOString(),
				ends_at: new Date(endsAt).toISOString(),
			};
			if (internal) {
				await auctionApi.post("/internal/sessions", body, {
					headers: { "X-Internal-Key": "dev-internal-key" },
				});
				toast.success("Rehearsal session created. It can never go public.");
			} else {
				await auctionApi.post("/admin/sessions", body);
				toast.success("Auction session created.");
			}
			setSessionName("");
			setStartsAt("");
			setEndsAt("");
			fetchSessions();
		} catch (err: unknown) {
			toast.error(errMsg(err, "Could not create the session."));
		} finally {
			setSaving(false);
		}
	};

	const addLane = async () => {
		if (!laneSession || !laneCode.trim() || !laneName.trim()) {
			toast.error("Pick a session and name the lane.");
			return;
		}
		try {
			setLaneBusy(true);
			await auctionApi.post(`/admin/sessions/${laneSession}/lanes`, {
				code: laneCode.trim().toUpperCase(),
				name: laneName.trim(),
				sort_order: 0,
			});
			toast.success("Lane added.");
			setLaneCode("A");
			setLaneName("");
		} catch (err: unknown) {
			toast.error(errMsg(err, "Could not add the lane."));
		} finally {
			setLaneBusy(false);
		}
	};

	useEffect(() => {
		if (!openSession) {
			setOpenLanes([]);
			setOpenLane("");
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const res = await auctionApi.get(`/auctions/${openSession}`);
				if (!cancelled) setOpenLanes(res.data.data.lanes ?? []);
			} catch {
				if (!cancelled) setOpenLanes([]);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [openSession]);

	const openLotNow = async () => {
		if (!openLotId.trim() || !openLane) {
			toast.error("Pick a lot and the lane to open it in.");
			return;
		}
		try {
			setOpenBusy(true);
			await auctionApi.post(`/admin/lots/${openLotId.trim()}/open`, {
				lane_id: openLane,
				session_id: openSession || undefined,
			});
			toast.success("Lot is on the block.");
			setOpenLotId("");
		} catch (err: unknown) {
			toast.error(errMsg(err, "Could not open the lot."));
		} finally {
			setOpenBusy(false);
		}
	};

	const scheduleLot = async () => {
		if (!lotId.trim() || !schedSession || !schedLane || !schedAt) {
			toast.error("Fill in the lot, session, lane and start time.");
			return;
		}
		try {
			setSchedBusy(true);
			await auctionApi.post(`/admin/lots/${lotId.trim()}/schedule`, {
				lane_id: schedLane,
				session_id: schedSession,
				scheduled_start: new Date(schedAt).toISOString(),
			});
			toast.success("Lot scheduled.");
			setLotId("");
			setSchedLane("");
			setSchedAt("");
		} catch (err: unknown) {
			toast.error(errMsg(err, "Could not schedule the lot."));
		} finally {
			setSchedBusy(false);
		}
	};

	const saveLicense = async (enabled: boolean) => {
		if (enabled && !licenseNumber.trim()) {
			toast.error("Enter the licence number first.");
			return;
		}
		try {
			setLicenseBusy(true);
			await auctionApi.patch("/admin/settings/license", {
				enabled,
				number: licenseNumber.trim(),
			});
			toast.success(enabled ? "Licence recorded. Public auctions are open." : "Public auctions switched off.");
			setLicenseNumber("");
		} catch (err: unknown) {
			toast.error(errMsg(err, "Could not update the licence."));
		} finally {
			setLicenseBusy(false);
		}
	};

	return (
		<div className="space-y-6">
			<header className="bg-white rounded-2xl border border-neutral-200 p-6">
				<p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
					Admin tools
				</p>
				<h1 className="font-display text-3xl text-neutral-900 mt-1">
					Auction sessions
				</h1>
				<p className="text-sm text-neutral-500 mt-2 max-w-2xl">
					Schedule auction days and lanes. Public sessions stay locked until the
					licence is granted — rehearsals below are internal only.
				</p>
				<div className="flex flex-wrap gap-3 mt-4">
					<Link href="/dashboard/admin" className="text-sm font-semibold text-neutral-500 hover:text-neutral-900">
						← Seller approvals
					</Link>
					<Link href="/auctions" className="text-sm font-semibold text-neutral-900 hover:text-brand-800">
						Public auction calendar →
					</Link>
				</div>
			</header>

			<div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
				<h2 className="font-display text-xl text-neutral-900">Sessions</h2>
				{loading ? (
					<p className="text-sm text-neutral-400">Loading sessions…</p>
				) : sessions.length === 0 ? (
					<p className="text-sm text-neutral-500">No sessions yet.</p>
				) : (
					<div className="space-y-2">
						{sessions.map((s) => (
							<div
								key={s.id}
								className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3"
							>
								<div className="min-w-0">
									<p className="text-sm font-semibold text-neutral-900 truncate">
										{s.name}
									</p>
									<p className="text-xs text-neutral-400">
										{new Date(s.starts_at).toLocaleString("en-KE")} · {s.status}
									</p>
								</div>
								<Link
									href={`/auctions/session/${s.id}`}
									className="shrink-0 text-xs font-semibold text-neutral-900 hover:underline"
								>
									Open →
								</Link>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
				<h2 className="font-display text-xl text-neutral-900">New session</h2>
				<Input
					label="Session name"
					value={sessionName}
					onChange={(e) => setSessionName(e.target.value)}
					placeholder="Saturday morning sale"
					required
				/>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-neutral-700 mb-1.5">Starts</label>
						<input
							type="datetime-local"
							value={startsAt}
							onChange={(e) => setStartsAt(e.target.value)}
							className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-neutral-700 mb-1.5">Ends</label>
						<input
							type="datetime-local"
							value={endsAt}
							onChange={(e) => setEndsAt(e.target.value)}
							className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
						/>
					</div>
				</div>
				<div className="flex flex-wrap gap-3">
					<Button variant="primary" loading={saving} onClick={() => createSession(false)}>
						Create public session
					</Button>
					<Button variant="secondary" loading={saving} onClick={() => createSession(true)}>
						Create rehearsal (internal)
					</Button>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
				<h2 className="font-display text-xl text-neutral-900">Add a lane</h2>
				<SelectField
					label="Session"
					value={laneSession}
					onChange={(e) => setLaneSession(e.target.value)}
					options={[
						{ value: "", label: "Select a session" },
						...sessions.map((s) => ({ value: s.id, label: s.name })),
					]}
					required
				/>
				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Lane code"
						value={laneCode}
						onChange={(e) => setLaneCode(e.target.value)}
						placeholder="A"
						required
					/>
					<Input
						label="Lane name"
						value={laneName}
						onChange={(e) => setLaneName(e.target.value)}
						placeholder="Main hall"
						required
					/>
				</div>
				<Button variant="primary" loading={laneBusy} onClick={addLane}>
					Add lane
				</Button>
			</div>

			<div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
				<h2 className="font-display text-xl text-neutral-900">Schedule a lot</h2>
				<p className="text-xs text-neutral-500">
					Find the lot id on the lot page URL after a dealer converts a car.
				</p>
				<Input
					label="Lot id"
					value={lotId}
					onChange={(e) => setLotId(e.target.value)}
					placeholder="Paste the lot UUID"
					required
				/>
				<SelectField
					label="Session"
					value={schedSession}
					onChange={(e) => setSchedSession(e.target.value)}
					options={[
						{ value: "", label: "Select a session" },
						...sessions.map((s) => ({ value: s.id, label: s.name })),
					]}
					required
				/>
				<SelectField
					label="Lane"
					value={schedLane}
					onChange={(e) => setSchedLane(e.target.value)}
					options={[
						{ value: "", label: schedLanes.length ? "Select a lane" : "Pick a session first" },
						...schedLanes.map((l) => ({ value: l.id, label: `Lane ${l.code} — ${l.name}` })),
					]}
					required
				/>
				<div>
					<label className="block text-sm font-medium text-neutral-700 mb-1.5">Starts</label>
					<input
						type="datetime-local"
						value={schedAt}
						onChange={(e) => setSchedAt(e.target.value)}
						className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm"
					/>
				</div>
				<Button variant="primary" loading={schedBusy} onClick={scheduleLot}>
					Schedule lot
				</Button>
			</div>

			<div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
				<h2 className="font-display text-xl text-neutral-900">Open a lot</h2>
				<p className="text-xs text-neutral-500">
					Putting a lot on the block starts its clock and wakes its lane.
				</p>
				<Input
					label="Lot id"
					value={openLotId}
					onChange={(e) => setOpenLotId(e.target.value)}
					placeholder="Paste the lot UUID"
					required
				/>
				<SelectField
					label="Session"
					value={openSession}
					onChange={(e) => setOpenSession(e.target.value)}
					options={[
						{ value: "", label: "No session (lane only)" },
						...sessions.map((s) => ({ value: s.id, label: s.name })),
					]}
				/>
				{openLanes.length > 0 ? (
					<SelectField
						label="Lane"
						value={openLane}
						onChange={(e) => setOpenLane(e.target.value)}
						options={[
							{ value: "", label: "Select a lane" },
							...openLanes.map((l) => ({ value: l.id, label: `Lane ${l.code} — ${l.name}` })),
						]}
						required
					/>
				) : (
					<Input
						label="Lane id"
						value={openLane}
						onChange={(e) => setOpenLane(e.target.value)}
						placeholder="Paste the lane UUID for a lane-only open"
						hint="Pick a session above to choose from its lanes instead."
					/>
				)}
				<Button variant="primary" loading={openBusy} onClick={openLotNow}>
					Open lot
				</Button>
			</div>

			<div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
				<h2 className="font-display text-xl text-neutral-900">Auctioneer licence</h2>
				<p className="text-xs text-neutral-500">
					Enabling public auctions requires the granted licence number. The
					database refuses to enable it without one.
				</p>
				<Input
					label="Licence number"
					value={licenseNumber}
					onChange={(e) => setLicenseNumber(e.target.value)}
					placeholder="e.g. AUC/2026/014"
				/>
				<div className="flex flex-wrap gap-3">
					<Button variant="primary" loading={licenseBusy} onClick={() => saveLicense(true)}>
						Record licence & open auctions
					</Button>
					<Button variant="danger" loading={licenseBusy} onClick={() => saveLicense(false)}>
						Switch public auctions off
					</Button>
				</div>
			</div>
		</div>
	);
}