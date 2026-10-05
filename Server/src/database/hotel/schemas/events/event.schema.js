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
      enum: ['PROPOSAL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PROPOSAL',
      required: true,
    },
    total_budget: {
      type: Number,
      default: 0,
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
eventSchema.index({ event_ref: 1 });
eventSchema.index({ start_date: 1 });
eventSchema.index({ status: 1 });

export default eventSchema;
