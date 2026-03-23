import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?:      "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { icon: "w-3 h-3",     text: "text-[10px]", wrap: "gap-0.5 px-1.5 py-0.5 rounded-md" },
  sm: { icon: "w-3.5 h-3.5", text: "text-xs",     wrap: "gap-1   px-2   py-0.5 rounded-lg" },
  md: { icon: "w-4 h-4",     text: "text-xs",     wrap: "gap-1   px-2.5 py-1   rounded-lg" },
  lg: { icon: "w-4 h-4",     text: "text-sm",     wrap: "gap-1.5 px-3   py-1   rounded-xl" },
};

export default function VerifiedBadge({
  size      = "sm",
  showLabel = true,
  className,
}: VerifiedBadgeProps) {
  const s = sizeMap[size];

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold",
        "bg-brand-700 text-white verified-glow",
        s.wrap,
        className
      )}
    >
      <ShieldCheck className={cn(s.icon, "shrink-0")} strokeWidth={2.5} />
      {showLabel && <span className={s.text}>Verified</span>}
    </span>
  );
}

export function VerifiedInline({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-brand-700", className)}>
      <ShieldCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
      <span className="text-xs font-semibold">Verified Seller</span>
    </span>
  );
}