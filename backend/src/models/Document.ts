import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storage: "file";
  fileName: string;
  uploadedBy: mongoose.Schema.Types.ObjectId;
}

const DocumentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storage: { type: String, enum: ["file"], default: "file" },
    fileName: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

DocumentSchema.index({ createdAt: -1 });
DocumentSchema.index({ name: "text", originalName: "text" });

export default mongoose.model<IDocument>("Document", DocumentSchema);

