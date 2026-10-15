"use client";

import Link from "next/link";
import { AuctionLane, AuctionLot } from "@/types/auction";
import { formatKES } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LaneSwitcherProps {
	lanes: AuctionLane[];
	lots: AuctionLot[];
	currentLotId: string;
}

// LaneSwitcher jumps between lanes' live lots without going back to the
// calendar. Lanes with nothing on block show as quiet rather than hiding —
// a disappearing lane reads as broken during a live session.
export default function LaneSwitcher({ lanes, lots, currentLotId }: LaneSwitcherProps) {
	if (lanes.length <= 1) return null;

	const liveByLane = new Map<string, AuctionLot>();
	for (const lot of lots) {
		if (!lot.lane_id) continue;
		if (lot.status === "on_block" || lot.status === "open") {
			if (!liveByLane.has(lot.lane_id)) liveByLane.set(lot.lane_id, lot);
		}
	}

	return (
		<nav aria-label="Auction lanes" className="flex gap-2 overflow-x-auto pb-1">
			{lanes.map((lane) => {
				const live = liveByLane.get(lane.id);
				const active = live?.id === currentLotId;
				const inner = (
					<>
						<span
							className={cn(
								"w-1.5 h-1.5 rounded-full shrink-0",
								live ? "bg-red-500 animate-pulse" : "bg-neutral-300"
							)}
						/>
						<span className="whitespace-nowrap">
							Lane {lane.code}
							{live ? ` · ${formatKES(live.current_price_kes)}` : " · quiet"}
						</span>
					</>
				);
				const cls = cn(
					"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shrink-0",
					active
						? "bg-neutral-900 text-white border-neutral-900"
						: "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-900"
				);
				return live ? (
					<Link key={lane.id} href={`/auctions/room/${live.id}`} className={cls}>
						{inner}
					</Link>
				) : (
					<span key={lane.id} className={cn(cls, "opacity-60")}>
						{inner}
					</span>
				);
			})}
		</nav>
	);
}