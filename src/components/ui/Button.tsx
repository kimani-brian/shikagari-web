"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 shadow-blue hover:shadow-lg active:scale-[0.98]",
  secondary:
    "bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]",
  outline:
    "bg-transparent text-brand-700 border border-brand-300 hover:bg-brand-50 active:scale-[0.98]",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
  "danger-ghost":
    "bg-transparent text-red-600 hover:bg-red-50",
  navy:
    "bg-navy text-white hover:bg-navy-light active:scale-[0.98]",
};

const sizes = {
  xs:  "h-7  px-3   text-xs  rounded-lg  gap-1.5",
  sm:  "h-9  px-4   text-sm  rounded-xl  gap-2",
  md:  "h-11 px-5   text-sm  rounded-xl  gap-2",
  lg:  "h-12 px-6   text-base rounded-xl gap-2.5",
  xl:  "h-14 px-8   text-base rounded-2xl gap-3",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   keyof typeof variants;
  size?:      keyof typeof sizes;
  loading?:   boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?:   boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = "primary",
      size      = "md",
      loading   = false,
      leftIcon,
      rightIcon,
      asChild   = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "select-none whitespace-nowrap",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        )}
        {!loading && leftIcon && (
          <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";
export default Button;