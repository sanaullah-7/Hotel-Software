import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    complaint_ref: {
      type: String,
      required: true,
      trim: true,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: false,
    },
    reservation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: false,
    },
    category: {
      type: String,
      enum: [
        'GENERAL',
        'PLUMBING',
        'ELECTRICAL',
        'HOUSEKEEPING',
        'NOISE',
        'AIR_CONDITIONING',
        'ROOM_SERVICE',
        'AMENITIES',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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
      required: false,
    },
    resolution_notes: {
      type: String,
      trim: true,
    },
    resolved_at: {
      type: Date,
    },
    compensation_offered: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
complaintSchema.index({ guest_id: 1, created_at: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ room_id: 1 });

complaintSchema.index({ hotelId: 1, complaint_ref: 1 }, { unique: true });

export default complaintSchema;
