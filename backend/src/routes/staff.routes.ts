import express from "express";
import { protect, authorize } from "../middleware/auth.middleware";
import {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  payrollSummary,
} from "../controllers/staff.controller";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/", listStaff);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);
router.get("/payroll/summary", payrollSummary);

export default router;

