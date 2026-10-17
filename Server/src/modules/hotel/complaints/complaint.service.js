import mongoose from "mongoose";
import crypto from "crypto";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, escapeRegex, parsePagination } from "../../../utils/query.js";

const PROTECTED_FIELDS = [
  "_id",
  "complaint_ref",
  "hotelId",
  "tenantId",
  "created_at",
  "updated_at",
  "__v",
];

const stripProtected = (data) => {
  const clean = { ...data };
  for (const k of PROTECTED_FIELDS) delete clean[k];
  return clean;
};

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const generateComplaintRef = async (tenantConn) => {
  const Complaint = await getModel(tenantConn, "Complaint");
  const dateStr = getLocalDateString();

  for (let attempt = 0; attempt < 5; attempt++) {
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const candidateRef = `CMP-${dateStr}-${randomHex}`;
    const exists = await Complaint.findOne({ complaint_ref: candidateRef });
    if (!exists) {
      return candidateRef;
    }
  }

  // Fallback if 5 collisions occur
  const fallbackHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CMP-${dateStr}-${fallbackHex}`;
};

export const createComplaint = async (tenantConn, complaintData) => {
  const Complaint = await getModel(tenantConn, "Complaint");
  const Guest = await getModel(tenantConn, "Guest");
  const Room = await getModel(tenantConn, "Room");
  const Reservation = await getModel(tenantConn, "Reservation");
  const Employee = await getModel(tenantConn, "Employee");

  const data = stripProtected(complaintData);

  if (!mongoose.Types.ObjectId.isValid(data.guest_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }

  const guest = await Guest.findById(data.guest_id);
  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found in this hotel");
  }

  let room = null;
  if (data.room_id) {
    if (!mongoose.Types.ObjectId.isValid(data.room_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
    }
    room = await Room.findById(data.room_id);
    if (!room) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found in this hotel");
    }
  }

  let reservation = null;
  if (data.reservation_id) {
    if (!mongoose.Types.ObjectId.isValid(data.reservation_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
    }
    reservation = await Reservation.findById(data.reservation_id);
    if (!reservation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found in this hotel");
    }
    if (reservation.primary_guest_id.toString() !== guest._id.toString()) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Reservation does not belong to the specified guest"
      );
    }
  }

  let employee = null;
  if (data.assigned_to) {
    if (!mongoose.Types.ObjectId.isValid(data.assigned_to)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Employee ID format");
    }
    employee = await Employee.findById(data.assigned_to);
    if (!employee) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found in this hotel");
    }
  }

  const complaint_ref = await generateComplaintRef(tenantConn);
  const status = data.status || "OPEN";
  let resolved_at = null;
  if (["RESOLVED", "CLOSED"].includes(status)) {
    resolved_at = new Date();
  }

  const newComplaint = await Complaint.create({
    ...data,
    complaint_ref,
    status,
    resolved_at,
    room_id: room ? room._id : null,
    reservation_id: reservation ? reservation._id : null,
    assigned_to: employee ? employee._id : null,
  });

  return Complaint.findById(newComplaint._id)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("room_id", "room_number floor status")
    .populate("reservation_id", "booking_ref status expected_check_in expected_check_out")
    .populate("assigned_to", "first_name last_name email employee_ref job_title");
};

export const getComplaints = async (tenantConn, query = {}) => {
  const Complaint = await getModel(tenantConn, "Complaint");

  const filter = {};

  const status = asString(query.status);
  if (status) filter.status = status.toUpperCase();

  const severity = asString(query.severity);
  if (severity) filter.severity = severity.toUpperCase();

  const category = asString(query.category);
  if (category) filter.category = category.toUpperCase();

  const guestId = asString(query.guest_id);
  if (guestId) {
    if (!mongoose.Types.ObjectId.isValid(guestId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
    }
    filter.guest_id = guestId;
  }

  const roomId = asString(query.room_id);
  if (roomId) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
    }
    filter.room_id = roomId;
  }

  const reservationId = asString(query.reservation_id);
  if (reservationId) {
    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
    }
    filter.reservation_id = reservationId;
  }

  const search = asString(query.search);
  if (search) {
    const searchRegex = new RegExp(escapeRegex(search.slice(0, 100)), "i");
    filter.$or = [{ complaint_ref: searchRegex }, { description: searchRegex }];
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const complaints = await Complaint.find(filter)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("room_id", "room_number floor status")
    .populate("reservation_id", "booking_ref status expected_check_in expected_check_out")
    .populate("assigned_to", "first_name last_name email employee_ref job_title")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Complaint.countDocuments(filter);

  return {
    complaints,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getComplaintById = async (tenantConn, complaintId) => {
  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Complaint ID format");
  }

  const Complaint = await getModel(tenantConn, "Complaint");
  const complaint = await Complaint.findById(complaintId)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("room_id", "room_number floor status")
    .populate("reservation_id", "booking_ref status expected_check_in expected_check_out")
    .populate("assigned_to", "first_name last_name email employee_ref job_title");

  if (!complaint) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Complaint not found");
  }

  return complaint;
};

export const updateComplaint = async (tenantConn, complaintId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Complaint ID format");
  }

  const Complaint = await getModel(tenantConn, "Complaint");
  const Room = await getModel(tenantConn, "Room");
  const Reservation = await getModel(tenantConn, "Reservation");
  const Employee = await getModel(tenantConn, "Employee");

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Complaint not found");
  }

  const data = stripProtected(updateData);

  // guest_id and complaint_ref are immutable
  if (data.guest_id && data.guest_id.toString() !== complaint.guest_id.toString()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Guest ID cannot be modified");
  }
  delete data.guest_id;

  if (data.room_id !== undefined) {
    if (data.room_id) {
      if (!mongoose.Types.ObjectId.isValid(data.room_id)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
      }
      const room = await Room.findById(data.room_id);
      if (!room) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found in this hotel");
      }
      complaint.room_id = room._id;
    } else {
      complaint.room_id = null;
    }
    delete data.room_id;
  }

  if (data.reservation_id !== undefined) {
    if (data.reservation_id) {
      if (!mongoose.Types.ObjectId.isValid(data.reservation_id)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
      }
      const reservation = await Reservation.findById(data.reservation_id);
      if (!reservation) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found in this hotel");
      }
      if (reservation.primary_guest_id.toString() !== complaint.guest_id.toString()) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Reservation does not belong to the specified guest"
        );
      }
      complaint.reservation_id = reservation._id;
    } else {
      complaint.reservation_id = null;
    }
    delete data.reservation_id;
  }

  if (data.assigned_to !== undefined) {
    if (data.assigned_to) {
      if (!mongoose.Types.ObjectId.isValid(data.assigned_to)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Employee ID format");
      }
      const employee = await Employee.findById(data.assigned_to);
      if (!employee) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found in this hotel");
      }
      complaint.assigned_to = employee._id;
    } else {
      complaint.assigned_to = null;
    }
    delete data.assigned_to;
  }

  if (data.status) {
    complaint.status = data.status;
    if (["RESOLVED", "CLOSED"].includes(data.status)) {
      complaint.resolved_at = new Date();
    } else if (["OPEN", "INVESTIGATING"].includes(data.status)) {
      complaint.resolved_at = null;
    }
    delete data.status;
  }

  for (const [key, val] of Object.entries(data)) {
    complaint[key] = val;
  }

  await complaint.save();

  return Complaint.findById(complaintId)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("room_id", "room_number floor status")
    .populate("reservation_id", "booking_ref status expected_check_in expected_check_out")
    .populate("assigned_to", "first_name last_name email employee_ref job_title");
};

export const deleteComplaint = async (tenantConn, complaintId) => {
  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Complaint ID format");
  }

  const Complaint = await getModel(tenantConn, "Complaint");
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Complaint not found");
  }

  await Complaint.deleteOne({ _id: complaint._id });
  return true;
};
