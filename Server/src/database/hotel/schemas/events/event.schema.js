import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    event_ref: {
      type: String,
      required: true,
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

eventSchema.index({ hotelId: 1, event_ref: 1 }, { unique: true });

export default eventSchema;
