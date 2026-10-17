import mongoose from 'mongoose';

const payrollItemSchema = new mongoose.Schema(
  {
    run_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PayrollRun',
      required: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    base_salary: {
      type: Number,
      required: true,
      min: 0,
    },
    bonuses: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    net_pay: {
      type: Number,
      required: true,
    },
    paid_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    payment_method: {
      type: String,
      enum: ['BANK_TRANSFER', 'CASH', 'CHEQUE', 'ONLINE'],
      default: 'BANK_TRANSFER',
    },
    payment_date: {
      type: Date,
    },
    payment_notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
payrollItemSchema.index({ run_id: 1, employee_id: 1 }, { unique: true });
payrollItemSchema.index({ employee_id: 1 });
payrollItemSchema.index({ status: 1 });

export default payrollItemSchema;
