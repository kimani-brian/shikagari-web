"use client";

import { cn, formatKES } from "@/lib/utils";

interface BuyingPowerMeterProps {
	deposited: number;
	held: number;
	ratioPercent?: number;
	tier?: string;
	compact?: boolean;
}

// BuyingPowerMeter shows deposited vs held money as one bar, with the rate
// behind it. No jargon: "held" not "encumbered", "dealer rate" not "tier".
export default function BuyingPowerMeter({
	deposited,
	held,
	ratioPercent,
	tier,
	compact,
}: BuyingPowerMeterProps) {
	const free = Math.max(0, deposited - held);
	const heldFrac = deposited > 0 ? Math.min(1, held / deposited) : 0;

	return (
		<div className={compact ? "" : "rounded-2xl border border-neutral-200 p-5"}>
			{!compact && (
				<h2 className="text-sm font-semibold text-neutral-900">
					Your buying power
				</h2>
			)}
			<div className={compact ? "" : "mt-3"}>
				<div
					className="h-2 rounded-full bg-neutral-100 overflow-hidden"
					role="progressbar"
					aria-label={`KES ${free.toLocaleString()} free of KES ${deposited.toLocaleString()} deposited`}
					aria-valuenow={Math.round(free)}
					aria-valuemax={Math.round(deposited)}
				>
					<div
						className="h-full rounded-full bg-neutral-900 transition-all"
						style={{ width: `${(1 - heldFrac) * 100}%` }}
					/>
				</div>
				<div className="mt-2 space-y-1 text-sm">
					<MeterRow label="Deposited" value={formatKES(deposited)} />
					<MeterRow label="Held on bids" value={formatKES(held)} />
					<MeterRow label="Free" value={formatKES(free)} strong />
				</div>
				{ratioPercent != null && (
					<p className="text-xs text-neutral-400 mt-2">
						{tier === "dealer"
							? `Dealer rate: bids hold ${ratioPercent}% of the price.`
							: `Bids hold ${ratioPercent}% of the price.`}{" "}
						Free money covers bids up to{" "}
						<span className="font-semibold text-neutral-700">
							{formatKES(Math.floor((free * 100) / Math.max(1, ratioPercent)))}
						</span>
						.
					</p>
				)}
			</div>
		</div>
	);
}

function MeterRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-neutral-500 text-xs">{label}</span>
			<span className={cn("text-sm", strong ? "font-bold text-neutral-900" : "font-medium text-neutral-700")}>
				{value}
			</span>
		</div>
	);
}
