import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    movement_type: {
      type: String,
      enum: ['PURCHASE', 'TRANSFER', 'CONSUMPTION', 'LOSS', 'ADJUSTMENT'],
      required: true,
    },
    quantity: {
      type: Number, // Strictly positive magnitude (>= 0.0001); movement_type dictates incoming vs outgoing
      required: true,
      min: 0.0001,
    },
    previous_quantity: {
      type: Number,
      min: 0,
      default: null,
    },
    new_quantity: {
      type: Number,
      min: 0,
      default: null,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    recorded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId, // Optional reference (e.g. Expense, Incident, Order, Folio, Stay)
      default: null,
    },
    reference_type: {
      type: String, // e.g., 'INCIDENT', 'EXPENSE', 'GUEST_CHARGE', 'RESTAURANT_ORDER', 'MANUAL_AUDIT'
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
inventoryMovementSchema.index({ item_id: 1, date: -1 });
inventoryMovementSchema.index({ movement_type: 1, date: -1 });
inventoryMovementSchema.index({ reference_id: 1 });

export default inventoryMovementSchema;
