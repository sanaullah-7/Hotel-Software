import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', // Could also be a guest, depending on system usage
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['SYSTEM', 'ALERT', 'REMINDER', 'MESSAGE'],
      default: 'SYSTEM',
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    action_url: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
notificationSchema.index({ recipient_id: 1, is_read: 1 });
notificationSchema.index({ created_at: -1 });

export default notificationSchema;
