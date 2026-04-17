import React, { useEffect } from "react";
import { CheckCircle2, Info, AlertTriangle, X, XCircle } from "lucide-react";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/cn";

const iconByType = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
} as const;

const stylesByType = {
  success:
    "border-emerald-200/70 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100",
  info: "border-blue-200/70 bg-blue-50/80 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100",
  warning:
    "border-amber-200/70 bg-amber-50/80 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100",
  error:
    "border-red-200/70 bg-red-50/80 text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100",
} as const;

const GlobalToast: React.FC = () => {
  const { toast, setToast } = useUI();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast, setToast]);

  if (!toast) return null;

  const Icon = iconByType[toast.type];

  return (
    <div className="fixed top-4 right-4 z-[110] w-full max-w-sm px-2">
      <div
        className={cn(
          "rounded-2xl border shadow-lg backdrop-blur-xl",
          "px-4 py-3 flex items-start gap-3",
          stylesByType[toast.type]
        )}
        role="status"
        aria-live="polite"
      >
        <Icon size={18} className="mt-0.5 shrink-0 opacity-90" />
        <div className="text-sm font-semibold leading-5 flex-1">{toast.message}</div>
        <button
          onClick={() => setToast(null)}
          className="rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default GlobalToast;

