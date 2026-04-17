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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Activity, Bell, CalendarDays, GraduationCap, IndianRupee } from "lucide-react";
import client from "../../api/client";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import MetricCard from "../../components/ui/MetricCard";
import SectionHeader from "../../components/ui/SectionHeader";
import Skeleton from "../../components/ui/Skeleton";
import { formatCurrency } from "../../utils/format";

type OverviewResponse = {
  rangeDays: number;
  totals: { users: number; students: number; courses: number; unreadNotifications: number };
  fees: {
    byStatus: Record<string, { count: number; amount: number }>;
    totalCount: number;
    totalAmount: number;
  };
  feesByType: { type: string; count: number; amount: number }[];
  studentsByDepartment: { department: string; count: number }[];
  studentsByBatch: { batch: string; count: number }[];
  paidByMonth: { month: string; amount: number; count: number }[];
  pendingByMonth: { month: string; amount: number; count: number }[];
  signupsByDay: { day: string; count: number }[];
  attendanceByDay: {
    day: string;
    present: number;
    absent: number;
    late: number;
    total: number;
    rate: number;
  }[];
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#ef4444", "#a855f7"];
const prettyMonth = (value: string) => {
  if (!value) return value;
  const [y, m] = value.split("-");
  const month = Number(m);
  const short = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];
  return short ? `${short} ${y}` : value;
};
const prettyDay = (value: string) => (value ? value.slice(5) : value); // MM-DD

const Analytics: React.FC = () => {
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
        setError(e?.response?.data?.message || "Failed to load analytics");
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

  const kpis = useMemo(() => {
    if (!data) return [];
    const paid = (data.paidByMonth || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const pending = (data.pendingByMonth || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const attendanceLatest = data.attendanceByDay.at(-1)?.rate ?? 0;
    const attendanceAvg =
      data.attendanceByDay.length === 0
        ? 0
        : Math.round(
            (data.attendanceByDay.reduce((s, r) => s + (Number(r.rate) || 0), 0) /
              data.attendanceByDay.length) *
              10
          ) / 10;
    const collectionRate = paid + pending === 0 ? 0 : Math.round((paid / (paid + pending)) * 1000) / 10;

    return [
      {
        label: "Total students",
        value: data.totals.students.toLocaleString(),
        icon: GraduationCap,
        accent: "from-blue-600 to-indigo-700",
      },
      {
        label: `Collections (${data.rangeDays}d)`,
        value: formatCurrency(paid),
        icon: IndianRupee,
        accent: "from-emerald-600 to-teal-700",
      },
      {
        label: `Due (next ${data.rangeDays}d)`,
        value: formatCurrency(pending),
        icon: Activity,
        accent: "from-amber-600 to-orange-700",
      },
      {
        label: "Collection rate",
        value: `${collectionRate}%`,
        icon: Bell,
        accent: "from-violet-600 to-fuchsia-700",
      },
      {
        label: "Attendance",
        value: `${attendanceLatest}%`,
        hint: `Avg ${attendanceAvg}%`,
        icon: CalendarDays,
        accent: "from-slate-700 to-slate-900",
      },
    ];
  }, [data]);

  const feesByStatus = useMemo(() => {
    const byStatus = data?.fees.byStatus || {};
    return Object.entries(byStatus).map(([status, v]) => ({
      status,
      count: v.count,
      amount: v.amount,
    }));
  }, [data]);

  const feesByType = useMemo(() => {
    const rows = (data?.feesByType || []).slice();
    rows.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    return rows.slice(0, 6);
  }, [data]);

  const collectionsByMonth = useMemo(() => {
    const map = new Map<string, { month: string; paid: number; pending: number }>();
    for (const r of data?.paidByMonth || []) {
      map.set(r.month, { month: r.month, paid: Number(r.amount) || 0, pending: 0 });
    }
    for (const r of data?.pendingByMonth || []) {
      const cur = map.get(r.month) || { month: r.month, paid: 0, pending: 0 };
      cur.pending = Number(r.amount) || 0;
      map.set(r.month, cur);
    }
    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Deep visibility into operations, revenue, growth and engagement."
        actions={
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                variant={rangeDays === d ? "primary" : "secondary"}
                size="sm"
                onClick={() => setRangeDays(d as 7 | 30 | 90)}
              >
                {d}d
              </Button>
            ))}
          </div>
        }
      />

      {error ? (
        <Card className="p-6 border-red-200/60 dark:border-red-900/40 bg-red-50/70 dark:bg-red-950/20">
          <p className="text-sm font-semibold text-red-700 dark:text-red-200">{error}</p>
          <p className="text-xs text-red-600/80 dark:text-red-300/80 mt-1">
            Note: this page requires an admin account.
          </p>
        </Card>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {(loading && !data ? Array.from({ length: 5 }) : kpis).map((kpi: any, idx) => {
          if (loading && !data) {
            return (
              <Card key={idx} className="p-5">
                <Skeleton variant="text" className="w-28" />
                <Skeleton className="h-7 w-24 mt-3" />
                <Skeleton variant="text" className="w-16 mt-2" />
              </Card>
            );
          }

          return (
            <MetricCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              accent={kpi.accent}
            />
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-6 xl:col-span-2">
          <SectionHeader
            title="Revenue trend"
            description={`Paid fees aggregated by month (range: ${rangeDays} days)`}
            right={
              loading ? (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Loading...
                </span>
              ) : null
            }
          />
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.paidByMonth || []} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={prettyMonth} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(label: any) => prettyMonth(String(label))}
                  formatter={(v: any, name: any) => (name === "amount" ? formatCurrency(Number(v)) : v)}
                />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Fees mix" description="Count and amount by status" />
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feesByStatus} dataKey="amount" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {feesByStatus.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {feesByStatus.slice(0, 4).map((s) => (
              <div key={s.status} className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.status}</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(s.amount)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <SectionHeader
            title="Collections vs upcoming"
            description="Paid (by payment date) vs pending (by due date)"
          />
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionsByMonth} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={prettyMonth} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(label: any) => prettyMonth(String(label))}
                  formatter={(v: any) => formatCurrency(Number(v))}
                />
                <Legend />
                <Bar dataKey="paid" name="Paid" fill="#22c55e" radius={[10, 10, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Fees by type" description={`Top categories (range: ${rangeDays} days)`} />
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feesByType} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="amount" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {feesByType.length === 0 && !loading ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              No fee records found in this range.
            </p>
          ) : null}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <SectionHeader title="Students by department" description="Distribution of enrolled students" />
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.studentsByDepartment || []} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Students by batch" description="Enrollment by cohort (recent batches)" />
          <div className="h-72 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.studentsByBatch || []} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="batch" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <SectionHeader title="Engagement" description="Signups and attendance health over time" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="h-64">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              User signups
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.signupsByDay || []} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickFormatter={prettyDay} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(l: any) => String(l)} />
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Attendance rate
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.attendanceByDay || []} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickFormatter={prettyDay} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} labelFormatter={(l: any) => String(l)} />
                <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Attendance breakdown
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.attendanceByDay || []} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickFormatter={prettyDay} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(l: any) => String(l)} />
                <Legend />
                <Bar dataKey="present" stackId="a" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" stackId="a" fill="#f59e0b" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
