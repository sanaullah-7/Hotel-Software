import mongoose from 'mongoose';

const reservationGroupSchema = new mongoose.Schema(
  {
    group_ref: {
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
    name: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
reservationGroupSchema.index({ guest_id: 1 });

export default reservationGroupSchema;
