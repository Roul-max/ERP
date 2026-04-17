import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Schema.Types.ObjectId;
  sender?: mongoose.Schema.Types.ObjectId;
  broadcast?: mongoose.Schema.Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  type: string;
  channel?: "inApp" | "email";
}

const NotificationSchema: Schema = new Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Null for broadcast
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  broadcast: { type: mongoose.Schema.Types.ObjectId, ref: 'NotificationBroadcast' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, default: 'info' },
  channel: { type: String, enum: ["inApp", "email"], default: "inApp" }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
