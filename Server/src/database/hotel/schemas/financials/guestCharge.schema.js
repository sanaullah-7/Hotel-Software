import mongoose from 'mongoose';

const guestChargeSchema = new mongoose.Schema(
  {
    folio_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folio',
      required: true,
    },
    charge_type: {
      type: String,
      enum: ['ROOM_RATE', 'RESTAURANT', 'SPA', 'MINIBAR', 'LAUNDRY', 'OTHER_SERVICE', 'TAX', 'FEE'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    is_voided: {
      type: Boolean,
      default: false,
    },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId, // Could link to a RestaurantOrder, etc.
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
guestChargeSchema.index({ folio_id: 1 });
guestChargeSchema.index({ charge_type: 1 });
guestChargeSchema.index({ date: 1 });

export default guestChargeSchema;
