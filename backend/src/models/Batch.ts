import mongoose, { Schema, Document } from "mongoose";

export interface IBatch extends Document {
  year: number; // e.g. 2026
  department: string; // e.g. Computer Science
  name: string; // e.g. "2026"
  sections: string[]; // e.g. ["A", "B"]
  isActive: boolean;
  createdBy?: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const BatchSchema: Schema = new Schema(
  {
    year: { type: Number, required: true, index: true },
    department: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    sections: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

BatchSchema.index({ year: 1, department: 1, name: 1 }, { unique: true });

export default mongoose.model<IBatch>("Batch", BatchSchema);

