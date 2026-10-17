import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    event_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    client_name: {
      type: String,
      required: true,
    },
    contact_email: {
      type: String,
    },
    contact_phone: {
      type: String,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    expected_attendees: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: [
        'PROPOSAL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
        'Pending', 'Confirmed', 'In-Progress', 'In Progress', 'Completed', 'Cancelled'
      ],
      default: 'Confirmed',
      required: true,
    },
    event_type: {
      type: String,
      default: 'Wedding',
      trim: true,
    },
    venue: {
      type: String,
      default: 'Grand Ballroom',
      trim: true,
    },
    start_time: {
      type: String,
      default: '12:00',
    },
    end_time: {
      type: String,
      default: '18:00',
    },
    total_budget: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
      default: 0,
    },
    advance_amount: {
      type: Number,
      default: 0,
    },
    balance_amount: {
      type: Number,
      default: 0,
    },
    catering: {
      type: String,
      default: 'Buffet',
      trim: true,
    },
    special_requests: {
      type: String,
    },
    notes: {
      type: String,
    },
    payments: [
      {
        amount: { type: Number, required: true },
        payment_method: { type: String, default: 'Cash' },
        date: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
eventSchema.index({ start_date: 1 });
eventSchema.index({ status: 1 });

export default eventSchema;

