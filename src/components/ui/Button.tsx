"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

const variants = {
  primary:
    "bg-neutral-900 text-white hover:bg-black border border-neutral-900",
  secondary:
    "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50",
  outline:
    "bg-transparent text-neutral-900 border border-neutral-300 hover:bg-neutral-50",
  ghost:
    "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
  danger:
    "bg-neutral-900 text-white hover:bg-black border border-neutral-900",
  "danger-ghost":
    "bg-transparent text-neutral-700 hover:bg-neutral-100 border border-transparent",
  navy:
    "bg-neutral-900 text-white hover:bg-black border border-neutral-900",
};

const sizes = {
  xs:  "h-7  px-3   text-xs  rounded-full  gap-1.5",
  sm:  "h-9  px-4   text-sm  rounded-full  gap-2",
  md:  "h-10 px-5   text-sm  rounded-full  gap-2",
  lg:  "h-11 px-6   text-sm  rounded-full gap-2",
  xl:  "h-12 px-7   text-sm  rounded-full gap-2",
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
          "inline-flex items-center justify-center font-medium",
          "transition-colors duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1",
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
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {!loading && leftIcon && (
          <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";
export default Button;
