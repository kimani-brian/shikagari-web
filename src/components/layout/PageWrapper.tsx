import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children:   React.ReactNode;
  className?: string;
  maxWidth?:  "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  padded?:    boolean;
}

const maxWidthMap = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-xl",
  "2xl":"max-w-2xl",
  "7xl":"max-w-7xl",
  full: "max-w-full",
};

export default function PageWrapper({
  children,
  className,
  maxWidth = "7xl",
  padded   = true,
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthMap[maxWidth],
        padded && "px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}