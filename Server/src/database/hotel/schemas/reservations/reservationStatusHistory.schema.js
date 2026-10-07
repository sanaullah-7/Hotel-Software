import mongoose from 'mongoose';

const reservationStatusHistorySchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    reservation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    changed_by_user: {
      type: mongoose.Schema.Types.ObjectId,
      // Ref to Platform Account ID since users are authenticated there,
      // but conceptually it's just the ID of the person making the change.
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    // We intentionally don't need update timestamps for append-only audit
    timestamps: false,
  }
);

// Indexes for fast history retrieval
reservationStatusHistorySchema.index({ reservation_id: 1, timestamp: -1 });

export default reservationStatusHistorySchema;
