"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownRingProps {
	deadlineAt: number | null;
	size?: number;
}

// CountdownRing renders the authoritative server deadline as a circular clock:
// green while there is time, amber under 15 seconds, red under 5. Colour is
// reinforced by growing type so the urgency survives colour-blindness. The
// client interpolates locally and corrects on every tick — it never invents
// time.
export default function CountdownRing({ deadlineAt, size = 120 }: CountdownRingProps) {
	const [, force] = useState(0);

	useEffect(() => {
		if (deadlineAt == null) return;
		const id = setInterval(() => force((n) => n + 1), 250);
		return () => clearInterval(id);
	}, [deadlineAt]);

	if (deadlineAt == null) {
		return (
			<div
				className="rounded-full border-4 border-neutral-200 flex items-center justify-center text-neutral-400 text-xs font-semibold"
				style={{ width: size, height: size }}
			>
				Waiting
			</div>
		);
	}

	const remainingMs = Math.max(0, deadlineAt - Date.now());
	const remaining = Math.ceil(remainingMs / 1000);
	const total = 60;
	const frac = Math.min(1, remainingMs / (total * 1000));
	const r = (size - 12) / 2;
	const circ = 2 * Math.PI * r;

	const tone =
		remaining <= 5 ? "red" : remaining <= 15 ? "amber" : "green";
	const stroke =
		tone === "red" ? "#dc2626" : tone === "amber" ? "#d97706" : "#059669";

	const mm = Math.floor(remaining / 60);
	const ss = String(remaining % 60).padStart(2, "0");

	return (
		<div className="relative" style={{ width: size, height: size }} aria-live="polite" aria-label={`${remaining} seconds left`}>
			<svg width={size} height={size} className="-rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					strokeWidth={8}
					className="stroke-neutral-200"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke={stroke}
					strokeWidth={8}
					strokeLinecap="round"
					strokeDasharray={circ}
					strokeDashoffset={circ * (1 - frac)}
					className={cn(tone !== "green" && "animate-pulse")}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span
					className={cn(
						"font-bold tabular-nums text-neutral-900",
						tone === "red" ? "text-3xl" : "text-2xl"
					)}
				>
					{mm}:{ss}
				</span>
				<span className="text-[10px] uppercase tracking-wider text-neutral-400">
					on block
				</span>
			</div>
		</div>
	);
}