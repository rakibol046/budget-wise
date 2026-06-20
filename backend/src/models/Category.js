import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [40, 'Category name cannot exceed 40 characters'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '📦',
      maxlength: [8, 'Icon must be a single emoji'],
    },
    color: {
      type: String,
      default: '#94a3b8',
      match: [/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex code'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Each user can have only one category per slug
categorySchema.index({ userId: 1, slug: 1 }, { unique: true });

export const DEFAULT_CATEGORIES = [
  { name: 'Groceries', slug: 'groceries', icon: '🛒', color: '#4fd1c5', isDefault: true, order: 0 },
  { name: 'Utilities', slug: 'utilities', icon: '⚡', color: '#f59e0b', isDefault: true, order: 1 },
  { name: 'Daily',     slug: 'daily',     icon: '☕', color: '#818cf8', isDefault: true, order: 2 },
  { name: 'Transport', slug: 'transport', icon: '🚌', color: '#34d399', isDefault: true, order: 3 },
  { name: 'Others',    slug: 'others',    icon: '📦', color: '#f87171', isDefault: true, order: 4 },
];

// Helper to generate a slug from a name
export const toSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const Category = mongoose.model('Category', categorySchema);
export default Category;
