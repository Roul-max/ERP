import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Layers, Plus, Save, Trash2 } from "lucide-react";
import Courses from "./Courses";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";
import SectionHeader from "../../components/ui/SectionHeader";
import ConfirmModal from "../../components/ConfirmModal";
import { toastError, toastSuccess } from "../../utils/toast";

type Batch = {
  _id: string;
  year: number;
  department: string;
  name: string;
  sections: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const departments = [
  "Computer Science",
  "Electrical Engineering",
  "Business Administration",
  "Mechanical Engineering",
];

const Academics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"courses" | "batches">("courses");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    year: String(new Date().getFullYear()),
    department: departments[0],
    name: String(new Date().getFullYear()),
    sections: "A,B",
    isActive: true,
  });

  const resetForm = (b?: Batch) => {
    const year = b?.year ?? new Date().getFullYear();
    setForm({
      year: String(year),
      department: b?.department ?? departments[0],
      name: b?.name ?? String(year),
      sections: (b?.sections || ["A", "B"]).join(","),
      isActive: b?.isActive ?? true,
    });
  };

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await client.get("/academics/batches", {
        params: { page: 1, limit: 50 },
      });
      setBatches(res.data.batches || []);
    } catch (e: any) {
      setBatches([]);
      toastError(e?.response?.data?.message || "Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "batches") return;
    fetchBatches();
  }, [activeTab]);

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setShowForm(true);
  };

  const openEdit = (b: Batch) => {
    setEditing(b);
    resetForm(b);
    setShowForm(true);
  };

  const saveBatch = async () => {
    const payload = {
      year: Number(form.year),
      department: form.department,
      name: form.name,
      sections: form.sections
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: Boolean(form.isActive),
    };

    try {
      if (editing) {
        await client.put(`/academics/batches/${editing._id}`, payload);
        toastSuccess("Batch updated");
      } else {
        await client.post("/academics/batches", payload);
        toastSuccess("Batch created");
      }
      setShowForm(false);
      setEditing(null);
      fetchBatches();
    } catch (e: any) {
      toastError(e?.response?.data?.message || "Failed to save batch");
    }
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const doDelete = async () => {
    if (!deleteId) return;
    try {
      await client.delete(`/academics/batches/${deleteId}`);
      toastSuccess("Batch deleted");
      setDeleteId(null);
      fetchBatches();
    } catch (e: any) {
      toastError(e?.response?.data?.message || "Failed to delete batch");
    }
  };

  const tabClasses = (isActive: boolean) =>
    [
      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
      isActive
        ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-slate-200/70 dark:border-slate-800/70 shadow-sm"
        : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-900/60 border border-transparent",
    ].join(" ");

  const sortedBatches = useMemo(() => {
    const copy = batches.slice();
    copy.sort((a, b) => (b.year || 0) - (a.year || 0) || a.department.localeCompare(b.department));
    return copy;
  }, [batches]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academics"
        description="Manage courses and the academic structure (batches, departments, sections)."
        actions={
          activeTab === "batches" ? (
            <Button onClick={openCreate} leftIcon={<Plus size={18} />}>
              New batch
            </Button>
          ) : null
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 p-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            className={tabClasses(activeTab === "courses")}
          >
            <BookOpen size={16} /> Courses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("batches")}
            className={tabClasses(activeTab === "batches")}
          >
            <Layers size={16} /> Batches & classes
          </button>
        </div>

      <div className="mt-4">
        <div className="p-6">
          {activeTab === "courses" ? <Courses /> : null}

          {activeTab === "batches" ? (
            <div className="space-y-6">
              <div className="flex items-end justify-between gap-3">
                <SectionHeader
                  title="Batches"
                  description="Define cohorts by department/year and maintain sections."
                />
                <Button
                  variant="secondary"
                  onClick={fetchBatches}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>

              {sortedBatches.length === 0 && !loading ? (
                <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/40 p-10 text-center">
                  <Layers size={44} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    No batches configured yet
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Create your first batch to organize schedules and student cohorts.
                  </p>
                  <div className="mt-5 flex justify-center">
                    <Button onClick={openCreate} leftIcon={<Plus size={18} />}>
                      Create batch
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                  <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    <thead className="bg-slate-50/60 dark:bg-slate-900/40">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Sections
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 bg-white/70 dark:bg-slate-900/30">
                      {sortedBatches.map((b) => (
                        <tr key={b._id}>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                            {b.department}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {b.year}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {b.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {(b.sections || []).join(", ") || "—"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openEdit(b)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                leftIcon={<Trash2 size={16} />}
                                onClick={() => confirmDelete(b._id)}
                              >
                                Delete
                              </Button>
                            </div>
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
      </div>
      </Card>

      {showForm ? (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {editing ? "Edit batch" : "Create batch"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Keep names simple (e.g. 2026) and use sections like A,B,C.
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
                <Input
                  label="Year"
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <select
                    className="input"
                    value={form.department}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, department: e.target.value }))
                    }
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Batch name"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  hint="Example: 2026"
                />
                <Input
                  label="Sections"
                  value={form.sections}
                  onChange={(e) => setForm((s) => ({ ...s, sections: e.target.value }))}
                  hint="Comma-separated, e.g. A,B"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <Button
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={saveBatch} leftIcon={<Save size={18} />}>
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
        title="Delete batch"
        message="Delete this batch definition? This won't delete students, but it will remove the batch configuration."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default Academics;
