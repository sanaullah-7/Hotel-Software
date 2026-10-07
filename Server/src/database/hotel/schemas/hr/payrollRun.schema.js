import mongoose from 'mongoose';

const payrollRunSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    run_ref: {
      type: String,
      required: true,
      trim: true,
    },
    period_start: {
      type: Date,
      required: true,
    },
    period_end: {
      type: Date,
      required: true,
    },
    process_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PROCESSING', 'APPROVED', 'COMPLETED', 'FAILED'],
      default: 'DRAFT',
      required: true,
    },
    total_amount: {
      type: Number,
      default: 0,
    },
    processed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
payrollRunSchema.index({ period_start: 1, period_end: 1 });
payrollRunSchema.index({ status: 1 });

payrollRunSchema.index({ hotelId: 1, run_ref: 1 }, { unique: true });

export default payrollRunSchema;
