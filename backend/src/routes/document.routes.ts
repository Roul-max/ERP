import express from "express";
import {
  deleteDocument,
  downloadDocument,
  listDocuments,
  uploadDocument,
} from "../controllers/document.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect);

// Everyone logged in can view/download; admin can manage.
router.get("/", listDocuments);
router.get("/:id/download", downloadDocument);
router.post("/", authorize("admin"), uploadDocument);
router.delete("/:id", authorize("admin"), deleteDocument);

export default router;

