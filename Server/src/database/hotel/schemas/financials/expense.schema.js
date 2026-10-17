import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    expense_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true, // e.g., 'MAINTENANCE', 'SUPPLIES', 'PAYROLL', 'UTILITIES'
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expense_by: {
      type: String,
      default: 'Admin',
      trim: true,
    },
    payment_method: {
      type: String,
      default: 'Cash',
      trim: true,
    },
    status: {
      type: String,
      default: 'Paid',
      trim: true,
    },
    paid_to: {
      type: String,
      default: '',
      trim: true,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    receipt_url: {
      type: String,
    },
    cash_shift_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CashShift',
      default: null,
    },
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
expenseSchema.index({ category: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ cash_shift_id: 1 });

export default expenseSchema;
