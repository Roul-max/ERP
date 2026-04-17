import express from "express";
import { getOverview } from "../controllers/analytics.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect);
router.get("/overview", authorize("admin"), getOverview);

export default router;

