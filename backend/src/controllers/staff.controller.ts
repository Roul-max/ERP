import Staff from "../models/Staff";
import User from "../models/User";

const toInt = (value: unknown, fallback: number) => {
  const n = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const monthKey = (value: string) => {
  // expect YYYY-MM
  return /^\d{4}-\d{2}$/.test(value) ? value : "";
};

export const listStaff = async (req: any, res: any) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 20), 5), 100);
    const skip = (page - 1) * limit;
    const q = (req.query.q || "").toString().trim();
    const department = (req.query.department || "").toString().trim();

    const staffFilter: any = {};
    if (department) staffFilter.department = department;

    const userFilter: any = {};
    if (q) {
      userFilter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    let userIds: any[] | null = null;
    if (q) {
      userIds = (await User.find(userFilter).select("_id").lean()).map((u: any) => u._id);
      staffFilter.user = { $in: userIds.length ? userIds : [] };
    }

    const [total, staff] = await Promise.all([
      Staff.countDocuments(staffFilter),
      Staff.find(staffFilter)
        .populate("user", "name email role isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      staff,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load staff" });
  }
};

export const createStaff = async (req: any, res: any) => {
  try {
    const { user: userPayload, department, designation, joiningDate, salary, phone } = req.body || {};
    if (!userPayload?.name || !userPayload?.email) {
      return res.status(400).json({ message: "User name and email are required" });
    }
    if (!department || !designation || !joiningDate || salary === undefined) {
      return res.status(400).json({ message: "Department, designation, joiningDate and salary are required" });
    }

    const email = String(userPayload.email).trim().toLowerCase();
    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      if (!userPayload.password) {
        return res.status(400).json({ message: "Password is required for new staff user" });
      }
      user = await User.create({
        name: String(userPayload.name).trim(),
        email,
        password: String(userPayload.password),
        role: userPayload.role || "faculty",
        isActive: true,
      } as any);
    } else {
      // Update basic fields if provided
      user.name = String(userPayload.name).trim() || user.name;
      user.role = userPayload.role || user.role;
      if (userPayload.password) user.password = String(userPayload.password);
      if (typeof userPayload.isActive === "boolean") user.isActive = userPayload.isActive;
      await user.save();
    }

    const staff = await Staff.create({
      user: user._id,
      department: String(department).trim(),
      designation: String(designation).trim(),
      joiningDate: new Date(joiningDate),
      salary: Number(salary),
      phone: phone ? String(phone).trim() : undefined,
    } as any);

    const populated = await Staff.findById(staff._id).populate("user", "name email role isActive");
    res.status(201).json(populated);
  } catch (error: any) {
    const message =
      error?.code === 11000
        ? "Staff entry already exists"
        : error.message || "Failed to create staff";
    res.status(400).json({ message });
  }
};

export const updateStaff = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const { user: userPayload, department, designation, joiningDate, salary, phone } = req.body || {};

    if (department !== undefined) staff.department = String(department).trim();
    if (designation !== undefined) staff.designation = String(designation).trim();
    if (joiningDate !== undefined) staff.joiningDate = new Date(joiningDate);
    if (salary !== undefined) staff.salary = Number(salary);
    if (phone !== undefined) staff.phone = phone ? String(phone).trim() : "";

    await staff.save();

    if (userPayload) {
      const user = await User.findById(staff.user).select("+password");
      if (user) {
        if (userPayload.name !== undefined) user.name = String(userPayload.name).trim();
        if (userPayload.email !== undefined) user.email = String(userPayload.email).trim().toLowerCase();
        if (userPayload.role !== undefined) user.role = userPayload.role;
        if (userPayload.password) user.password = String(userPayload.password);
        if (typeof userPayload.isActive === "boolean") user.isActive = userPayload.isActive;
        await user.save();
      }
    }

    const populated = await Staff.findById(id).populate("user", "name email role isActive");
    res.json(populated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to update staff" });
  }
};

export const deleteStaff = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const staff = await Staff.findByIdAndDelete(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete staff" });
  }
};

export const payrollSummary = async (req: any, res: any) => {
  try {
    const month = monthKey(String(req.query.month || ""));
    if (!month) {
      return res.status(400).json({ message: "month must be in YYYY-MM format" });
    }

    const staff = await Staff.find({}).lean();
    const totalAnnual = staff.reduce((s, r: any) => s + (Number(r.salary) || 0), 0);
    const totalMonthly = Math.round((totalAnnual / 12) * 100) / 100;

    const byDepartmentMap = new Map<string, { department: string; staffCount: number; annual: number; monthly: number }>();
    for (const r of staff as any[]) {
      const dept = (r.department || "Unknown").toString();
      const current = byDepartmentMap.get(dept) || { department: dept, staffCount: 0, annual: 0, monthly: 0 };
      const annual = Number(r.salary) || 0;
      current.staffCount += 1;
      current.annual += annual;
      byDepartmentMap.set(dept, current);
    }
    const byDepartment = [...byDepartmentMap.values()].map((d) => ({
      ...d,
      monthly: Math.round((d.annual / 12) * 100) / 100,
    }));
    byDepartment.sort((a, b) => b.annual - a.annual);

    res.json({
      month,
      staffCount: staff.length,
      total: { annual: totalAnnual, monthly: totalMonthly },
      byDepartment,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load payroll" });
  }
};

