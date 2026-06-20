import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [60, 'Account name cannot exceed 60 characters'],
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: [80, 'Bank name cannot exceed 80 characters'],
      default: '',
    },
    accountType: {
      type: String,
      enum: ['savings', 'Debit', 'credit', 'cash'],
      default: 'savings',
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    color: {
      type: String,
      default: '#4fd1c5',
      match: [/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex code'],
    },
    icon: {
      type: String,
      default: '🏦',
      maxlength: [8, 'Icon must be a single emoji'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

bankAccountSchema.index({ userId: 1, isDefault: 1 });

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
export default BankAccount;
