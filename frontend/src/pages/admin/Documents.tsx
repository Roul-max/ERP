import React, { useEffect, useMemo, useState } from "react";
import { Download, FileText, Search, Trash2, UploadCloud, X } from "lucide-react";
import client from "../../api/client";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import SectionHeader from "../../components/ui/SectionHeader";
import Skeleton from "../../components/ui/Skeleton";

type DocRow = {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  uploadedBy?: { name: string; email: string; role: string };
};

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let idx = 0;
  let v = bytes;
  while (v >= 1024 && idx < units.length - 1) {
    v /= 1024;
    idx++;
  }
  return `${v.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const Documents: React.FC = () => {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await client.get("/documents", { params: { q } });
      setDocs(res.data || []);
    } catch (e) {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchDocs(), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    fetchDocs();
  }, []);

  const filtered = useMemo(() => docs, [docs]);

  const download = async (row: DocRow) => {
    const res = await client.get(`/documents/${row._id}/download`, {
      responseType: "blob",
      ui: { silent: true },
    } as any);
    const blob = new Blob([res.data], { type: row.mimeType || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = row.originalName || row.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const remove = async (row: DocRow) => {
    if (!confirm("Delete this document?")) return;
    await client.delete(`/documents/${row._id}`);
    window.dispatchEvent(
      new CustomEvent("ui-toast", {
        detail: { type: "success", message: "Document deleted" },
      })
    );
    fetchDocs();
  };

  const submitUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await readFileAsDataUrl(file);
      await client.post("/documents", {
        name: docName.trim() || file.name,
        originalName: file.name,
        mimeType: file.type,
        base64,
      });
      setUploadOpen(false);
      setFile(null);
      setDocName("");
      window.dispatchEvent(
        new CustomEvent("ui-toast", {
          detail: { type: "success", message: "Document uploaded" },
        })
      );
      fetchDocs();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        description="Upload, organize and download campus documents."
        actions={
          <Button leftIcon={<UploadCloud size={18} />} onClick={() => setUploadOpen(true)}>
            Upload
          </Button>
        }
      />

      <Card className="p-6">
        <SectionHeader
          title="Library"
          description="Search by title or filename."
          right={
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search documents…"
                className="input pl-9"
              />
            </div>
          }
        />

        <div className="mt-5 overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-200/70 dark:divide-slate-800/70">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-slate-900/30">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-64" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Skeleton className="h-9 w-28 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center text-slate-500 dark:text-slate-300">
                      <FileText size={20} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                      No documents found
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Upload PDFs, DOCX or images to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 text-blue-600 dark:text-blue-300">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {doc.originalName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">
                        {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {doc.uploadedBy?.name || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {formatBytes(doc.sizeBytes)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Download size={16} />}
                          onClick={() => download(doc)}
                        >
                          Download
                        </Button>
                        <button
                          onClick={() => remove(doc)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          aria-label="Delete document"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {uploadOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-xl p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Upload document</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">PDF, DOCX, PNG, JPG (max 15MB)</p>
              </div>
              <button
                onClick={() => setUploadOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Title</label>
                <input
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Academic Calendar 2026"
                  className="input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-900 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-100 dark:hover:file:bg-slate-700"
                />
                {file ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Selected: <span className="font-semibold">{file.name}</span> ({formatBytes(file.size)})
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setUploadOpen(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={submitUpload} disabled={!file || uploading} leftIcon={<UploadCloud size={18} />}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default Documents;
