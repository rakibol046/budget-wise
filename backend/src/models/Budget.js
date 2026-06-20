import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String,
      required: [true, 'Month is required (YYYY-MM)'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
    },
    // Map allows any user-defined category slug as a key
    categories: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

// Total budget across all categories
budgetSchema.virtual('total').get(function () {
  let sum = 0;
  for (const val of this.categories.values()) {
    sum += (val || 0);
  }
  return sum;
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
