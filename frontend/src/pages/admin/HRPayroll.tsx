import React, { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  IndianRupee,
  Mail,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";
import SectionHeader from "../../components/ui/SectionHeader";
import Select from "../../components/ui/Select";
import ConfirmModal from "../../components/ConfirmModal";
import { formatCurrency } from "../../utils/format";
import { toastError, toastSuccess } from "../../utils/toast";

type StaffRow = {
  _id: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: number;
  phone?: string;
  user: { _id: string; name: string; email: string; role: "admin" | "faculty" | "student"; isActive: boolean };
};

type PayrollSummary = {
  month: string;
  staffCount: number;
  total: { annual: number; monthly: number };
  byDepartment: { department: string; staffCount: number; annual: number; monthly: number }[];
};

const HRPayroll: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"staff" | "payroll">("staff");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [search, setSearch] = useState("");

  const now = new Date();
  const initialMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [payrollMonth, setPayrollMonth] = useState(initialMonth);
  const [payroll, setPayroll] = useState<PayrollSummary | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "faculty" as "faculty" | "admin" | "student",
    department: "Computer Science",
    designation: "Professor",
    joiningDate: new Date().toISOString().slice(0, 10),
    salary: "600000",
    phone: "",
    isActive: true,
  });

  const resetForm = (row?: StaffRow) => {
    setForm({
      name: row?.user?.name ?? "",
      email: row?.user?.email ?? "",
      password: "",
      role: (row?.user?.role ?? "faculty") as any,
      department: row?.department ?? "Computer Science",
      designation: row?.designation ?? "Professor",
      joiningDate: row?.joiningDate ? new Date(row.joiningDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      salary: String(row?.salary ?? 600000),
      phone: row?.phone ?? "",
      isActive: row?.user?.isActive ?? true,
    });
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await client.get("/staff", { params: { page: 1, limit: 50, q: search } });
      setStaff(res.data.staff || []);
    } catch (e: any) {
      setStaff([]);
      toastError(e?.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await client.get("/staff/payroll/summary", { params: { month: payrollMonth } });
      setPayroll(res.data);
    } catch (e: any) {
      setPayroll(null);
      toastError(e?.response?.data?.message || "Failed to load payroll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "staff") fetchStaff();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "payroll") fetchPayroll();
  }, [activeTab, payrollMonth]);

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setShowForm(true);
  };

  const openEdit = (row: StaffRow) => {
    setEditing(row);
    resetForm(row);
    setShowForm(true);
  };

  const saveStaff = async () => {
    const payload = {
      user: {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        role: form.role,
        isActive: form.isActive,
      },
      department: form.department,
      designation: form.designation,
      joiningDate: form.joiningDate,
      salary: Number(form.salary),
      phone: form.phone || undefined,
    };
    try {
      if (editing) {
        await client.put(`/staff/${editing._id}`, payload);
        toastSuccess("Staff updated");
      } else {
        await client.post("/staff", payload);
        toastSuccess("Staff created");
      }
      setShowForm(false);
      setEditing(null);
      fetchStaff();
    } catch (e: any) {
      toastError(e?.response?.data?.message || "Failed to save staff");
    }
  };

  const doDelete = async () => {
    if (!deleteId) return;
    try {
      await client.delete(`/staff/${deleteId}`);
      toastSuccess("Staff deleted");
      setDeleteId(null);
      fetchStaff();
    } catch (e: any) {
      toastError(e?.response?.data?.message || "Failed to delete staff");
    }
  };

  const kpis = useMemo(() => {
    const count = staff.length;
    const annual = staff.reduce((s, r) => s + (Number(r.salary) || 0), 0);
    const monthly = Math.round((annual / 12) * 100) / 100;
    const departments = new Set(staff.map((s) => s.department));
    return { count, annual, monthly, departments: departments.size };
  }, [staff]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR & payroll"
        description="Manage staff profiles and review payroll summaries."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total staff
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {kpis.count}
            </p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly payroll
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(kpis.monthly)}
            </p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Departments
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {kpis.departments}
            </p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 p-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={[
              "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
              activeTab === "staff"
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-slate-200/70 dark:border-slate-800/70 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-900/60 border border-transparent",
            ].join(" ")}
          >
            Staff directory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payroll")}
            className={[
              "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
              activeTab === "payroll"
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-slate-200/70 dark:border-slate-800/70 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-900/60 border border-transparent",
            ].join(" ")}
          >
            Payroll
          </button>
        </div>

        <div className="p-6">
          {activeTab === "staff" ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <SectionHeader
                  title="Staff directory"
                  description="Create, edit and deactivate staff users."
                />
                <div className="flex items-center gap-2">
                  <Input
                    label="Search"
                    placeholder="Name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchStaff();
                    }}
                    className="md:w-72"
                  />
                  <Button
                    variant="secondary"
                    leftIcon={<RefreshCcw size={16} />}
                    onClick={fetchStaff}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  <Button leftIcon={<Plus size={18} />} onClick={openCreate}>
                    Add staff
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  <thead className="bg-slate-50/60 dark:bg-slate-900/40">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                        Staff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                        Salary (annual)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 bg-white/70 dark:bg-slate-900/30">
                    {staff.map((s) => (
                      <tr key={s._id}>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {s.user?.name}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {s.user?.email} · {s.designation}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {s.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {formatCurrency(s.salary)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEdit(s)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              leftIcon={<Trash2 size={16} />}
                              onClick={() => setDeleteId(s._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {staff.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-10 text-center text-sm text-slate-600 dark:text-slate-400"
                        >
                          No staff records found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === "payroll" ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <SectionHeader
                  title="Payroll summary"
                  description="Monthly view based on annual salaries (salary ÷ 12)."
                />
                <div className="flex items-center gap-2">
                  <Input
                    label="Month (YYYY-MM)"
                    value={payrollMonth}
                    onChange={(e) => setPayrollMonth(e.target.value)}
                    className="md:w-56"
                  />
                  <Button
                    variant="secondary"
                    leftIcon={<RefreshCcw size={16} />}
                    onClick={fetchPayroll}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              {payroll ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Total monthly
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                      {formatCurrency(payroll.total.monthly)}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      Staff count: {payroll.staffCount}
                    </p>
                  </Card>
                  <Card className="p-6">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Total annual
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                      {formatCurrency(payroll.total.annual)}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      Month: {payroll.month}
                    </p>
                  </Card>
                </div>
              ) : null}

              <Card className="overflow-hidden">
                <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60">
                  <p className="font-bold text-slate-900 dark:text-white">
                    By department
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    <thead className="bg-slate-50/60 dark:bg-slate-900/40">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Staff
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Monthly
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Annual
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 bg-white/70 dark:bg-slate-900/30">
                      {(payroll?.byDepartment || []).map((d) => (
                        <tr key={d.department}>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                            {d.department}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {d.staffCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {formatCurrency(d.monthly)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {formatCurrency(d.annual)}
                          </td>
                        </tr>
                      ))}
                      {(payroll?.byDepartment || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center text-sm text-slate-600 dark:text-slate-400"
                          >
                            No payroll data found.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </Card>

      {showForm ? (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {editing ? "Edit staff" : "Add staff"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Create a linked user account and the staff profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                <Input
                  label={editing ? "New password (optional)" : "Password"}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  hint={editing ? "Leave blank to keep current password" : undefined}
                />
                <Select label="Role" value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as any }))}>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </Select>
                <Input label="Department" value={form.department} onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))} />
                <Input label="Designation" value={form.designation} onChange={(e) => setForm((s) => ({ ...s, designation: e.target.value }))} />
                <Input label="Joining date" type="date" value={form.joiningDate} onChange={(e) => setForm((s) => ({ ...s, joiningDate: e.target.value }))} />
                <Input label="Salary (annual)" type="number" value={form.salary} onChange={(e) => setForm((s) => ({ ...s, salary: e.target.value }))} />
                <Input label="Phone (optional)" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
                <Select
                  label="Status"
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.value === "active" }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <Button variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={saveStaff} leftIcon={<Save size={18} />}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={doDelete}
        title="Delete staff"
        message="Delete this staff profile? This does not delete the linked user account."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default HRPayroll;
