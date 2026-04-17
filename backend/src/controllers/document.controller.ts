import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import Document from "../models/Document";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads", "documents");

const ensureUploadsDir = () => {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
};

const safeFileName = (name: string) => {
  const base = name
    .trim()
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "_");
  return base || "document";
};

const parseBase64 = (value: string) => {
  const trimmed = (value || "").trim();
  const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: "", data: trimmed };
};

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "text/plain",
]);

export const listDocuments = async (req: any, res: any) => {
  try {
    const q = String(req.query.q || "").trim();
    const filter: any = {};
    if (q) {
      filter.$or = [{ name: { $regex: q, $options: "i" } }, { originalName: { $regex: q, $options: "i" } }];
    }

    const docs = await Document.find(filter)
      .sort({ createdAt: -1 })
      .select("name originalName mimeType sizeBytes uploadedBy createdAt")
      .populate("uploadedBy", "name email role");

    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load documents" });
  }
};

export const uploadDocument = async (req: any, res: any) => {
  try {
    ensureUploadsDir();

    const originalName = String(req.body.originalName || "").trim();
    const name = String(req.body.name || originalName || "Document").trim();
    const declaredMime = String(req.body.mimeType || "").trim();
    const base64Raw = String(req.body.base64 || "").trim();

    if (!originalName) return res.status(400).json({ message: "originalName is required" });
    if (!base64Raw) return res.status(400).json({ message: "base64 is required" });

    const parsed = parseBase64(base64Raw);
    const mimeType = parsed.mimeType || declaredMime || "application/octet-stream";
    if (mimeType && !allowedMimeTypes.has(mimeType)) {
      return res.status(400).json({ message: `Unsupported file type: ${mimeType}` });
    }

    const buffer = Buffer.from(parsed.data, "base64");
    if (buffer.length === 0) return res.status(400).json({ message: "Invalid base64 data" });
    const maxBytes = 15 * 1024 * 1024;
    if (buffer.length > maxBytes) {
      return res.status(400).json({ message: "File too large (max 15MB)" });
    }

    const ext = path.extname(originalName) || "";
    const fileName = `${crypto.randomUUID()}-${safeFileName(path.basename(originalName, ext))}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, buffer);

    const doc = await Document.create({
      name,
      originalName,
      mimeType,
      sizeBytes: buffer.length,
      storage: "file",
      fileName,
      uploadedBy: req.user._id,
    });

    res.status(201).json(doc);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to upload document" });
  }
};

export const downloadDocument = async (req: any, res: any) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const filePath = path.join(UPLOADS_DIR, doc.fileName);
    if (!filePath.startsWith(UPLOADS_DIR)) {
      return res.status(400).json({ message: "Invalid document path" });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing on server" });
    }

    res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFileName(doc.originalName)}"`);
    return res.sendFile(filePath);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to download document" });
  }
};

export const deleteDocument = async (req: any, res: any) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const filePath = path.join(UPLOADS_DIR, doc.fileName);
    await Document.findByIdAndDelete(req.params.id);

    try {
      if (filePath.startsWith(UPLOADS_DIR) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // ignore file deletion issues
    }

    res.json({ message: "Document deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete document" });
  }
};

