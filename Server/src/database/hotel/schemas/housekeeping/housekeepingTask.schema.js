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
      enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED'],
      default: 'PENDING',
      required: true,
    },
    notes: {
      type: String,
    },
    scheduled_at: {
      type: Date,
    },
    scheduled_end_at: {
      type: Date,
    },
    started_at: {
      type: Date,
    },
    completed_at: {
      type: Date,
    },
    is_deleted: {
      type: Boolean,
      default: false,
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
housekeepingTaskSchema.index({ scheduled_at: 1 });
housekeepingTaskSchema.index({ is_deleted: 1 });

export default housekeepingTaskSchema;
