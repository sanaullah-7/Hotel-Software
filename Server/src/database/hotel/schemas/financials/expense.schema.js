import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    expense_ref: {
      type: String,
      required: true,
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
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    receipt_url: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
expenseSchema.index({ expense_ref: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ date: -1 });

expenseSchema.index({ hotelId: 1, expense_ref: 1 }, { unique: true });

export default expenseSchema;
