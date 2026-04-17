import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { BarChart3, PieChart, TrendingUp, Download } from "lucide-react";
import client from "../../api/client";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import SectionHeader from "../../components/ui/SectionHeader";
import Skeleton from "../../components/ui/Skeleton";
import { formatCurrency } from "../../utils/format";

type OverviewResponse = {
  rangeDays: number;
  paidByMonth: { month: string; amount: number; count: number }[];
  pendingByMonth: { month: string; amount: number; count: number }[];
  attendanceByDay: {
    day: string;
    present: number;
    absent: number;
    late: number;
    total: number;
    rate: number;
  }[];
  performanceByExam?: {
    examId: string;
    name: string;
    date: string;
    averagePercent: number;
    submissions: number;
  }[];
};

const prettyMonth = (value: string) => {
  if (!value) return value;
  const [y, m] = value.split("-");
  const month = Number(m);
  const short = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];
  return short ? `${short} ${y}` : value;
};

const downloadFile = (filename: string, contentType: string, data: string) => {
  const blob = new Blob([data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const toCsv = (rows: Record<string, any>[]) => {
  const keys = rows.length ? Object.keys(rows[0]) : [];
  const escapeCell = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    const needs = /[",\n]/.test(s);
    return needs ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = keys.join(",");
  const body = rows.map((r) => keys.map((k) => escapeCell(r[k])).join(",")).join("\n");
  return [header, body].filter(Boolean).join("\n");
};

const Reports: React.FC = () => {
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    setError("");
    setLoading(true);
    client
      .get(`/analytics/overview?rangeDays=${rangeDays}`)
      .then((res) => {
        if (!active) return;
        setData(res.data);
      })
      .catch((e) => {
        if (!active) return;
        setError(e?.response?.data?.message || "Failed to load reports");
        setData(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [rangeDays]);

  const generatedOn = useMemo(() => new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }), []);

  const totals = useMemo(() => {
    const paid = (data?.paidByMonth || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const pending = (data?.pendingByMonth || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
    return { paid, pending };
  }, [data]);

  const performanceSeries = useMemo(() => {
    return (data?.performanceByExam || []).map((r) => ({
      name: r.name,
      date: new Date(r.date).toISOString().slice(0, 10),
      averagePercent: r.averagePercent,
      submissions: r.submissions,
    }));
  }, [data]);

  const exportAll = () => {
    if (!data) return;
    downloadFile(
      `ace-reports-${rangeDays}d-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json",
      JSON.stringify(data, null, 2)
    );
  };

  const downloadAttendanceCsv = () => {
    const rows = (data?.attendanceByDay || []).map((r) => ({
      day: r.day,
      attendanceRatePercent: r.rate,
      present: r.present,
      late: r.late,
      absent: r.absent,
      total: r.total,
    }));
    downloadFile(
      `attendance-${rangeDays}d-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv",
      toCsv(rows)
    );
  };

  const downloadFeesCsv = () => {
    const months = new Set<string>();
    for (const r of data?.paidByMonth || []) months.add(r.month);
    for (const r of data?.pendingByMonth || []) months.add(r.month);
    const rows = [...months]
      .sort((a, b) => a.localeCompare(b))
      .map((month) => {
        const paid = (data?.paidByMonth || []).find((p) => p.month === month);
        const pending = (data?.pendingByMonth || []).find((p) => p.month === month);
        return {
          month,
          paidAmount: paid?.amount ?? 0,
          paidCount: paid?.count ?? 0,
          pendingAmount: pending?.amount ?? 0,
          pendingCount: pending?.count ?? 0,
        };
      });
    downloadFile(
      `fees-${rangeDays}d-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv",
      toCsv(rows)
    );
  };

  const downloadPerformanceCsv = () => {
    const rows = (performanceSeries || []).map((r) => ({
      date: r.date,
      exam: r.name,
      averagePercent: r.averagePercent,
      submissions: r.submissions,
    }));
    downloadFile(
      `performance-${rangeDays}d-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv",
      toCsv(rows)
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & reports"
        description="Export key KPIs and download generated datasets."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/50 p-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setRangeDays(d as any)}
                  className={[
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors",
                    rangeDays === d
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900/60",
                  ].join(" ")}
                >
                  {d}d
                </button>
              ))}
            </div>
            <Button onClick={exportAll} leftIcon={<Download size={18} />} disabled={!data || loading}>
              Export data
            </Button>
          </div>
        }
      />

      {error ? (
        <Card className="p-4 border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 text-red-800 dark:text-red-200">
          <p className="text-sm font-semibold">{error}</p>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <SectionHeader title="Attendance trends" description={`Rate over the last ${rangeDays} days`} />
          <div className="h-44 mt-3">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.attendanceByDay || []} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v: any) => `${v}%`} labelFormatter={(l: any) => String(l)} />
                  <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Fee collection" description={`Paid vs pending (${rangeDays}d)`} />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paid: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totals.paid)}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pending: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totals.pending)}</span>
            </p>
          </div>
          <div className="h-44 mt-3">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.paidByMonth || []} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={prettyMonth} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  <Bar dataKey="amount" fill="#22c55e" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Academic performance" description="Average score by exam" />
          <div className="h-44 mt-3">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : performanceSeries.length === 0 ? (
              <div className="h-full rounded-xl bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                No result data in this range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceSeries} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Line type="monotone" dataKey="averagePercent" stroke="#a855f7" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
      
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">Generated downloads</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generated on {generatedOn}
          </p>
        </div>
        <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-800/60">
          <thead className="bg-slate-50/60 dark:bg-slate-900/40">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                Report
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
            <tr>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" /> Attendance ({rangeDays}d)
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">CSV</td>
              <td className="px-6 py-4 text-right">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold text-sm disabled:opacity-50"
                  onClick={downloadAttendanceCsv}
                  disabled={!data || loading}
                >
                  Download
                </button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart size={16} className="text-green-500" /> Fees ({rangeDays}d)
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">CSV</td>
              <td className="px-6 py-4 text-right">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold text-sm disabled:opacity-50"
                  onClick={downloadFeesCsv}
                  disabled={!data || loading}
                >
                  Download
                </button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-500" /> Performance ({rangeDays}d)
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">CSV</td>
              <td className="px-6 py-4 text-right">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold text-sm disabled:opacity-50"
                  onClick={downloadPerformanceCsv}
                  disabled={!data || loading || performanceSeries.length === 0}
                >
                  Download
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Reports;
