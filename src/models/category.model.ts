import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  image: string;
  slug: string;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  image: {
    type: String,
    required: [true, 'Please add a category image'],
  },
  slug: {
    type: String,
    unique: true,
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create slug from name before saving
categorySchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/ /g, '-');
  next();
});

export default mongoose.model<ICategory>('Category', categorySchema);