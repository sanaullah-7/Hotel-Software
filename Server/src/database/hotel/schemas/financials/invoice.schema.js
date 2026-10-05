import mongoose from 'mongoose';

// Embedded snapshot of a charge at the time the invoice is generated
const invoiceLineItemSchema = new mongoose.Schema(
  {
    charge_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GuestCharge',
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tax_amount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    issue_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    due_date: {
      type: Date,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    tax_total: {
      type: Number,
      default: 0,
    },
    amount_paid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'VOIDED'],
      default: 'UNPAID',
      required: true,
    },
    line_items: [invoiceLineItemSchema],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
invoiceSchema.index({ folio_id: 1 });
invoiceSchema.index({ guest_id: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issue_date: -1 });

export default invoiceSchema;
