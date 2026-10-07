import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiError from "../../../utils/apiError.js";
import { asString } from "../../../utils/query.js";

// Uniqueness: the UNIQUE index on `hotelId + name` is the final guarantee (E11000 -> 409).
export const createAmenity = asyncHandler(async (req, res) => {
  const Amenity = await getModel(req.hotelContext, "Amenity");

  const existing = await Amenity.findOne({ name: req.body.name, hotelId: req.hotelContext });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Amenity with this name already exists");
  }

  const amenityData = { ...req.body, hotelId: req.hotelContext };
  const amenity = await Amenity.create(amenityData);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, amenity, "Amenity created successfully"));
});

export const getAmenities = asyncHandler(async (req, res) => {
  const Amenity = await getModel(req.hotelContext, "Amenity");

  const query = { hotelId: req.hotelContext };
  const category = asString(req.query.category);
  if (category) {
    query.category = category;
  }

  const amenities = await Amenity.find(query).sort({ name: 1 });
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, amenities, "Amenities retrieved successfully"));
});

export const getAmenityById = asyncHandler(async (req, res) => {
  const Amenity = await getModel(req.hotelContext, "Amenity");
  const amenity = await Amenity.findOne({ _id: req.params.id, hotelId: req.hotelContext });

  if (!amenity) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Amenity not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, amenity, "Amenity retrieved successfully"));
});

export const updateAmenity = asyncHandler(async (req, res) => {
  const Amenity = await getModel(req.hotelContext, "Amenity");
  const updateData = { ...req.body };
  delete updateData.hotelId;

  const amenity = await Amenity.findOneAndUpdate(
    { _id: req.params.id, hotelId: req.hotelContext },
    updateData,
    { returnDocument: "after", runValidators: true }
  );

  if (!amenity) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Amenity not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, amenity, "Amenity updated successfully"));
});

// Business rule: an amenity that is still referenced by a room type or a room cannot be
// deleted (prevents dangling references).
export const deleteAmenity = asyncHandler(async (req, res) => {
  const Amenity = await getModel(req.hotelContext, "Amenity");
  const RoomType = await getModel(req.hotelContext, "RoomType");
  const Room = await getModel(req.hotelContext, "Room");

  const amenity = await Amenity.findOne({ _id: req.params.id, hotelId: req.hotelContext });
  if (!amenity) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Amenity not found");
  }

  const [rtRefs, roomRefs] = await Promise.all([
    RoomType.countDocuments({ "amenities.amenity_id": amenity._id, hotelId: req.hotelContext }),
    Room.countDocuments({ "extra_amenities.amenity_id": amenity._id, hotelId: req.hotelContext }),
  ]);
  if (rtRefs > 0 || roomRefs > 0) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Amenity is in use by room types or rooms and cannot be deleted");
  }

  await Amenity.deleteOne({ _id: amenity._id, hotelId: req.hotelContext });

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, "Amenity deleted successfully"));
});
