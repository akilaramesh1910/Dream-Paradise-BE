import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number; // total uses allowed
  usedCount: number; // ✅ make required (default handles value)
  validFrom?: Date;
  validUntil?: Date;
  active: boolean;
  createdAt: Date;

  // ✅ add schema method typing
  incrementUsage(): Promise<void>;
}

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
  },
  usageLimit: {
    type: Number,
  },
  usedCount: {
    type: Number,
    required: true,
    default: 0, // ✅ ensures it always has a value
  },
  validFrom: {
    type: Date,
  },
  validUntil: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ TypeScript-aware method definition
couponSchema.methods.incrementUsage = async function (this: ICoupon): Promise<void> {
  this.usedCount += 1;
  await this.save();
};

export default mongoose.model<ICoupon>('Coupon', couponSchema);
