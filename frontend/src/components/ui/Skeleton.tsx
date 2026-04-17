import React from "react";
import { cn } from "../../utils/cn";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "block" | "text";
};

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "block",
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl",
        "bg-slate-200/70 dark:bg-slate-800/70",
        variant === "text" ? "h-4" : "h-10",
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;

