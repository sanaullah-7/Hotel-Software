import mongoose from 'mongoose';

const guestDocumentSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    guest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
    },
    form_no: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
      default: 'Guest Identification Document',
    },
    document_type: {
      type: String,
      required: true,
      default: 'Passport',
    },
    document_number: {
      type: String,
      required: true,
    },
    document_url: {
      type: String,
      default: '',
    },
    room_number: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Signed & Verified',
    },
    notes: {
      type: String,
      default: '',
    },
    issued_country: {
      type: String,
      default: '',
    },
    expiry_date: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

guestDocumentSchema.index({ guest_id: 1 });
guestDocumentSchema.index({ document_number: 1 });

export default guestDocumentSchema;
