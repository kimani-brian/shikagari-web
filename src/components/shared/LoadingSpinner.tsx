import { cn } from "@/lib/utils";
import { Car } from "lucide-react";

interface LoadingSpinnerProps {
  size?:     "sm" | "md" | "lg";
  label?:    string;
  fullPage?: boolean;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

export default function LoadingSpinner({
  size     = "md",
  label,
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "rounded-full border-slate-200 border-t-brand-600 animate-spin",
          sizeMap[size]
        )}
      />
      {label && (
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-700 flex items-center justify-center animate-pulse">
        <Car className="w-7 h-7 text-white" strokeWidth={2} />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-300 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}