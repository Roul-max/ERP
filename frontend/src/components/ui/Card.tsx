import React from "react";
import { cn } from "../../utils/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "solid";
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border shadow-sm",
        variant === "solid"
          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          : "bg-white/80 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export default Card;

