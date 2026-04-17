import express from "express";
import { protect, authorize } from "../middleware/auth.middleware";
import {
  getInstitutionSettings,
  updateInstitutionSettings,
} from "../controllers/settings.controller";

const router = express.Router();

router.use(protect);
router.get("/", getInstitutionSettings);
router.put("/", authorize("admin"), updateInstitutionSettings);

export default router;

