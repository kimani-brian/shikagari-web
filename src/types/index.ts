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
export type UserRole = "buyer" | "seller" | "admin";

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

export interface PrivateSellerProfile {
  id:                string;
  user_id:           string;
  national_id_no:    string;
  location:          string;
  profile_photo_url: string;
  bio:               string;
  approval_status:   ApprovalStatus;
  approved_at:       string | null;
  user:              UserSummary;
  created_at:        string;
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
export type ListingStatus = "active" | "inactive" | "sold";
export type SellerType    = "dealer" | "private";

export interface ListingCard {
  id:            string;
  title:         string;
  price_kes:     number;
  location:      string;
  make:          string;
  model:         string;
  year:          number;
  mileage:       number;
  fuel_type:     FuelType;
  transmission:  Transmission;
  thumbnail_url: string;
  seller_type:   SellerType;
  is_verified:   boolean;
  created_at:    string;
}

export interface ListingDetail {
  id:            string;
  title:         string;
  description:   string;
  price_kes:     number;
  location:      string;
  status:        ListingStatus;
  seller_type:   SellerType;
  make:          string;
  model:         string;
  year:          number;
  mileage:       number;
  fuel_type:     FuelType;
  transmission:  Transmission;
  color:         string;
  images:        string[];
  view_count:    number;
  seller:        UserSummary;
  dealer_profile:         DealerSummary | null;
  private_seller_profile: PrivateSellerSummary | null;
  created_at:    string;
  updated_at:    string;
}

export interface PrivateSellerSummary {
  id:                string;
  location:          string;
  profile_photo_url: string;
  is_verified:       boolean;
}

// ── Filters ───────────────────────────────────────────────────────────────
export interface ListingFilters {
  search?:       string;
  location?:     string;
  make?:         string;
  model?:        string;
  min_year?:     number;
  max_year?:     number;
  min_price?:    number;
  max_price?:    number;
  fuel_type?:    FuelType;
  transmission?: Transmission;
  seller_type?:  SellerType;
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