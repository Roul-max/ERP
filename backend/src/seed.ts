import dotenv from "dotenv";
import mongoose from "mongoose";
import * as dns from "node:dns";
import fs from "node:fs";
import path from "node:path";

import User from "./models/User";
import Student from "./models/Student";
import Staff from "./models/Staff";
import Course from "./models/Course";
import Attendance from "./models/Attendance";
import Fee from "./models/Fee";
import Exam from "./models/Exam";
import Result from "./models/Result";
import Notification from "./models/Notification";
import Timetable from "./models/Timetable";
import Hostel from "./models/Hostel";
import Book from "./models/Book";
import Document from "./models/Document";
import InstitutionSettings from "./models/InstitutionSettings";
import Batch from "./models/Batch";

dotenv.config();

const RESET_FLAG = process.argv.includes("--reset");
const FORCE_RESET = process.env.SEED_RESET === "true";
const DEFAULT_DB_NAME = (process.env.MONGO_DB_NAME || "university_db").trim();
const DNS_SERVERS = (process.env.DNS_SERVERS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const must = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const daysAgo = (days: number) => daysFromNow(-Math.abs(days));

const pad3 = (n: number) => String(n).padStart(3, "0");

const startOfDayUTC = (d: Date) => {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
};

const startOfMonthUTC = (monthOffset: number) => {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMonth(d.getUTCMonth() + monthOffset);
  return d;
};

const txId = (prefix: string, suffix: string) =>
  `${prefix}-${suffix}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads", "documents");

const ensureUploadsDir = () => {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
};

const hashString = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const makeRng = (seed: number) => {
  let x = seed >>> 0;
  return () => {
    x = (Math.imul(1664525, x) + 1013904223) >>> 0;
    return x / 4294967296;
  };
};

const ensureDbInMongoUri = (uri: string, dbName: string) => {
  // If no database is provided in the connection string, MongoDB drivers default to "test".
  // Normalize to a consistent DB so the app and seed read/write the same place.
  const trimmed = uri.trim();
  if (!trimmed.startsWith("mongodb://") && !trimmed.startsWith("mongodb+srv://")) {
    return trimmed;
  }

  // Already has an explicit path like /mydb
  if (/^mongodb(\+srv)?:\/\/[^/]+\/[^?]+/.test(trimmed)) return trimmed;

  // Insert DB name before query string or at end
  const withSlashQuery = trimmed.replace(
    /^(mongodb(\+srv)?:\/\/[^/]+)\/\?/,
    `$1/${dbName}?`
  );
  if (withSlashQuery !== trimmed) return withSlashQuery;

  const withQuery = trimmed.replace(
    /^(mongodb(\+srv)?:\/\/[^/]+)\?/,
    `$1/${dbName}?`
  );
  if (withQuery !== trimmed) return withQuery;

  return `${trimmed}/${dbName}`;
};

const main = async () => {
  const MONGO_URI = ensureDbInMongoUri(must("MONGO_URI"), DEFAULT_DB_NAME);

  if (DNS_SERVERS.length > 0) {
    dns.setServers(DNS_SERVERS);
    // eslint-disable-next-line no-console
    console.log(`DNS servers set for this process: ${DNS_SERVERS.join(", ")}`);
  }

  if (RESET_FLAG && !FORCE_RESET) {
    throw new Error(
      "Refusing to reset without SEED_RESET=true. Remove --reset or set SEED_RESET=true explicitly."
    );
  }

  await mongoose.connect(MONGO_URI);
  // eslint-disable-next-line no-console
  console.log(
    `Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`
  );

  if (RESET_FLAG) {
    await Promise.all([
      Attendance.deleteMany({}),
      Result.deleteMany({}),
      Exam.deleteMany({}),
      Fee.deleteMany({}),
      Notification.deleteMany({}),
      Course.deleteMany({}),
      Student.deleteMany({}),
      Staff.deleteMany({}),
      Timetable.deleteMany({}),
      Hostel.deleteMany({}),
      Book.deleteMany({}),
      Document.deleteMany({}),
      Batch.deleteMany({}),
      // NOTE: We do NOT delete all users by default in reset mode, but this script assumes a dev DB.
      // If you want to wipe users too, do it manually in Atlas.
    ]);
  }

  const ensureUser = async (
    email: string,
    data: { name: string; password: string; role: "admin" | "faculty" | "student" },
    opts?: { createdAt?: Date }
  ) => {
    let user = await User.findOne({ email });
    if (!user) {
      const createdAt = opts?.createdAt;
      user = await User.create({
        ...data,
        email,
        isActive: true,
        ...(createdAt ? { createdAt, updatedAt: createdAt } : {}),
      } as any);
    }
    return user;
  };

  const ensureStudent = async (rollNumber: string, userId: mongoose.Types.ObjectId, data: { department: string; batch: string; contactNumber?: string; address?: string }) => {
    let student = await Student.findOne({ rollNumber });
    if (!student) {
      student = await Student.create({
        user: userId,
        rollNumber,
        ...data,
      });
    }
    return student;
  };

  const ensureCourse = async (code: string, data: { name: string; credits: number; faculty?: mongoose.Types.ObjectId; department: string; semester: number }) => {
    let course = await Course.findOne({ code });
    if (!course) course = await Course.create({ code, ...data });
    return course;
  };

  const ensureFee = async (
    key: { student: mongoose.Types.ObjectId; type: string; dueDate: Date },
    data: { amount: number; status: "Pending" | "Paid"; transactionId?: string; paymentDate?: Date }
  ) => {
    let fee = await Fee.findOne(key as any);
    if (!fee) fee = await Fee.create({ ...key, ...data } as any);
    return fee;
  };

  const ensureAttendance = async (
    courseId: mongoose.Types.ObjectId,
    date: Date,
    records: { student: mongoose.Types.ObjectId; status: "Present" | "Absent" | "Late" }[]
  ) => {
    const key = { course: courseId, date };
    let attendance = await Attendance.findOne(key as any);
    if (!attendance) attendance = await Attendance.create({ ...key, records } as any);
    return attendance;
  };

  const ensureTimetableEntry = async (key: { day: string; startTime: string; endTime: string; classOrBatch: string }, data: { subject: string; teacher: string }) => {
    let entry = await Timetable.findOne({ ...key } as any);
    if (!entry) entry = await Timetable.create({ ...key, ...data } as any);
    return entry;
  };

  const admin = await ensureUser("admin@university.com", {
    name: "System Admin",
    password: "admin123",
    role: "admin",
  });

  // Faculty + staff
  const facultyUsers = await Promise.all([
    ensureUser(
      "faculty@university.com",
      { name: "Dr. Ananya Sharma", password: "faculty123", role: "faculty" },
      { createdAt: daysAgo(120) }
    ),
    ensureUser(
      "faculty2@university.com",
      { name: "Prof. Raghav Menon", password: "faculty123", role: "faculty" },
      { createdAt: daysAgo(45) }
    ),
    ensureUser(
      "faculty3@university.com",
      { name: "Dr. Sana Khan", password: "faculty123", role: "faculty" },
      { createdAt: daysAgo(30) }
    ),
    ensureUser(
      "faculty4@university.com",
      { name: "Prof. Aditya Joshi", password: "faculty123", role: "faculty" },
      { createdAt: daysAgo(20) }
    ),
  ]);

  const staffSeed = [
    { user: facultyUsers[0], department: "Computer Science", designation: "Associate Professor" },
    { user: facultyUsers[1], department: "Electrical Engineering", designation: "Assistant Professor" },
    { user: facultyUsers[2], department: "Business Administration", designation: "Associate Professor" },
    { user: facultyUsers[3], department: "Mechanical Engineering", designation: "Senior Lecturer" },
  ];

  for (const s of staffSeed) {
    const staffExists = await Staff.findOne({ user: s.user._id });
    if (!staffExists) {
      await Staff.create({
        user: s.user._id,
        department: s.department,
        designation: s.designation,
        joiningDate: daysAgo(500 + Math.floor(Math.random() * 900)),
        salary: 900000 + Math.floor(Math.random() * 800000),
        phone: `+91-9${Math.floor(1000_000_000 + Math.random() * 9000_000_000)}`,
      });
    }
  }

  // Students: richer dataset across departments and batches (for analytics + tables)
  const firstNames = [
    "Rohit",
    "Priya",
    "Arjun",
    "Neha",
    "Aman",
    "Sneha",
    "Karan",
    "Isha",
    "Vikram",
    "Anjali",
    "Nikhil",
    "Simran",
    "Aditi",
    "Rahul",
    "Pooja",
    "Harsh",
    "Kavya",
    "Manish",
    "Meera",
    "Siddharth",
  ];
  const lastNames = [
    "Kumar",
    "Singh",
    "Mehta",
    "Verma",
    "Gupta",
    "Iyer",
    "Shah",
    "Patel",
    "Rao",
    "Nair",
    "Malhotra",
    "Bose",
    "Kapoor",
    "Chatterjee",
  ];

  const departments = [
    { code: "CS", name: "Computer Science", faculty: facultyUsers[0] },
    { code: "EE", name: "Electrical Engineering", faculty: facultyUsers[1] },
    { code: "BA", name: "Business Administration", faculty: facultyUsers[2] },
    { code: "ME", name: "Mechanical Engineering", faculty: facultyUsers[3] },
  ] as const;

  const studentUsers: any[] = [];
  const students: any[] = [];

  for (let deptIdx = 0; deptIdx < departments.length; deptIdx++) {
    const dept = departments[deptIdx];
    for (let i = 1; i <= 12; i++) {
      const idx = deptIdx * 12 + (i - 1);
      const name = `${firstNames[idx % firstNames.length]} ${lastNames[idx % lastNames.length]}`;
      const batch = i <= 8 ? "2026" : i <= 10 ? "2027" : "2028";
      const rollNumber = `${dept.code}-${batch}-${pad3(i)}`;
      const email = `student.${dept.code.toLowerCase()}.${batch}.${pad3(i)}@university.com`;
      const createdAt = daysAgo(1 + ((idx * 3) % 75)); // within last ~75 days

      const user = await ensureUser(
        email,
        { name, password: "student123", role: "student" },
        { createdAt }
      );
      studentUsers.push(user);

      const student = await ensureStudent(rollNumber, user._id as any, {
        department: dept.name,
        batch,
        contactNumber: `+91-9${Math.floor(1000_000_000 + Math.random() * 9000_000_000)}`,
        address: ["Bangalore, IN", "Pune, IN", "Delhi, IN", "Hyderabad, IN", "Chennai, IN", "Mumbai, IN"][idx % 6],
      });
      students.push(student);
    }
  }

  const cs101 = await ensureCourse("CS101", {
    name: "Data Structures & Algorithms",
    credits: 4,
    faculty: facultyUsers[0]._id as any,
    department: "Computer Science",
    semester: 3,
  });

  const cs102 = await ensureCourse("CS102", {
    name: "Database Systems",
    credits: 3,
    faculty: facultyUsers[0]._id as any,
    department: "Computer Science",
    semester: 3,
  });

  const ee201 = await ensureCourse("EE201", {
    name: "Digital Electronics",
    credits: 4,
    faculty: facultyUsers[1]._id as any,
    department: "Electrical Engineering",
    semester: 4,
  });

  const ba110 = await ensureCourse("BA110", {
    name: "Principles of Management",
    credits: 3,
    faculty: facultyUsers[2]._id as any,
    department: "Business Administration",
    semester: 2,
  });

  const me105 = await ensureCourse("ME105", {
    name: "Engineering Mechanics",
    credits: 4,
    faculty: facultyUsers[3]._id as any,
    department: "Mechanical Engineering",
    semester: 1,
  });

  const exams = await Promise.all([
    Exam.findOne({ course: cs101._id, name: "Midterm" }).then((e) =>
      e ||
      Exam.create({
        course: cs101._id,
        name: "Midterm",
        date: daysFromNow(10),
        totalMarks: 100,
      })
    ),
    Exam.findOne({ course: cs102._id, name: "Quiz 1" }).then((e) =>
      e ||
      Exam.create({
        course: cs102._id,
        name: "Quiz 1",
        date: daysFromNow(5),
        totalMarks: 20,
      })
    ),
  ]);

  // Seed results for the first exam only (idempotent by (exam, student) presence)
  const csStudents = students.filter((s) => s.department === "Computer Science");
  for (const student of csStudents) {
    const exists = await Result.findOne({ exam: exams[0]._id, student: student._id });
    if (!exists) {
      const marks = 60 + Math.floor(Math.random() * 36);
      const grade = marks >= 90 ? "A+" : marks >= 80 ? "A" : marks >= 70 ? "B" : marks >= 60 ? "C" : "D";
      await Result.create({
        exam: exams[0]._id,
        student: student._id,
        marksObtained: marks,
        grade,
      });
    }
  }

  // Attendance: seed a rolling 14-day history for multiple courses (unique index: course+date)
  const seededCourses = [cs101, cs102, ee201, ba110, me105];
  const byDept: Record<string, any[]> = students.reduce((acc: any, s: any) => {
    acc[s.department] = acc[s.department] || [];
    acc[s.department].push(s);
    return acc;
  }, {});

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const d = startOfDayUTC(daysAgo(dayOffset));
    for (const course of seededCourses) {
      const roster =
        byDept[course.department] || students; // fallback
      const records = roster.map((s: any) => {
        const r = Math.random();
        const status: "Present" | "Absent" | "Late" =
          r < 0.08 ? "Absent" : r < 0.16 ? "Late" : "Present";
        return { student: s._id, status };
      });
      await ensureAttendance(course._id as any, d, records);
    }
  }

  // Fees: create a realistic mix (Paid vs Pending) with payment dates spread across months for analytics.
  const monthOffsets = [-3, -2, -1, 0]; // last 3 months + current month
  for (const student of students) {
    const rng = makeRng(hashString(String(student.rollNumber || student._id)));
    for (const mo of monthOffsets) {
      const baseDue = startOfMonthUTC(mo);
      const dueDate = new Date(baseDue.getTime());
      dueDate.setUTCDate(15); // mid-month dues

      const isCurrentMonth = mo === 0;
      const status: "Paid" | "Pending" = isCurrentMonth ? "Pending" : rng() < 0.85 ? "Paid" : "Pending";
      const amount = 38000 + Math.floor(rng() * 12000);
      const paymentDate =
        status === "Paid"
          ? new Date(dueDate.getTime() - (1 + Math.floor(rng() * 10)) * 24 * 60 * 60 * 1000)
          : undefined;

      await ensureFee(
        { student: student._id as any, type: "Tuition", dueDate },
        {
          amount,
          status,
          ...(status === "Paid"
            ? { paymentDate, transactionId: txId("TXN", `${student.rollNumber}-${baseDue.toISOString().slice(0, 7)}`) }
            : {}),
        }
      );
    }

    // Occasional extra charges
    const extraDueBase = startOfMonthUTC(0);
    if (rng() < 0.35) {
      const dueDate = new Date(extraDueBase.getTime());
      dueDate.setUTCDate(20);
      dueDate.setUTCHours(0, 0, 0, 0);
      await ensureFee(
        { student: student._id as any, type: "Library", dueDate },
        { amount: 500 + Math.floor(rng() * 1500), status: "Pending" }
      );
    }
    if (rng() < 0.25) {
      const dueDate = new Date(extraDueBase.getTime());
      dueDate.setUTCDate(25);
      dueDate.setUTCHours(0, 0, 0, 0);
      const hostelPaid = rng() < 0.5;
      await ensureFee(
        { student: student._id as any, type: "Hostel", dueDate },
        {
          amount: 8000 + Math.floor(rng() * 7000),
          status: hostelPaid ? "Paid" : "Pending",
          ...(hostelPaid ? { paymentDate: daysAgo(10), transactionId: txId("HSTL", String(student.rollNumber || student._id)) } : {}),
        }
      );
    }
  }

  // Notifications (create a few per user)
  const notifForAdmin = await Notification.findOne({ recipient: admin._id, title: "Welcome to ACE ERP" });
  if (!notifForAdmin) {
    await Notification.create({
      recipient: admin._id,
      title: "Welcome to ACE ERP",
      message: "Your demo workspace is ready. Explore Students, Courses, and Reports.",
      type: "info",
    });
  }

  for (const u of [...facultyUsers, ...studentUsers]) {
    const exists = await Notification.findOne({ recipient: u._id, title: "New announcement" });
    if (!exists) {
      await Notification.create({
        recipient: u._id,
        title: "New announcement",
        message: "Semester schedules have been updated. Check your timetable.",
        type: "info",
      });
    }
  }

  // Timetable: seed a complete weekly grid matching the Scheduler UI slots.
  // NOTE: Scheduler grid uses these exact periods (non-break):
  // 09:00-10:00, 10:00-11:00, 11:15-12:15, 01:15-02:15, 02:15-03:15
  const scheduleDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
  const scheduleSlots = [
    { startTime: "09:00", endTime: "10:00" },
    { startTime: "10:00", endTime: "11:00" },
    { startTime: "11:15", endTime: "12:15" },
    { startTime: "01:15", endTime: "02:15" },
    { startTime: "02:15", endTime: "03:15" },
  ] as const;

  const seedSchedule = async (classOrBatch: string, teacher: string, subjectsBySlot: string[][]) => {
    for (let dayIdx = 0; dayIdx < scheduleDays.length; dayIdx++) {
      for (let slotIdx = 0; slotIdx < scheduleSlots.length; slotIdx++) {
        const key = {
          day: scheduleDays[dayIdx],
          startTime: scheduleSlots[slotIdx].startTime,
          endTime: scheduleSlots[slotIdx].endTime,
          classOrBatch,
        };
        const subject = subjectsBySlot[dayIdx]?.[slotIdx] || "Seminar / Tutorial";
        await ensureTimetableEntry(key, { subject, teacher });
      }
    }
  };

  await seedSchedule("CS-2026", "Dr. Ananya Sharma", [
    ["CS101 - DSA", "CS102 - DBMS", "CS101 - DSA Lab", "CS102 - DBMS Lab", "Aptitude / Problem Solving"],
    ["CS102 - DBMS", "CS101 - DSA", "Discrete Math", "OOP Concepts", "Project Studio"],
    ["CS101 - DSA", "CS102 - DBMS", "Operating Systems", "Networks", "Seminar"],
    ["CS102 - DBMS", "CS101 - DSA", "DBMS Lab", "DSA Lab", "Mentoring"],
    ["CS101 - DSA", "CS102 - DBMS", "System Design Basics", "Mini Project", "Quiz / Assessment"],
  ]);

  await seedSchedule("EE-2026", "Prof. Raghav Menon", [
    ["EE201 - Digital", "Circuit Theory", "Digital Lab", "Signals", "Tutorial"],
    ["Signals", "EE201 - Digital", "Circuit Lab", "Maths", "Workshop"],
    ["EE201 - Digital", "Control Systems", "Digital Lab", "Electromagnetics", "Seminar"],
    ["Circuit Theory", "EE201 - Digital", "Microcontrollers", "Digital Lab", "Mentoring"],
    ["EE201 - Digital", "Signals", "Control Systems", "Project Studio", "Assessment"],
  ]);

  await seedSchedule("BA-2026", "Dr. Sana Khan", [
    ["BA110 - Management", "Business Economics", "Communication", "Accounting", "Case Study"],
    ["Accounting", "BA110 - Management", "Marketing", "Excel Workshop", "Seminar"],
    ["BA110 - Management", "Marketing", "Finance Basics", "Business Law", "Tutorial"],
    ["Business Economics", "BA110 - Management", "Operations", "HR Basics", "Mentoring"],
    ["BA110 - Management", "Accounting", "Marketing", "Project Studio", "Assessment"],
  ]);

  await seedSchedule("ME-2026", "Prof. Aditya Joshi", [
    ["ME105 - Mechanics", "Thermodynamics", "Mechanics Lab", "Materials", "Workshop"],
    ["Materials", "ME105 - Mechanics", "CAD Basics", "Maths", "Tutorial"],
    ["ME105 - Mechanics", "Thermodynamics", "Mechanics Lab", "Manufacturing", "Seminar"],
    ["Thermodynamics", "ME105 - Mechanics", "Manufacturing", "CAD Lab", "Mentoring"],
    ["ME105 - Mechanics", "Materials", "Thermodynamics", "Project Studio", "Assessment"],
  ]);

  // Documents: seed a few metadata records (upload actual files from the UI when needed).
  ensureUploadsDir();
  const seedDocs = [
    {
      name: "Academic Calendar 2026",
      originalName: "Academic Calendar 2026.pdf",
      mimeType: "application/pdf",
      fileName: "seed-academic-calendar-2026.pdf",
      content: `ACE University\nAcademic Calendar 2026\n\n(Placeholder file generated by seed script)\n`,
    },
    {
      name: "Student Handbook",
      originalName: "Student Handbook.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileName: "seed-student-handbook.docx",
      content: `ACE University\nStudent Handbook\n\n(Placeholder file generated by seed script)\n`,
    },
    {
      name: "Safety Protocols",
      originalName: "Safety Protocols.pdf",
      mimeType: "application/pdf",
      fileName: "seed-safety-protocols.pdf",
      content: `ACE University\nSafety Protocols\n\n(Placeholder file generated by seed script)\n`,
    },
  ] as const;

  for (const d of seedDocs) {
    const filePath = path.join(UPLOADS_DIR, d.fileName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, d.content, "utf8");
    }
    const sizeBytes = fs.statSync(filePath).size;
    const exists = await Document.findOne({ fileName: d.fileName });
    if (!exists) {
      await Document.create({
        name: d.name,
        originalName: d.originalName,
        mimeType: d.mimeType,
        sizeBytes,
        storage: "file",
        fileName: d.fileName,
        uploadedBy: admin._id,
      } as any);
    }
  }

  // Hostel rooms
  const hostelRoom = await Hostel.findOne({ name: "A-Block", roomNumber: "101" });
  if (!hostelRoom) {
    await Hostel.create({ name: "A-Block", roomNumber: "101", capacity: 3, occupied: 2, type: "Boys" });
    await Hostel.create({ name: "B-Block", roomNumber: "202", capacity: 3, occupied: 1, type: "Girls" });
  }

  // Academic batches (derived from student dataset)
  const distinct = await Student.aggregate([
    { $group: { _id: { department: "$department", batch: "$batch" } } },
  ]);
  for (const r of distinct as any[]) {
    const department = r?._id?.department as string;
    const name = r?._id?.batch as string;
    const year = Number(name) || new Date().getFullYear();
    if (!department || !name) continue;
    const exists = await Batch.findOne({ year, department, name });
    if (!exists) {
      await Batch.create({
        year,
        department,
        name,
        sections: ["A", "B"],
        isActive: true,
        createdBy: admin._id,
      } as any);
    }
  }

  // Library books
  const book = await Book.findOne({ isbn: "9780132350884" });
  if (!book) {
    await Book.create({
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      category: "Software Engineering",
      quantity: 10,
      available: 7,
    });
    await Book.create({
      title: "Designing Data-Intensive Applications",
      author: "Martin Kleppmann",
      isbn: "9781449373320",
      category: "Databases",
      quantity: 6,
      available: 4,
    });
  }

  const counts = await Promise.all([
    User.countDocuments({}),
    Student.countDocuments({}),
    Course.countDocuments({}),
    Notification.countDocuments({}),
    Fee.countDocuments({}),
  ]);

  const settingsExists = await InstitutionSettings.findOne({});
  if (!settingsExists) {
    const now = new Date();
    const y = now.getFullYear();
    await InstitutionSettings.create({
      institutionName: "ACE University",
      emailDomain: "@university.edu",
      contactEmail: "admin@university.edu",
      academicYearStart: y,
      academicYearEnd: y + 1,
      updatedBy: admin._id,
    } as any);
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seed complete. Users=${counts[0]}, Students=${counts[1]}, Courses=${counts[2]}, Notifications=${counts[3]}, Fees=${counts[4]}`
  );
};

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });
