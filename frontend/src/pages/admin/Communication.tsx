import React, { useEffect, useMemo, useState } from "react";
import { Bell, Mail, RefreshCcw } from "lucide-react";
import SendNotification from "./SendNotification";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import SectionHeader from "../../components/ui/SectionHeader";
import { toastError } from "../../utils/toast";

type Broadcast = {
  _id: string;
  title: string;
  message: string;
  type: string;
  channel: "inApp" | "email";
  stats?: { matchedUsers: number; inAppCreated: number; emailPlanned: number };
  createdAt?: string;
};

const Communication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"broadcast" | "logs">("broadcast");
  const [channelFilter, setChannelFilter] = useState<"all" | "inApp" | "email">(
    "all"
  );
  const [rows, setRows] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 50 };
      if (channelFilter !== "all") params.channel = channelFilter;
      const res = await client.get("/notifications/broadcasts", { params });
      setRows(res.data.broadcasts || []);
    } catch (e: any) {
      setRows([]);
      toastError(e?.response?.data?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "logs") return;
    fetchLogs();
  }, [activeTab, channelFilter]);

  const tabs = useMemo(
    () => [
      { key: "broadcast" as const, label: "Broadcasts", icon: Bell },
      { key: "logs" as const, label: "Delivery logs", icon: Mail },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication"
        description="Create broadcasts and review delivery activity."
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 p-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={[
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-slate-200/70 dark:border-slate-800/70 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-900/60 border border-transparent",
                ].join(" ")}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "broadcast" ? <SendNotification /> : null}

          {activeTab === "logs" ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <SectionHeader
                  title="Broadcast logs"
                  description="In-app broadcasts create notifications; email broadcasts are queued (simulation)."
                />
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/50 p-1">
                    {(["all", "inApp", "email"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setChannelFilter(c)}
                        className={[
                          "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors",
                          channelFilter === c
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900/60",
                        ].join(" ")}
                      >
                        {c === "all" ? "All" : c === "inApp" ? "In-app" : "Email"}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={fetchLogs}
                    disabled={loading}
                    leftIcon={<RefreshCcw size={16} />}
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              {rows.length === 0 && !loading ? (
                <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/40 p-10 text-center">
                  <Mail size={44} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    No broadcasts yet
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Send your first broadcast to populate the logs.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                  <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    <thead className="bg-slate-50/60 dark:bg-slate-900/40">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Channel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Audience
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 bg-white/70 dark:bg-slate-900/30">
                      {rows.map((b) => (
                        <tr key={b._id}>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {b.title}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                              {b.message}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {b.channel === "email" ? "Email" : "In-app"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {b.channel === "email"
                              ? `${b.stats?.emailPlanned ?? 0} planned`
                              : `${b.stats?.inAppCreated ?? 0} created`}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default Communication;
