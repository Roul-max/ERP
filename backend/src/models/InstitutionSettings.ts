import mongoose, { Schema, Document } from "mongoose";

export interface IInstitutionSettings extends Document {
  institutionName: string;
  emailDomain: string;
  contactEmail: string;
  academicYearStart: number;
  academicYearEnd: number;
  updatedBy?: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const InstitutionSettingsSchema: Schema = new Schema(
  {
    institutionName: { type: String, required: true, trim: true },
    emailDomain: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true },
    academicYearStart: { type: Number, required: true },
    academicYearEnd: { type: Number, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<IInstitutionSettings>(
  "InstitutionSettings",
  InstitutionSettingsSchema
);
