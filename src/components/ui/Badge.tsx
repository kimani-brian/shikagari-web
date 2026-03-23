import { cn } from "@/lib/utils";

const variants = {
  default:  "bg-slate-100 text-slate-700",
  primary:  "bg-brand-50 text-brand-700 border border-brand-200",
  success:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning:  "bg-amber-50 text-amber-700 border border-amber-200",
  danger:   "bg-red-50 text-red-700 border border-red-200",
  navy:     "bg-navy text-white",
  gold:     "bg-amber-400 text-amber-900",
  outline:  "bg-transparent border border-slate-300 text-slate-600",
};

const sizes = {
  xs: "text-[10px] px-1.5 py-0.5 rounded-md gap-1",
  sm: "text-xs    px-2   py-0.5 rounded-lg gap-1",
  md: "text-xs    px-2.5 py-1   rounded-lg gap-1.5",
  lg: "text-sm    px-3   py-1   rounded-xl gap-1.5",
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
        "inline-flex items-center font-semibold whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "danger"  && "bg-red-500",
            variant === "primary" && "bg-brand-500",
            !["success","warning","danger","primary"].includes(variant) && "bg-current"
          )}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export function FuelBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    petrol:   { label: "Petrol",   variant: "warning" },
    diesel:   { label: "Diesel",   variant: "default" },
    hybrid:   { label: "Hybrid",   variant: "success" },
    electric: { label: "Electric", variant: "primary" },
  };
  const config = map[type] ?? { label: type, variant: "default" };
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}

export function ApprovalBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    pending:  { label: "Pending Review", variant: "warning" },
    approved: { label: "Approved",       variant: "success" },
    rejected: { label: "Rejected",       variant: "danger"  },
  };
  const config = map[status] ?? { label: status, variant: "default" };
  return (
    <Badge variant={config.variant} size="sm" dot>
      {config.label}
    </Badge>
  );
}

export function ListingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    active:   { label: "Active",   variant: "success" },
    inactive: { label: "Inactive", variant: "warning" },
    sold:     { label: "Sold",     variant: "danger"  },
  };
  const config = map[status] ?? { label: status, variant: "default" };
  return (
    <Badge variant={config.variant} size="sm" dot>
      {config.label}
    </Badge>
  );
}