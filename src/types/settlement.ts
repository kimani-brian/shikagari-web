// Settlement shapes (Phase 5: invoices, payments, counter-offers).

export interface InvoiceLine {
	label: string;
	amount_kes: number;
}

export interface Invoice {
	id: string;
	lot_id: string;
	lot_title: string;
	buyer_user_id: string;
	hammer_price_kes: number;
	buyer_premium_kes: number;
	platform_fee_kes: number;
	total_kes: number;
	lines: InvoiceLine[];
	status: "issued" | "part_paid" | "paid" | "defaulted" | "refunded" | "disputed";
	payment_due_at: string;
	paid_at: string | null;
	created_at: string;
}

export interface CounterOfferView {
	id: string;
	lot_id: string;
	lot_title: string;
	amount_kes: number;
	status: "pending" | "accepted" | "declined" | "expired";
	expires_at: string;
}
