import mongoose from 'mongoose';

// Embedded subdocument for room_type_amenities
const roomTypeAmenitySchema = new mongoose.Schema(
  {
    amenity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Amenity',
      required: true,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false } // No need for separate _id for embedded array items unless required
);

const roomTypeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    base_occupancy: {
      type: Number,
      required: true,
      min: 1,
    },
    max_occupancy: {
      type: Number,
      required: true,
      min: 1,
    },
    base_price: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: [roomTypeAmenitySchema],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Middleware to prevent duplicate amenities
roomTypeSchema.pre('save', function () {
  if (this.amenities && this.amenities.length > 0) {
    const uniqueAmenities = new Set(this.amenities.map(a => a.amenity_id.toString()));
    if (uniqueAmenities.size !== this.amenities.length) {
      throw new Error('Duplicate amenities are not allowed in a RoomType.');
    }
  }
});

export default roomTypeSchema;
