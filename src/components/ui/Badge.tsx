import { cn } from "@/lib/utils";

const variants = {
  default:  "bg-neutral-100 text-neutral-700 border border-neutral-200",
  primary:  "bg-neutral-900 text-white border border-neutral-900",
  success:  "bg-neutral-900 text-white border border-neutral-900",
  warning:  "bg-white text-neutral-700 border border-neutral-300",
  danger:   "bg-white text-neutral-700 border border-neutral-300",
  navy:     "bg-neutral-900 text-white border border-neutral-900",
  gold:     "bg-white text-neutral-700 border border-neutral-300",
  outline:  "bg-transparent border border-neutral-300 text-neutral-600",
};

const sizes = {
  xs: "text-[10px] px-1.5 py-0.5 rounded-full gap-1",
  sm: "text-xs    px-2   py-0.5 rounded-full gap-1",
  md: "text-xs    px-2.5 py-1   rounded-full gap-1.5",
  lg: "text-sm    px-3   py-1   rounded-full gap-1.5",
};

export interface BadgeProps {
  variant?:  keyof typeof variants;
  size?:     keyof typeof sizes;
  icon?:     React.ReactNode;
  dot?:      boolean;
  className?: string;
  children:  React.ReactNode;
}

export default function Badge({
  variant   = "default",
  size      = "md",
  icon,
  dot,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 bg-neutral-900"
          )}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export function FuelBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    petrol: "Petrol",
    diesel: "Diesel",
    hybrid: "Hybrid",
    electric: "Electric",
  };
  const label = map[type] ?? type;
  return <Badge variant="default" size="sm">{label}</Badge>;
}

export function ApprovalBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  const label = map[status] ?? status;
  return (
    <Badge variant="default" size="sm" dot>
      {label}
    </Badge>
  );
}

export function ListingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    sold: "Sold",
  };
  const label = map[status] ?? status;
  return (
    <Badge variant="default" size="sm" dot>
      {label}
    </Badge>
  );
}
