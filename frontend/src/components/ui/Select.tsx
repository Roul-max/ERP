import React from "react";
import { cn } from "../../utils/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, children, ...props }, ref) => {
    const selectId = id || React.useId();
    return (
      <div className="space-y-2">
        {label ? (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        ) : null}

        <select
          ref={ref}
          id={selectId}
          className={cn(
            "input appearance-none pr-10",
            error
              ? "border-red-300 dark:border-red-900/60 focus:border-red-400 dark:focus:border-red-700"
              : "",
            className
          )}
          {...props}
        >
          {children}
        </select>

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
Select.displayName = "Select";

export default Select;

