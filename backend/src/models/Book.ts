import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
}

const BookSchema: Schema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  available: { type: Number, required: true, min: 0 }
}, { timestamps: true });

export default mongoose.model<IBook>('Book', BookSchema);