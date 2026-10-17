import mongoose from 'mongoose';

const staySchema = new mongoose.Schema(
  {
    stay_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    reservation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    primary_guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    status: {
      type: String,
      enum: ['CHECKED_IN', 'CHECKED_OUT'],
      default: 'CHECKED_IN',
      required: true,
    },
    actual_check_in: {
      type: Date,
      required: true,
    },
    actual_check_out: {
      type: Date,
    },
    total_guests: {
      type: Number,
      required: true,
      min: 1,
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
staySchema.index({ reservation_id: 1 });
staySchema.index({ primary_guest_id: 1 });
staySchema.index({ status: 1 });

export default staySchema;
