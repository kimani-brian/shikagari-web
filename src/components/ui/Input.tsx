"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  hint?:      string;
  error?:     string;
  success?:   string;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      success,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      type,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId    = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const resolvedType = isPassword
      ? showPassword ? "text" : "password"
      : type;

    const hasError   = !!error;
    const hasSuccess = !!success && !error;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
            {props.required && (
              <span className="text-neutral-900 ml-0.5">*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn(
              "w-full rounded-full border bg-white px-4 py-2.5",
              "text-sm text-neutral-900 placeholder:text-neutral-400",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900",
              !hasError && !hasSuccess && [
                "border-neutral-300",
              ],
              hasError && [
                "border-neutral-900 bg-neutral-50",
              ],
              hasSuccess && [
                "border-neutral-300",
              ],
              "disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed",
              leftIcon  && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              className
            )}
            {...props}
          />

          <span className="absolute right-3.5 flex items-center gap-1">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                tabIndex={-1}
              >
                <Icon name={showPassword ? "visibility" : "visibility"} size={18} />
              </button>
            ) : hasError ? (
              <Icon name="error" size={18} className="text-neutral-700" />
            ) : hasSuccess ? (
              <Icon name="check_circle" size={18} className="text-neutral-700" />
            ) : rightIcon ? (
              <span className="text-neutral-400 pointer-events-none">
                {rightIcon}
              </span>
            ) : null}
          </span>
        </div>

        {(hint || error || success) && (
          <p
            className={cn(
              "text-xs",
              hasError   && "text-neutral-900",
              hasSuccess && "text-neutral-600",
              !hasError && !hasSuccess && "text-neutral-500"
            )}
          >
            {error ?? success ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

// ── Textarea ───────────────────────────────────────────────────────────────────
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:     string;
  hint?:      string;
  error?:     string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, fullWidth = true, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
            {props.required && <span className="text-neutral-900 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3",
            "text-sm text-neutral-900 placeholder:text-neutral-400",
            "focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900",
            "disabled:bg-neutral-50 disabled:cursor-not-allowed",
            "transition-colors duration-150 resize-none",
            error && "border-neutral-900 bg-neutral-50",
            className
          )}
          {...props}
        />
        {(hint || error) && (
          <p className={cn("text-xs", error ? "text-neutral-900" : "text-neutral-500")}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// ── SelectField ────────────────────────────────────────────────────────────────
export interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string;
  hint?:        string;
  error?:       string;
  fullWidth?:   boolean;
  options:      { value: string; label: string }[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      hint,
      error,
      fullWidth = true,
      options,
      placeholder,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
            {props.required && <span className="text-neutral-900 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full rounded-full border border-neutral-300 bg-white px-4 py-2.5 pr-10",
            "text-sm text-neutral-900",
            "focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900",
            "disabled:bg-neutral-50 disabled:cursor-not-allowed",
            "transition-colors duration-150 appearance-none cursor-pointer",
            "bg-[url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")] bg-[right_14px_center] bg-no-repeat",
            error && "border-neutral-900",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {(hint || error) && (
          <p className={cn("text-xs", error ? "text-neutral-900" : "text-neutral-500")}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";
