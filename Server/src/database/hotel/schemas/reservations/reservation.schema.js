import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    booking_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReservationGroup',
    },
    primary_guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'IN_HOUSE', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'],
      default: 'PENDING',
      required: true,
    },
    expected_check_in: {
      type: Date,
      required: true,
    },
    expected_check_out: {
      type: Date,
      required: true,
    },
    adults: {
      type: Number,
      required: true,
      min: 1,
    },
    children: {
      type: Number,
      default: 0,
      min: 0,
    },
    special_requests: {
      type: String,
    },
    cancellation_reason: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
reservationSchema.index({ primary_guest_id: 1 });
reservationSchema.index({ group_id: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ expected_check_in: 1 });

export default reservationSchema;
