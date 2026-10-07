import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiError from "../../../utils/apiError.js";

// Cross-tenant protection: every referenced amenity must exist in THIS hotel.
const assertAmenitiesInTenant = async (hotelContext, amenities) => {
  if (!Array.isArray(amenities) || amenities.length === 0) return;
  const Amenity = await getModel(hotelContext, "Amenity");
  const ids = [...new Set(amenities.map((a) => a.amenity_id))];
  const found = await Amenity.countDocuments({ _id: { $in: ids }, hotelId: hotelContext });
  if (found !== ids.length) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "One or more referenced amenities do not exist in this hotel");
  }
};

export const createRoomType = asyncHandler(async (req, res) => {
  const RoomType = await getModel(req.hotelContext, "RoomType");

  const existing = await RoomType.findOne({ code: req.body.code, hotelId: req.hotelContext });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Room type with this code already exists");
  }

  await assertAmenitiesInTenant(req.hotelContext, req.body.amenities);

  const roomTypeData = { ...req.body, hotelId: req.hotelContext };
  const roomType = await RoomType.create(roomTypeData);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, roomType, "Room type created successfully"));
});

export const getRoomTypes = asyncHandler(async (req, res) => {
  const RoomType = await getModel(req.hotelContext, "RoomType");
  const roomTypes = await RoomType.find({ hotelId: req.hotelContext }).populate("amenities.amenity_id").sort({ code: 1 });
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, roomTypes, "Room types retrieved successfully"));
});

export const getRoomTypeById = asyncHandler(async (req, res) => {
  const RoomType = await getModel(req.hotelContext, "RoomType");
  const roomType = await RoomType.findOne({ _id: req.params.id, hotelId: req.hotelContext }).populate("amenities.amenity_id");

  if (!roomType) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room type not found");
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, roomType, "Room type retrieved successfully"));
});

export const updateRoomType = asyncHandler(async (req, res) => {
  const RoomType = await getModel(req.hotelContext, "RoomType");

  const roomType = await RoomType.findOne({ _id: req.params.id, hotelId: req.hotelContext });

  if (!roomType) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room type not found");
  }

  await assertAmenitiesInTenant(req.hotelContext, req.body.amenities);

  // Cross-field rule must hold on the MERGED document (a partial update can break it).
  const base = req.body.base_occupancy ?? roomType.base_occupancy;
  const max = req.body.max_occupancy ?? roomType.max_occupancy;
  if (max < base) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "max_occupancy must be greater than or equal to base_occupancy");
  }

  const updateData = { ...req.body };
  delete updateData.hotelId;

  Object.assign(roomType, updateData);
  await roomType.save();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, roomType, "Room type updated successfully"));
});

// Business rule: a room type that still has rooms cannot be deleted.
export const deleteRoomType = asyncHandler(async (req, res) => {
  const RoomType = await getModel(req.hotelContext, "RoomType");
  const Room = await getModel(req.hotelContext, "Room");

  const roomType = await RoomType.findOne({ _id: req.params.id, hotelId: req.hotelContext });
  if (!roomType) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room type not found");
  }

  const rooms = await Room.countDocuments({ room_type_id: roomType._id, hotelId: req.hotelContext });
  if (rooms > 0) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Room type is in use by existing rooms and cannot be deleted");
  }

  await RoomType.deleteOne({ _id: roomType._id, hotelId: req.hotelContext });
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, "Room type deleted successfully"));
});
