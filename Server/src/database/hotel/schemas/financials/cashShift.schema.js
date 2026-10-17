import mongoose from 'mongoose';

const cashShiftSchema = new mongoose.Schema(
  {
    shift_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    staff_name: {
      type: String,
      trim: true,
      default: '',
    },
    drawer_name: {
      type: String,
      trim: true,
      default: 'Default Drawer',
    },
    opened_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
    closed_at: {
      type: Date,
      default: null,
    },
    opening_float: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => (v !== null && v !== undefined ? Number(Number(v).toFixed(2)) : v),
    },
    cash_collected: {
      type: Number,
      default: 0,
      min: 0,
      set: (v) => (v !== null && v !== undefined ? Number(Number(v).toFixed(2)) : v),
    },
    cash_paid_out: {
      type: Number,
      default: 0,
      min: 0,
      set: (v) => (v !== null && v !== undefined ? Number(Number(v).toFixed(2)) : v),
    },
    cash_refunds: {
      type: Number,
      default: 0,
      min: 0,
      set: (v) => (v !== null && v !== undefined ? Number(Number(v).toFixed(2)) : v),
    },
    expected_cash: {
      type: Number,
      default: 0,
      set: (v) => (v !== null && v !== undefined ? Number(Number(v).toFixed(2)) : v),
    },
    actual_counted_cash: {
      type: Number,
      default: null,
      min: 0,
      set: (v) => (v !== null && v !== undefined ? Number(Number(v).toFixed(2)) : v),
    },
    discrepancy_amount: {
      type: Number,
      default: null,
      set: (v) => (v !== null && v !== undefined ? Number(Number(v).toFixed(2)) : v),
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSING', 'CLOSED'],
      default: 'OPEN',
      required: true,
    },
    closed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    closed_by_name: {
      type: String,
      trim: true,
      default: null,
    },
    tender_summary: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        cash_total: 0,
        card_total: 0,
        bank_total: 0,
        wallet_total: 0,
        other_total: 0,
        total_payments_count: 0,
        total_collected_all_tenders: 0,
      }),
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Database-level protection against multiple concurrent open shifts for the same cashier
cashShiftSchema.index(
  { staff_id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'OPEN' } }
);

cashShiftSchema.index({ opened_at: -1 });
cashShiftSchema.index({ status: 1 });
cashShiftSchema.index({ closed_at: -1 });

export default cashShiftSchema;
