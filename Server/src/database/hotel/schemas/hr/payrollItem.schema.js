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
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
payrollItemSchema.index({ run_id: 1 });
payrollItemSchema.index({ employee_id: 1 });

export default payrollItemSchema;
