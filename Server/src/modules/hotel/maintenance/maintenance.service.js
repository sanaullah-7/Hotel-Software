import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const generateTicketRef = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TICK-${Date.now().toString().slice(-6)}${randHex}`;
};

export const createTicket = async (tenantConn, ticketData) => {
  const Room = await getModel(tenantConn, "Room");
  const Employee = await getModel(tenantConn, "Employee");
  const MaintenanceTicket = await getModel(tenantConn, "MaintenanceTicket");

  const { title, description, room_id, location_details, priority = "MEDIUM", assigned_to } = ticketData;

  let room = null;
  if (room_id) {
    if (!mongoose.Types.ObjectId.isValid(room_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
    }
    room = await Room.findById(room_id);
    if (!room) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found in this hotel");
    }
  }

  let employee = null;
  if (assigned_to) {
    if (!mongoose.Types.ObjectId.isValid(assigned_to)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Employee ID format");
    }
    employee = await Employee.findById(assigned_to);
    if (!employee) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Employee not found in this hotel");
    }
  }

  const ticket_ref = generateTicketRef();

  const ticket = await MaintenanceTicket.create({
    ticket_ref,
    title,
    description,
    room_id: room ? room._id : null,
    location_details: location_details || (room ? `Room ${room.room_number}` : "General Area"),
    priority,
    status: employee ? "ASSIGNED" : "OPEN",
    assigned_to: employee ? employee._id : null,
  });

  if (room && (priority === "CRITICAL" || priority === "HIGH")) {
    room.status = "MAINTENANCE";
    await room.save();
  }

  return ticket;
};

export const getTickets = async (tenantConn, query = {}) => {
  const MaintenanceTicket = await getModel(tenantConn, "MaintenanceTicket");

  const filter = {};
  const status = asString(query.status);
  if (status) filter.status = status.toUpperCase();

  const roomId = asString(query.room_id);
  if (roomId) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
    }
    filter.room_id = roomId;
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const tickets = await MaintenanceTicket.find(filter)
    .populate("room_id", "room_number status floor")
    .populate("assigned_to", "first_name last_name employee_ref")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MaintenanceTicket.countDocuments(filter);

  return {
    tickets,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const updateTicket = async (tenantConn, ticketId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid MaintenanceTicket ID format");
  }

  const MaintenanceTicket = await getModel(tenantConn, "MaintenanceTicket");
  const Room = await getModel(tenantConn, "Room");

  const ticket = await MaintenanceTicket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Maintenance ticket not found");
  }

  if (updateData.status) {
    ticket.status = updateData.status;
    if (["RESOLVED", "CLOSED"].includes(updateData.status)) {
      ticket.resolved_at = new Date();
      if (ticket.room_id) {
        const room = await Room.findById(ticket.room_id);
        if (room && room.status === "MAINTENANCE") {
          room.status = "AVAILABLE";
          await room.save();
        }
      }
    }
  }

  if (updateData.assigned_to !== undefined) {
    ticket.assigned_to = updateData.assigned_to;
  }
  if (updateData.resolution_notes !== undefined) {
    ticket.resolution_notes = updateData.resolution_notes;
  }

  await ticket.save();
  return MaintenanceTicket.findById(ticketId)
    .populate("room_id", "room_number status floor")
    .populate("assigned_to", "first_name last_name employee_ref");
};
