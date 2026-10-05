import mongoose from 'mongoose';

const guestDocumentSchema = new mongoose.Schema(
  {
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    document_type: {
      type: String, // e.g., 'PASSPORT', 'ID_CARD', 'DRIVER_LICENSE'
      required: true,
    },
    document_number: {
      type: String,
      required: true,
    },
    document_url: {
      type: String,
      required: true,
    },
    issued_country: {
      type: String,
    },
    expiry_date: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
guestDocumentSchema.index({ guest_id: 1 });
guestDocumentSchema.index({ document_number: 1 });

export default guestDocumentSchema;
