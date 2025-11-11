import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomRequest extends Document {
  name: string;
  email: string;
  phone?: string;
  details: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const customRequestSchema = new Schema<ICustomRequest>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  details: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

customRequestSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICustomRequest>('CustomRequest', customRequestSchema);
