import mongoose from 'mongoose';

const restaurantOrderItemSchema = new mongoose.Schema(
  {
    menu_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantMenuItem',
    },
    item_name_snapshot: {
      type: String,
      required: true,
    },
    unit_price_snapshot: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    special_requests: {
      type: String,
    },
  },
  { _id: false }
);

const restaurantOrderSchema = new mongoose.Schema(
  {
    order_ref: {
      type: String,
      required: true,
      unique: true,
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
    },
    items: [restaurantOrderItemSchema],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
restaurantOrderSchema.index({ order_ref: 1 });
restaurantOrderSchema.index({ table_id: 1 });
restaurantOrderSchema.index({ status: 1 });

export default restaurantOrderSchema;
