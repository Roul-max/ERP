import User from "../models/User";
import Student from "../models/Student";
import Course from "../models/Course";
import Fee from "../models/Fee";
import Notification from "../models/Notification";
import Attendance from "../models/Attendance";
import Result from "../models/Result";

const toInt = (value: unknown, fallback: number) => {
  const n = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const utcDay = (d: Date) => {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
};

export const getOverview = async (req: any, res: any) => {
  try {
    const rangeDays = Math.min(Math.max(toInt(req.query.rangeDays, 30), 7), 365);
    const now = new Date();
    const startDate = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const [
      usersTotal,
      studentsTotal,
      coursesTotal,
      feesAgg,
      studentsByDepartment,
      studentsByBatch,
      paidByMonth,
      pendingByMonth,
      feesByType,
      signupsByDay,
      unreadNotifications,
      attendanceByDayAgg,
      performanceByExamAgg,
    ] = await Promise.all([
      User.countDocuments({}),
      Student.countDocuments({}),
      Course.countDocuments({}),
      Fee.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]),
      Student.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Student.aggregate([
        { $group: { _id: "$batch", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Fee.aggregate([
        {
          $match: {
            status: "Paid",
            paymentDate: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$paymentDate" } },
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Fee.aggregate([
        {
          $match: {
            status: "Pending",
            dueDate: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$dueDate" } },
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Fee.aggregate([
        { $match: { dueDate: { $gte: startDate } } },
        {
          $group: {
            _id: "$type",
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Notification.countDocuments({ recipient: req.user._id, read: false }),
      Attendance.aggregate([
        { $match: { date: { $gte: utcDay(startDate) } } },
        { $unwind: "$records" },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              status: "$records.status",
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Result.aggregate([
        {
          $lookup: {
            from: "exams",
            localField: "exam",
            foreignField: "_id",
            as: "exam",
          },
        },
        { $unwind: "$exam" },
        { $match: { "exam.date": { $gte: startDate } } },
        {
          $group: {
            _id: "$exam._id",
            name: { $first: "$exam.name" },
            date: { $first: "$exam.date" },
            totalMarks: { $first: "$exam.totalMarks" },
            averageMarks: { $avg: "$marksObtained" },
            count: { $sum: 1 },
          },
        },
        { $sort: { date: 1 } },
        { $limit: 12 },
      ]),
    ]);

    const feeSummary = feesAgg.reduce(
      (acc: any, row: any) => {
        const key = row._id || "Unknown";
        acc.byStatus[key] = { count: row.count || 0, amount: row.amount || 0 };
        acc.totalCount += row.count || 0;
        acc.totalAmount += row.amount || 0;
        return acc;
      },
      { byStatus: {}, totalCount: 0, totalAmount: 0 }
    );

    const attendanceByDayMap = new Map<
      string,
      { present: number; absent: number; late: number; total: number }
    >();
    for (const row of attendanceByDayAgg as any[]) {
      const day = row?._id?.day as string;
      const status = row?._id?.status as "Present" | "Absent" | "Late";
      const count = row?.count as number;
      if (!day) continue;
      const current = attendanceByDayMap.get(day) || {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      };
      if (status === "Present") current.present += count;
      else if (status === "Absent") current.absent += count;
      else if (status === "Late") current.late += count;
      current.total += count;
      attendanceByDayMap.set(day, current);
    }

    const attendanceByDay = [...attendanceByDayMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, v]) => ({
        day,
        present: v.present,
        absent: v.absent,
        late: v.late,
        total: v.total,
        rate:
          v.total === 0 ? 0 : Math.round(((v.present + v.late) / v.total) * 1000) / 10,
      }));

    const performanceByExam = (performanceByExamAgg as any[]).map((r) => {
      const total = Number(r.totalMarks) || 0;
      const avg = Number(r.averageMarks) || 0;
      const percent = total <= 0 ? 0 : Math.round((avg / total) * 1000) / 10;
      return {
        examId: r._id,
        name: r.name,
        date: r.date,
        averagePercent: percent,
        submissions: Number(r.count) || 0,
      };
    });

    res.json({
      rangeDays,
      totals: {
        users: usersTotal,
        students: studentsTotal,
        courses: coursesTotal,
        unreadNotifications,
      },
      fees: feeSummary,
      studentsByDepartment: (studentsByDepartment as any[]).map((r) => ({
        department: r._id,
        count: r.count,
      })),
      studentsByBatch: (studentsByBatch as any[]).map((r) => ({
        batch: r._id,
        count: r.count,
      })),
      paidByMonth: (paidByMonth as any[]).map((r) => ({
        month: r._id,
        amount: r.amount,
        count: r.count,
      })),
      pendingByMonth: (pendingByMonth as any[]).map((r) => ({
        month: r._id,
        amount: r.amount,
        count: r.count,
      })),
      feesByType: (feesByType as any[]).map((r) => ({
        type: r._id || "Unknown",
        amount: r.amount,
        count: r.count,
      })),
      signupsByDay: (signupsByDay as any[]).map((r) => ({
        day: r._id,
        count: r.count,
      })),
      attendanceByDay,
      performanceByExam,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load analytics" });
  }
};
