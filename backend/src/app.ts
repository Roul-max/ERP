import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
// @ts-ignore
import xss from "xss-clean";

import { limiter } from "./middleware/rateLimiter";
import logger from "./config/logger";

import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import courseRoutes from "./routes/course.routes";
import attendanceRoutes from "./routes/attendance.routes";
import notificationRoutes from "./routes/notification.routes";
import libraryRoutes from "./routes/library.routes";
import hostelRoutes from "./routes/hostel.routes";
import financeRoutes from "./routes/finance.routes";
import examRoutes from "./routes/exam.routes";
import timetableRoutes from "./routes/timetable.routes";
import analyticsRoutes from "./routes/analytics.routes";
import documentRoutes from "./routes/document.routes";
import settingsRoutes from "./routes/settings.routes";
import academicsRoutes from "./routes/academics.routes";
import staffRoutes from "./routes/staff.routes";

const app = express();

/* =====================================================
   CORS Configuration
===================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

/* =====================================================
   Security & Global Middleware
===================================================== */

app.use(helmet());
// Increased to support document uploads (base64). Keep an eye on payload sizes in production.
app.use(express.json({ limit: "20mb" }));
app.use(compression());
app.use(mongoSanitize());
app.use(xss());
app.use(limiter);

/* =====================================================
   Logging
===================================================== */

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  })
);

/* =====================================================
   API Routes
===================================================== */

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/library", libraryRoutes);
app.use("/api/v1/hostel", hostelRoutes);
app.use("/api/v1/finance", financeRoutes);
app.use("/api/v1/exams", examRoutes);
app.use("/api/v1/timetable", timetableRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/academics", academicsRoutes);
app.use("/api/v1/staff", staffRoutes);

/* =====================================================
   Health Check
===================================================== */

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "UP" });
});

/* =====================================================
   Root Route
===================================================== */

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "ACE ERP API",
    status: "Running"
  });
});

/* =====================================================
   404 Handler
===================================================== */

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found"
  });
});

/* =====================================================
   Global Error Handler
===================================================== */

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err.stack || err.message);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
);

export default app;
