"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page:         number;
  totalPages:   number;
  onPageChange: (page: number) => void;
  className?:   string;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3)          pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <PageBtn
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </PageBtn>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
          >
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            onClick={() => onPageChange(p as number)}
            active={p === page}
          >
            {p}
          </PageBtn>
        )
      )}

      <PageBtn
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </PageBtn>
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  active,
  disabled,
  "aria-label": ariaLabel,
}: {
  children:      React.ReactNode;
  onClick:       () => void;
  active?:       boolean;
  disabled?:     boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "w-9 h-9 rounded-xl text-sm font-semibold transition-all",
        "flex items-center justify-center",
        active
          ? "bg-brand-700 text-white shadow-blue"
          : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}