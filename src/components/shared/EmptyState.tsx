import { cn } from "@/lib/utils";
import { Car, Search, Heart, MessageSquare, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ElementType } from "react";

type EmptyVariant = "listings" | "search" | "favorites" | "inquiries" | "generic";

interface EmptyStateProps {
  variant?:     EmptyVariant;
  title?:       string;
  description?: string;
  actionLabel?: string;
  actionHref?:  string;
  onAction?:    () => void;
  className?:   string;
}

const defaults: Record<
  EmptyVariant,
  { icon: ElementType; title: string; description: string }
> = {
  listings: {
    icon:        Car,
    title:       "No listings found",
    description: "Try adjusting your filters or search for something different.",
  },
  search: {
    icon:        Search,
    title:       "No results found",
    description: "We couldn't find any cars matching your search. Try different keywords.",
  },
  favorites: {
    icon:        Heart,
    title:       "No saved cars",
    description: "Cars you save will appear here. Start browsing to find your perfect car.",
  },
  inquiries: {
    icon:        MessageSquare,
    title:       "No inquiries yet",
    description: "When buyers contact you, their messages will appear here.",
  },
  generic: {
    icon:        AlertCircle,
    title:       "Nothing here yet",
    description: "There's nothing to show at the moment.",
  },
};

export default function EmptyState({
  variant     = "generic",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const config = defaults[variant];
  const Icon   = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">
        {title ?? config.title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        {description ?? config.description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button variant="primary" size="sm">{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}