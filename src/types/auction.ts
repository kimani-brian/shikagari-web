// Auction engine shapes (Phase 1: catalogue, deposits, pre-bids).
// Money arrives as integer KES in JSON numbers — never floats.

export interface AuctionSession {
	id: string;
	name: string;
	starts_at: string;
	ends_at: string;
	status: "scheduled" | "live" | "closed" | "cancelled";
	auctioneer_user_id: string;
	created_at: string;
}

export interface AuctionLane {
	id: string;
	session_id: string;
	code: string;
	name: string;
	sort_order: number;
	is_active: boolean;
}

export interface AuctionVehicle {
	listing_id: string;
	title: string;
	description: string;
	price_kes: number;
	location: string;
	body_type: string;
	make: string;
	model: string;
	year: number;
	mileage: number;
	fuel_type: string;
	transmission: string;
	drivetrain: string;
	engine_size: string;
	doors: number;
	color: string;
	images: string[];
	cover_image: string;
}

export interface AuctionLot {
	id: string;
	session_id: string | null;
	lane_id: string | null;
	sale_type: "pure_sale" | "reserve" | "on_approval";
	reserve_met: boolean;
	opening_bid_kes: number;
	increment_kes: number;
	next_bid_kes: number;
	status: "draft" | "scheduled" | "open" | "on_block" | "sold" | "pending_approval" | "unsold" | "withdrawn";
	scheduled_start: string;
	current_price_kes: number;
	bid_count: number;
	version: number;
	vehicle: AuctionVehicle;
	created_at: string;
}

export interface SessionDetail {
	session: AuctionSession;
	lanes: AuctionLane[];
	lots: AuctionLot[];
}

export interface PreBid {
	id: string;
	lot_id: string;
	max_amount_kes: number;
	hold_amount_kes: number;
	created_at: string;
}

export interface BuyingPower {
	deposited_kes: number;
	held_kes: number;
	available_kes: number;
	max_bid_kes: number;
	ratio_percent: number;
	tier: "buyer" | "dealer";
}