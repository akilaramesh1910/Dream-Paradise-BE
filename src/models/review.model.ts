import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Calculate average rating and update product
reviewSchema.statics.calculateAverageRating = async function(productId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
  (this.constructor as any).calculateAverageRating(this.product);
});

// Call calculateAverageRating after remove
reviewSchema.post('remove', function() {
  (this.constructor as any).calculateAverageRating(this.product);
});

export default mongoose.model<IReview>('Review', reviewSchema);