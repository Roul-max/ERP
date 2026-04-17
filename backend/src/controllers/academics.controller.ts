import Batch from "../models/Batch";
import Student from "../models/Student";

const toInt = (value: unknown, fallback: number) => {
  const n = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

export const listBatches = async (req: any, res: any) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 20), 5), 100);
    const skip = (page - 1) * limit;

    const department = (req.query.department || "").toString().trim();
    const year = req.query.year ? toInt(req.query.year, 0) : 0;
    const isActive =
      typeof req.query.isActive === "string"
        ? req.query.isActive === "true"
        : undefined;

    const filter: any = {};
    if (department) filter.department = department;
    if (year) filter.year = year;
    if (typeof isActive === "boolean") filter.isActive = isActive;

    const [total, batches] = await Promise.all([
      Batch.countDocuments(filter),
      Batch.find(filter).sort({ year: -1, department: 1, name: 1 }).skip(skip).limit(limit).lean(),
    ]);

    res.json({
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      batches,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load batches" });
  }
};

export const createBatch = async (req: any, res: any) => {
  try {
    const { year, department, name, sections, isActive } = req.body || {};
    const y = toInt(year, 0);
    if (!y) return res.status(400).json({ message: "Year is required" });
    if (!department || typeof department !== "string") {
      return res.status(400).json({ message: "Department is required" });
    }
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Batch name is required" });
    }

    const batch = await Batch.create({
      year: y,
      department: department.trim(),
      name: name.trim(),
      sections: Array.isArray(sections)
        ? sections.map((s) => String(s).trim()).filter(Boolean)
        : [],
      isActive: typeof isActive === "boolean" ? isActive : true,
      createdBy: req.user?._id,
    } as any);

    res.status(201).json(batch);
  } catch (error: any) {
    const message =
      error?.code === 11000
        ? "Batch already exists"
        : error.message || "Failed to create batch";
    res.status(400).json({ message });
  }
};

export const updateBatch = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const { year, department, name, sections, isActive } = req.body || {};

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    if (year !== undefined) batch.year = toInt(year, batch.year);
    if (department !== undefined) batch.department = String(department).trim();
    if (name !== undefined) batch.name = String(name).trim();
    if (sections !== undefined) {
      batch.sections = Array.isArray(sections)
        ? sections.map((s) => String(s).trim()).filter(Boolean)
        : [];
    }
    if (isActive !== undefined) batch.isActive = Boolean(isActive);

    const saved = await batch.save();
    res.json(saved);
  } catch (error: any) {
    const message =
      error?.code === 11000
        ? "Batch already exists"
        : error.message || "Failed to update batch";
    res.status(400).json({ message });
  }
};

export const deleteBatch = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const batch = await Batch.findByIdAndDelete(id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete batch" });
  }
};

export const batchStats = async (_req: any, res: any) => {
  try {
    const byBatch = await Student.aggregate([
      { $group: { _id: { department: "$department", batch: "$batch" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(
      (byBatch as any[]).map((r) => ({
        department: r?._id?.department,
        batch: r?._id?.batch,
        count: r?.count || 0,
      }))
    );
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load stats" });
  }
};

