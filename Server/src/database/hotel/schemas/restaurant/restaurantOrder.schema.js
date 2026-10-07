import mongoose from 'mongoose';

const restaurantOrderItemSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    menu_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantMenuItem',
    },
    item_name_snapshot: {
      type: String,
      required: true,
      trim: true,
    },
    unit_price_snapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    special_requests: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const restaurantOrderSchema = new mongoose.Schema(
  {
    order_ref: {
      type: String,
      required: true,
      trim: true,
    },
    table_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantTable',
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId, // Optional, could be walk-in
      ref: 'Guest',
    },
    folio_id: {
      type: mongoose.Schema.Types.ObjectId, // If charged to room
      ref: 'Folio',
    },
    server_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    customer_name: {
      type: String,
      trim: true,
    },
    room_number: {
      type: String,
      trim: true,
    },
    payment_mode: {
      type: String,
      enum: ['ROOM_FOLIO', 'CASH', 'CARD', 'ONLINE'],
      default: 'ROOM_FOLIO',
    },
    notes: {
      type: String,
      trim: true,
    },
    idempotency_key: {
      type: String,
      trim: true,
    },
    settled_at: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PREPARING', 'SERVED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    items: [restaurantOrderItemSchema],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
// Note: order_ref has unique: true which creates a unique index.
restaurantOrderSchema.index({ table_id: 1 });
restaurantOrderSchema.index({ status: 1 });
restaurantOrderSchema.index({ folio_id: 1 });
restaurantOrderSchema.index({ guest_id: 1 });
restaurantOrderSchema.index({ created_at: -1 });
restaurantOrderSchema.index({ hotelId: 1, order_ref: 1 }, { unique: true });
restaurantOrderSchema.index(
  { hotelId: 1, idempotency_key: 1 },
  { unique: true, partialFilterExpression: { idempotency_key: { $type: 'string' } } }
);

export default restaurantOrderSchema;
