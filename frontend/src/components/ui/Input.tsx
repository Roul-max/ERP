import React from "react";
import { cn } from "../../utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  leftIcon?: React.ReactNode;
  label?: string;
  hint?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, label, hint, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="space-y-2">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          {leftIcon ? (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input",
              leftIcon ? "pl-10" : "",
              error
                ? "border-red-300 dark:border-red-900/60 focus:border-red-400 dark:focus:border-red-700"
                : "",
              className
            )}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-xs font-semibold text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;

