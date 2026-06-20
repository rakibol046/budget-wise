import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    // Category stored as slug string — validated against user's Category docs in controller
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDay: {
      type: Number,
      min: 1,
      max: 28,
    },
    // Optional link to a bank account — balance adjusted atomically on create/delete
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      default: null,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1, date: -1 });
expenseSchema.index({ userId: 1, accountId: 1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
