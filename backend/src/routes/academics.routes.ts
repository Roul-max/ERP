import express from "express";
import { protect, authorize } from "../middleware/auth.middleware";
import {
  listBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  batchStats,
} from "../controllers/academics.controller";

const router = express.Router();

router.use(protect);
router.get("/batches", authorize("admin"), listBatches);
router.post("/batches", authorize("admin"), createBatch);
router.put("/batches/:id", authorize("admin"), updateBatch);
router.delete("/batches/:id", authorize("admin"), deleteBatch);
router.get("/stats/batches", authorize("admin"), batchStats);

export default router;

