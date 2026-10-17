import mongoose from 'mongoose';

const maintenanceTicketSchema = new mongoose.Schema(
  {
    ticket_ref: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      // Optional, since maintenance might be in a public area
    },
    location_details: {
      type: String, // e.g., 'Pool area', 'Lobby'
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      required: true,
    },
    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', // Could also be a guest, but typically an employee logs it
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    resolved_at: {
      type: Date,
    },
    resolution_notes: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
maintenanceTicketSchema.index({ room_id: 1 });
maintenanceTicketSchema.index({ status: 1 });

export default maintenanceTicketSchema;
