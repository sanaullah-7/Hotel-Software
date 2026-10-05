import mongoose from 'mongoose';

const folioSchema = new mongoose.Schema(
  {
    folio_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    reservation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
    stay_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stay',
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'PKR',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
folioSchema.index({ reservation_id: 1 });
folioSchema.index({ stay_id: 1 });
folioSchema.index({ guest_id: 1 });

export default folioSchema;
