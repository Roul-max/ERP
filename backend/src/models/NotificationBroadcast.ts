import mongoose, { Schema, Document } from "mongoose";

export interface INotificationBroadcast extends Document {
  createdBy: mongoose.Schema.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  channel: "inApp" | "email";
  audience: {
    recipientId?: mongoose.Schema.Types.ObjectId;
    roles?: ("admin" | "faculty" | "student")[];
    allActive?: boolean;
  };
  stats: {
    matchedUsers: number;
    inAppCreated: number;
    emailPlanned: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationBroadcastSchema: Schema = new Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, default: "info" },
    channel: { type: String, enum: ["inApp", "email"], default: "inApp" },
    audience: {
      recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      roles: { type: [String], default: [] },
      allActive: { type: Boolean, default: true },
    },
    stats: {
      matchedUsers: { type: Number, default: 0 },
      inAppCreated: { type: Number, default: 0 },
      emailPlanned: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<INotificationBroadcast>(
  "NotificationBroadcast",
  NotificationBroadcastSchema
);

