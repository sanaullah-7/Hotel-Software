import mongoose from 'mongoose';

const guestChargeSchema = new mongoose.Schema(
  {
    folio_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folio',
      required: true,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
    },
    reservation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    charge_type: {
      type: String,
      enum: [
        'ROOM_RATE',
        'RESTAURANT',
        'SPA',
        'MINIBAR',
        'LAUNDRY',
        'OTHER_SERVICE',
        'TAX',
        'FEE',
        'ROOM_SERVICE',
        'PARKING',
        'MISCELLANEOUS',
        'DAMAGE',
        'CONSUMPTION',
        'MISSING_ITEM',
      ],
      required: true,
    },
    item_name: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unit_price: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
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
      type: mongoose.Schema.Types.ObjectId, // Could link to a RestaurantOrder, InventoryIncident, etc.
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
guestChargeSchema.index({ folio_id: 1 });
guestChargeSchema.index({ guest_id: 1 });
guestChargeSchema.index({ reservation_id: 1 });
guestChargeSchema.index({ charge_type: 1 });
guestChargeSchema.index({ date: 1 });

export default guestChargeSchema;
