import mongoose from 'mongoose';

const folioSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    folio_ref: {
      type: String,
      required: true,
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
folioSchema.index(
  { reservation_id: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: 'OPEN',
      reservation_id: { $type: 'objectId' },
    },
    name: 'unique_open_folio_per_reservation',
  }
);
folioSchema.index({ stay_id: 1 });
folioSchema.index({ guest_id: 1 });

folioSchema.index({ hotelId: 1, folio_ref: 1 }, { unique: true });

export default folioSchema;
