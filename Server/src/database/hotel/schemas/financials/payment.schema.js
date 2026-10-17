import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    payment_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    folio_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folio',
      required: true,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_method: {
      type: String,
      enum: ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'WALLET', 'OTHER'],
      required: true,
    },
    transaction_id: {
      type: String, // Third-party payment gateway transaction ID
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'COMPLETED',
      required: true,
    },
    refunded_amount: {
      type: Number,
      default: 0,
      min: 0,
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
paymentSchema.index({ invoice_id: 1 });
paymentSchema.index({ folio_id: 1 });
paymentSchema.index({ guest_id: 1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ cash_shift_id: 1 });
paymentSchema.index({ staff_id: 1 });

export default paymentSchema;
