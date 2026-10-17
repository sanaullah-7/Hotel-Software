import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    refund_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'FAILED'],
      default: 'PROCESSED',
      required: true,
    },
    refund_method: {
      type: String,
      enum: ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'WALLET', 'OTHER', 'ORIGINAL_METHOD'],
      default: 'ORIGINAL_METHOD',
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
refundSchema.index({ payment_id: 1 });
refundSchema.index({ date: -1 });
refundSchema.index({ cash_shift_id: 1 });
refundSchema.index({ staff_id: 1 });

export default refundSchema;
