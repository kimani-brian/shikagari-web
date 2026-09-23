import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Link from "next/link";

type EmptyVariant = "listings" | "search" | "favorites" | "inquiries" | "generic";

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const defaults: Record<EmptyVariant, { icon: React.ComponentProps<typeof Icon>["name"]; title: string; description: string }> = {
  listings: {
    icon: "directions_car",
    title: "No listings found",
    description: "Try adjusting your filters or search for something different.",
  },
  search: {
    icon: "search",
    title: "No results found",
    description: "We could not find any cars matching your search. Try different keywords.",
  },
  favorites: {
    icon: "favorite",
    title: "No saved cars",
    description: "Cars you save will appear here. Start browsing to find your car.",
  },
  inquiries: {
    icon: "chat_bubble",
    title: "No messages yet",
    description: "When buyers contact you, their messages will appear here.",
  },
  generic: {
    icon: "info",
    title: "Nothing here yet",
    description: "There is nothing to show at the moment.",
  },
};

export default function EmptyState({
  variant = "generic",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const config = defaults[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6", className)}>
      <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-4">
        <Icon name={config.icon} size={24} className="text-neutral-400" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">{title ?? config.title}</h3>
      <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">{description ?? config.description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button variant="primary" size="sm">
            {actionLabel}
          </Button>
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
