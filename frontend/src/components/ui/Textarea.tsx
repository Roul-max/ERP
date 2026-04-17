import React from "react";
import { cn } from "../../utils/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const textareaId = id || React.useId();
    return (
      <div className="space-y-2">
        {label ? (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "input min-h-[110px] resize-y py-3",
            error
              ? "border-red-300 dark:border-red-900/60 focus:border-red-400 dark:focus:border-red-700"
              : "",
            className
          )}
          {...props}
        />

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
Textarea.displayName = "Textarea";

export default Textarea;

