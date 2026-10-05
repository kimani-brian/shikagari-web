// ── API Response wrapper ───────────────────────────────────────────────────
export interface APIResponse<T> {
  success:  boolean;
  message:  string;
  data?:    T;
  error?:   Record<string, string>;
  meta?:    PaginationMeta;
}

export interface PaginationMeta {
  page:        number;
  per_page:    number;
  total_items: number;
  total_pages: number;
}

// ── User ──────────────────────────────────────────────────────────────────
export type UserRole = "buyer" | "dealer" | "admin";

export interface User {
  id:          string;
  full_name:   string;
  email:       string;
  phone:       string;
  role:        UserRole;
  is_verified: boolean;
  is_active:   boolean;
  created_at:  string;
}

export interface AuthResponse {
  token: string;
  user:  User;
}

// ── Seller profiles ───────────────────────────────────────────────────────
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface DealerProfile {
  id:              string;
  user_id:         string;
  business_name:   string;
  business_reg_no: string;
  location:        string;
  address:         string;
  logo_url:        string;
  description:     string;
  kra_pin:         string;
  approval_status: ApprovalStatus;
  approved_at:     string | null;
  user:            UserSummary;
  created_at:      string;
}

export interface UserSummary {
  id:          string;
  full_name:   string;
  phone:       string;
  is_verified: boolean;
  role:        UserRole;
}

export interface DealerSummary {
  id:            string;
  business_name: string;
  location:      string;
  logo_url:      string;
  is_verified:   boolean;
}

// ── Listings ──────────────────────────────────────────────────────────────
export type FuelType     = "petrol" | "diesel" | "hybrid" | "electric";
export type Transmission = "automatic" | "manual";
// "pending" = buyer listing awaiting NTSA e-logbook review; hidden from search.
export type ListingStatus      = "pending" | "active" | "inactive" | "sold";
export type SellerType         = "dealer" | "private";
export type VerificationStatus = "draft" | "pending" | "approved" | "rejected";

export interface ListingCard {
  id:            string;
  title:         string;
  price_kes:     number;
  location:      string;
  body_type:     string;
  status:        ListingStatus;
  make:          string;
  model:         string;
  year:          number;
  mileage:       number;
  fuel_type:     FuelType;
  transmission:  Transmission;
  drivetrain:    string;
  engine_size:   string;
  doors:         number;
  color:         string;
  thumbnail_url: string;
  cover_image?:  string;   // seller-chosen card photo
  seller_type:   SellerType;
  is_verified:   boolean;
  // Byline on the card: dealership name, or "Private listing" for individuals
  seller_label?: string;

  // Buyer review state — explains why a listing is not live yet
  verification_status: VerificationStatus;
  rejection_reason?:   string;

  created_at:    string;
}

export interface ListingDetail {
  id:            string;
  title:         string;
  description:   string;
  price_kes:     number;
  location:      string;
  body_type:     string;
  status:        ListingStatus;
  seller_type:   SellerType;
  make:          string;
  model:         string;
  year:          number;
  mileage:       number;
  fuel_type:     FuelType;
  transmission:  Transmission;
  drivetrain:    string;
  engine_size:   string;
  doors:         number;
  color:         string;
  images:        string[];
  cover_image?:  string;   // seller-chosen card photo
  view_count:    number;
  seller:        UserSummary;
  dealer_profile: DealerSummary | null;

  // Seller verification — present on buyer-created listings
  verification_status:     VerificationStatus;
  verification_full_name?: string;
  verification_id_number?: string;
  verification_elogbook_url?: string;
  verified_at?:             string;
  rejection_reason?:        string;

  created_at:    string;
  updated_at:    string;
}

// ── Admin review ─────────────────────────────────────────────────────────
// The pending-verification queue is admin-only, so it also carries the seller's
// email address, which public listing responses deliberately omit.
export type AdminPendingListing = ListingDetail & { seller_email: string };

// ── Filters ───────────────────────────────────────────────────────────────
export interface ListingFilters {
  search?:       string;
  location?:     string;
  body_type?:    string;
  make?:         string;
  model?:        string;
  min_year?:     number;
  max_year?:     number;
  min_price?:    number;
  max_price?:    number;
  fuel_type?:    FuelType;
  transmission?: Transmission;
  drivetrain?:   string;
  doors?:        number;
  seller_type?:  SellerType;
  dealer_id?:    string;
  user_id?:      string;
  sort_by?:      string;
  page?:         number;
  per_page?:     number;
}

// ── Inquiry ───────────────────────────────────────────────────────────────
export interface Inquiry {
  id:         string;
  listing_id: string;
  message:    string;
  reply:      string;
  status:     "open" | "replied" | "closed";
  listing:    ListingCard;
  buyer:      UserSummary;
  seller:     UserSummary;
  created_at: string;
  updated_at: string;
}