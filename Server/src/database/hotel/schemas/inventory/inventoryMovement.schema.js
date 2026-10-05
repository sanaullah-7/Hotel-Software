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
      type: Number, // Can be positive or negative based on movement_type, but typically positive value and we infer math based on type
      required: true,
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
      type: mongoose.Schema.Types.ObjectId, // Optional reference (e.g., to an Expense or Incident)
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
inventoryMovementSchema.index({ item_id: 1, date: -1 });
inventoryMovementSchema.index({ movement_type: 1 });

export default inventoryMovementSchema;
