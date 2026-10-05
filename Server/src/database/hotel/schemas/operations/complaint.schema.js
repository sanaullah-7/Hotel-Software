import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaint_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    reservation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
    category: {
      type: String, // e.g., 'SERVICE', 'CLEANLINESS', 'NOISE', 'BILLING'
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      required: true,
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    resolution_notes: {
      type: String,
    },
    resolved_at: {
      type: Date,
    },
    compensation_offered: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
complaintSchema.index({ complaint_ref: 1 });
complaintSchema.index({ guest_id: 1 });
complaintSchema.index({ status: 1 });

export default complaintSchema;
