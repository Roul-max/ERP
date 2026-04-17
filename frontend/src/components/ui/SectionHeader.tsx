import React from "react";
import { cn } from "../../utils/cn";

type SectionHeaderProps = {
  title: string;
  description?: string;
  right?: React.ReactNode;
  className?: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  right,
  className,
}) => {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
};

export default SectionHeader;

