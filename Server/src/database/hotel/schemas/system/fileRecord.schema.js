import mongoose from 'mongoose';

const fileRecordSchema = new mongoose.Schema(
  {
    file_name: {
      type: String,
      required: true,
      trim: true,
    },
    original_name: {
      type: String,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    size_bytes: {
      type: Number,
      required: true,
    },
    storage_provider: {
      type: String,
      enum: ['CLOUDINARY', 'GRIDFS', 'S3'],
      default: 'CLOUDINARY',
    },
    storage_key: {
      type: String, // e.g. Cloudinary public_id or S3/GridFS key
    },
    storage_url: {
      type: String,
      required: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    entity_ref: {
      type: String, // e.g., 'GUEST_DOCUMENT', 'EMPLOYEE_DOCUMENT', 'EXPENSE_RECEIPT', 'CAR_PARKING', 'HOTEL_LOGO'
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
fileRecordSchema.index({ entity_ref: 1, entity_id: 1 });
fileRecordSchema.index({ uploaded_by: 1 });

export default fileRecordSchema;
