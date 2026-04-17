import React from "react";
import type { LucideIcon } from "lucide-react";
import Card from "./Card";
import { cn } from "../../utils/cn";

type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  accent?: string;
  hint?: string;
  loading?: boolean;
  className?: string;
};

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  accent = "from-blue-600 to-indigo-700",
  hint,
  loading,
  className,
}) => {
  return (
    <Card className={cn("p-5 overflow-hidden relative", className)}>
      <div className={cn("absolute inset-0 opacity-[0.08] bg-gradient-to-br", accent)} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {loading ? (
              <div className="h-7 w-28 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
            ) : (
              value
            )}
          </div>
          {hint ? (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {hint}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "shrink-0 rounded-2xl p-3 shadow-lg",
            "bg-white/70 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60"
          )}
        >
          <Icon size={20} className="text-slate-700 dark:text-slate-200" />
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;

