"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

// TermsGate (LIC-6, design §8.1): a buyer acknowledges the terms of sale once
// before their first bid. Client-only and localStorage-backed — the legal
// record lives in the engine audit log per bid, this just keeps the UI honest.
// Copy follows design §8: plain sentences, no exclamation marks, no licence
// number until one is granted.
export const TERMS_ACK_KEY = "shikagari_terms_ack";

export function hasAcknowledgedTerms(userId: string): boolean {
	try {
		return localStorage.getItem(`${TERMS_ACK_KEY}:${userId}`) === "1";
	} catch {
		return false;
	}
}

export function acknowledgeTerms(userId: string): void {
	try {
		localStorage.setItem(`${TERMS_ACK_KEY}:${userId}`, "1");
	} catch {
		// Storage unavailable — the gate will simply ask again next visit.
	}
}

interface TermsGateProps {
	open: boolean;
	onAcknowledge: () => void;
	onCancel: () => void;
}

export default function TermsGate({ open, onAcknowledge, onCancel }: TermsGateProps) {
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCancel();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onCancel]);

	// Fresh mount per open (parent keys on termsOpen) so the checkbox always
	// starts unchecked; no state reset needed inside effects.
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
			onClick={onCancel}
			aria-hidden={false}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="terms-gate-title"
				className="w-full max-w-md rounded-2xl bg-white p-6 animate-fade-up"
				onClick={(e) => e.stopPropagation()}
			>
				<h2 id="terms-gate-title" className="text-lg font-semibold text-neutral-900">
					Terms of sale
				</h2>
				<ul className="mt-3 space-y-2 text-sm text-neutral-600 leading-relaxed list-disc pl-5">
					<li>ShikaGari conducts this sale as auctioneer. The vehicle belongs to the listing dealer.</li>
					<li>A buyer premium applies on top of the hammer price.</li>
					<li>Payment in full is due within 72 hours of the hammer.</li>
					<li>Storage fees accrue from day 3 if the vehicle is not collected.</li>
					<li>Bids are binding. A winning bid you do not pay for forfeits your deposit.</li>
				</ul>
				<label className="mt-4 flex items-start gap-2.5 text-sm text-neutral-700 cursor-pointer">
					<input
						type="checkbox"
						checked={checked}
						onChange={(e) => setChecked(e.target.checked)}
						autoFocus
						className="mt-1 h-4 w-4 accent-neutral-900"
					/>
					I have read and accept these terms.
				</label>
				<div className="mt-5 flex gap-2">
					<Button variant="secondary" fullWidth type="button" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						variant="primary"
						fullWidth
						type="button"
						disabled={!checked}
						onClick={onAcknowledge}
					>
						Accept and bid
					</Button>
				</div>
			</div>
		</div>
	);
}
