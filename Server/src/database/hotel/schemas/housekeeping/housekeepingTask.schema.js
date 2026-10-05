import mongoose from 'mongoose';

const housekeepingTaskSchema = new mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    task_type: {
      type: String,
      enum: ['CLEANING', 'INSPECTION', 'TURN_DOWN', 'DEEP_CLEANING'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'],
      default: 'PENDING',
      required: true,
    },
    notes: {
      type: String,
    },
    started_at: {
      type: Date,
    },
    completed_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
housekeepingTaskSchema.index({ room_id: 1 });
housekeepingTaskSchema.index({ assigned_to: 1 });
housekeepingTaskSchema.index({ status: 1 });

export default housekeepingTaskSchema;
