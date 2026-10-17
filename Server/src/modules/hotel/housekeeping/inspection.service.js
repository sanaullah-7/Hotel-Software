import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";

// Helper: Ensure an inspector Employee exists in this tenant (STRICT: NEVER AUTO-CREATES EMPLOYEES)
async function resolveInspector(tenantConn, { inspector_id, inspector_name }) {
  const Employee = await getModel(tenantConn, "Employee");

  if (inspector_id) {
    if (!mongoose.Types.ObjectId.isValid(inspector_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Inspector ID format");
    }
    const emp = await Employee.findById(inspector_id);
    if (!emp) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inspector employee not found in this hotel");
    }
    return emp;
  }

  if (inspector_name && inspector_name.trim()) {
    const trimmed = inspector_name.trim();
    const parts = trimmed.split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");

    // Look for existing employee in this hotel by name
    const query = lastName
      ? {
          $or: [
            { first_name: new RegExp(`^${firstName}$`, "i"), last_name: new RegExp(`^${lastName}$`, "i") },
            { first_name: new RegExp(`^${trimmed}$`, "i") },
          ],
        }
      : {
          $or: [
            { first_name: new RegExp(`^${trimmed}$`, "i") },
            { last_name: new RegExp(`^${trimmed}$`, "i") },
          ],
        };

    const employees = await Employee.find(query);
    if (employees.length === 1) {
      return employees[0];
    } else if (employees.length > 1) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Multiple employees match inspector name "${trimmed}". Please provide an explicit inspector_id`
      );
    } else {
      // STRICT REQUIREMENT: DO NOT AUTO-CREATE EMPLOYEES!
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        `Inspector employee "${trimmed}" not found in this hotel. Inspections must reference an existing staff member`
      );
    }
  }

  throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Inspector is required. Please provide a valid inspector_id or inspector_name");
}

// Helper: Resolve or create task for room
async function resolveTask(tenantConn, { task_id, room_id, room_number }, inspector) {
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");
  const Room = await getModel(tenantConn, "Room");

  if (task_id) {
    if (!mongoose.Types.ObjectId.isValid(task_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid HousekeepingTask ID format");
    }
    const task = await HousekeepingTask.findById(task_id);
    if (!task || task.is_deleted) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Housekeeping task not found in this hotel");
    }
    return task;
  }

  let room = null;
  if (room_id) {
    if (!mongoose.Types.ObjectId.isValid(room_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
    }
    room = await Room.findById(room_id);
  } else if (room_number) {
    room = await Room.findOne({ room_number: room_number.trim() });
  }

  if (!room) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found in this hotel");
  }

  // Find existing task for room or create inspection task
  let task = await HousekeepingTask.findOne({
    room_id: room._id,
    is_deleted: { $ne: true },
    status: { $in: ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"] },
  }).sort({ created_at: -1 });

  if (!task) {
    task = await HousekeepingTask.create({
      room_id: room._id,
      assigned_to: inspector ? inspector._id : null,
      task_type: "INSPECTION",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      notes: "Auto-generated inspection task",
      is_deleted: false,
    });
  }

  return task;
}

/**
 * Helper: Find the current authoritative (most recent active) inspection for a given room.
 * Domain ordering: inspected_at DESC, created_at DESC, _id DESC.
 */
async function getAuthoritativeInspection(tenantConn, roomId) {
  const HousekeepingInspection = await getModel(tenantConn, "HousekeepingInspection");
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");

  const tasks = await HousekeepingTask.find({ room_id: roomId }).select("_id");
  const taskIds = tasks.map(t => t._id);

  return HousekeepingInspection.findOne({
    task_id: { $in: taskIds },
    is_deleted: { $ne: true },
  }).sort({ inspected_at: -1, created_at: -1, _id: -1 });
}

/**
 * Synchronizes Task and Room operational lifecycle based on the authoritative inspection.
 * Changing an older historical inspection does NOT corrupt current operational room state.
 */
async function syncOperationalState(tenantConn, roomId) {
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");
  const Room = await getModel(tenantConn, "Room");

  const room = await Room.findById(roomId);
  if (!room) return;

  const authInspection = await getAuthoritativeInspection(tenantConn, roomId);
  if (!authInspection) return;

  const task = await HousekeepingTask.findById(authInspection.task_id);
  if (!task || task.is_deleted) return;

  if (authInspection.status === "PASSED") {
    task.status = "VERIFIED";
    task.completed_at = task.completed_at || new Date();
    room.housekeeping_status = "INSPECTED";
  } else if (authInspection.status === "FAILED") {
    task.status = "PENDING";
    room.housekeeping_status = "DIRTY";
  } else if (authInspection.status === "PENDING") {
    if (["COMPLETED", "VERIFIED"].includes(task.status)) {
      task.status = "IN_PROGRESS";
    }
  }

  await task.save();
  await room.save();
}

export const createInspection = async (tenantConn, inspectionData) => {
  const HousekeepingInspection = await getModel(tenantConn, "HousekeepingInspection");
  const HousekeepingChecklist = await getModel(tenantConn, "HousekeepingChecklist");

  // 1. Resolve Inspector (strictly requires existing Employee, never auto-creates)
  const inspector = await resolveInspector(tenantConn, {
    inspector_id: inspectionData.inspector_id,
    inspector_name: inspectionData.inspector_name,
  });

  // 2. Resolve Task
  const task = await resolveTask(tenantConn, {
    task_id: inspectionData.task_id,
    room_id: inspectionData.room_id,
    room_number: inspectionData.room_number,
  }, inspector);

  // 3. Resolve Checklist if provided
  let checklist = null;
  if (inspectionData.checklist_id) {
    if (!mongoose.Types.ObjectId.isValid(inspectionData.checklist_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Checklist ID format");
    }
    checklist = await HousekeepingChecklist.findById(inspectionData.checklist_id);
    if (!checklist || checklist.is_deleted) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Checklist not found in this hotel");
    }
  }

  // 4. Pass/Fail evaluation:
  // Note: No arbitrary 70% threshold exists in domain rules.
  // The inspector's explicit status ('PASSED', 'FAILED', 'PENDING') or passed flag is authoritative.
  let status = (inspectionData.status || "PENDING").toUpperCase();
  let score = inspectionData.score !== undefined ? Number(inspectionData.score) : 0;
  let passed = inspectionData.passed !== undefined ? Boolean(inspectionData.passed) : false;

  if (status === "PASSED") {
    passed = true;
  } else if (status === "FAILED") {
    passed = false;
  } else if (status === "PENDING") {
    passed = false;
  } else if (inspectionData.passed === true) {
    status = "PASSED";
    passed = true;
  } else if (inspectionData.passed === false) {
    status = "FAILED";
    passed = false;
  }

  // 5. Create Inspection record
  const inspection = await HousekeepingInspection.create({
    task_id: task._id,
    checklist_id: checklist ? checklist._id : null,
    inspector_id: inspector._id,
    status,
    passed,
    score,
    comments: inspectionData.comments || "",
    inspected_at: inspectionData.inspected_at || new Date(),
    is_deleted: false,
  });

  // 6. Synchronize Task and Room operational state via single authoritative owner
  await syncOperationalState(tenantConn, task.room_id);

  return HousekeepingInspection.findById(inspection._id)
    .populate({
      path: "task_id",
      populate: {
        path: "room_id",
        select: "room_number room_type_id status housekeeping_status floor",
        populate: { path: "room_type_id", select: "name code" },
      },
    })
    .populate("inspector_id", "first_name last_name employee_ref job_title")
    .populate("checklist_id", "name task_type items status");
};

export const getInspections = async (tenantConn, query = {}) => {
  const HousekeepingInspection = await getModel(tenantConn, "HousekeepingInspection");
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");

  const filter = { is_deleted: { $ne: true } };

  const status = asString(query.status);
  if (status) filter.status = status.toUpperCase();

  if (query.passed !== undefined) {
    filter.passed = query.passed === "true" || query.passed === true;
  }

  const inspectorId = asString(query.inspector_id);
  if (inspectorId) {
    if (!mongoose.Types.ObjectId.isValid(inspectorId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Inspector ID format");
    }
    filter.inspector_id = inspectorId;
  }

  const checklistId = asString(query.checklist_id);
  if (checklistId) {
    if (!mongoose.Types.ObjectId.isValid(checklistId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Checklist ID format");
    }
    filter.checklist_id = checklistId;
  }

  const taskId = asString(query.task_id);
  if (taskId) {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid HousekeepingTask ID format");
    }
    filter.task_id = taskId;
  }

  // Filter by Room ID
  const roomId = asString(query.room_id);
  if (roomId) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
    }
    const matchingTasks = await HousekeepingTask.find({ room_id: roomId }).select("_id");
    filter.task_id = { $in: matchingTasks.map(t => t._id) };
  }

  // Date filtering
  const inspectionDate = asString(query.inspection_date || query.date);
  if (inspectionDate) {
    const start = new Date(`${inspectionDate}T00:00:00.000Z`);
    const end = new Date(`${inspectionDate}T23:59:59.999Z`);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      filter.inspected_at = { $gte: start, $lte: end };
    }
  } else if (query.start_date || query.end_date) {
    filter.inspected_at = {};
    if (query.start_date) filter.inspected_at.$gte = new Date(query.start_date);
    if (query.end_date) filter.inspected_at.$lte = new Date(query.end_date);
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const inspections = await HousekeepingInspection.find(filter)
    .populate({
      path: "task_id",
      populate: {
        path: "room_id",
        select: "room_number room_type_id status housekeeping_status floor",
        populate: { path: "room_type_id", select: "name code" },
      },
    })
    .populate("inspector_id", "first_name last_name employee_ref job_title")
    .populate("checklist_id", "name task_type items status")
    .sort({ inspected_at: -1, created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await HousekeepingInspection.countDocuments(filter);

  return {
    inspections,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getInspectionById = async (tenantConn, inspectionId) => {
  if (!mongoose.Types.ObjectId.isValid(inspectionId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Inspection ID format");
  }

  const HousekeepingInspection = await getModel(tenantConn, "HousekeepingInspection");
  const inspection = await HousekeepingInspection.findOne({
    _id: inspectionId,
    is_deleted: { $ne: true },
  })
    .populate({
      path: "task_id",
      populate: {
        path: "room_id",
        select: "room_number room_type_id status housekeeping_status floor",
        populate: { path: "room_type_id", select: "name code" },
      },
    })
    .populate("inspector_id", "first_name last_name employee_ref job_title")
    .populate("checklist_id", "name task_type items status");

  if (!inspection) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inspection not found");
  }

  return inspection;
};

export const updateInspection = async (tenantConn, inspectionId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(inspectionId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Inspection ID format");
  }

  const HousekeepingInspection = await getModel(tenantConn, "HousekeepingInspection");
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");

  const inspection = await HousekeepingInspection.findOne({
    _id: inspectionId,
    is_deleted: { $ne: true },
  });

  if (!inspection) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inspection not found");
  }

  // Update inspector if provided (strictly validates existing Employee)
  if (updateData.inspector_id || updateData.inspector_name) {
    const inspector = await resolveInspector(tenantConn, {
      inspector_id: updateData.inspector_id,
      inspector_name: updateData.inspector_name,
    });
    inspection.inspector_id = inspector._id;
  }

  // Update checklist if provided
  if (updateData.checklist_id !== undefined) {
    if (updateData.checklist_id) {
      const HousekeepingChecklist = await getModel(tenantConn, "HousekeepingChecklist");
      const checklist = await HousekeepingChecklist.findById(updateData.checklist_id);
      if (!checklist || checklist.is_deleted) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Checklist not found in this hotel");
      }
      inspection.checklist_id = checklist._id;
    } else {
      inspection.checklist_id = null;
    }
  }

  if (updateData.comments !== undefined) {
    inspection.comments = updateData.comments;
  }
  if (updateData.inspected_at !== undefined) {
    inspection.inspected_at = updateData.inspected_at;
  }
  if (updateData.score !== undefined) {
    inspection.score = Number(updateData.score);
  }

  if (updateData.status !== undefined) {
    inspection.status = updateData.status.toUpperCase();
    if (inspection.status === "PASSED") {
      inspection.passed = true;
    } else if (inspection.status === "FAILED") {
      inspection.passed = false;
    }
  }

  if (updateData.passed !== undefined) {
    inspection.passed = Boolean(updateData.passed);
    if (inspection.passed && inspection.status !== "PASSED") {
      inspection.status = "PASSED";
    }
  }

  await inspection.save();

  // Authoritative operational synchronization:
  // Evaluates whether this inspection is the authoritative inspection for its room.
  // Historical edits to older inspections will NOT corrupt current room/task state!
  const task = await HousekeepingTask.findById(inspection.task_id);
  if (task) {
    await syncOperationalState(tenantConn, task.room_id);
  }

  return HousekeepingInspection.findById(inspectionId)
    .populate({
      path: "task_id",
      populate: {
        path: "room_id",
        select: "room_number room_type_id status housekeeping_status floor",
        populate: { path: "room_type_id", select: "name code" },
      },
    })
    .populate("inspector_id", "first_name last_name employee_ref job_title")
    .populate("checklist_id", "name task_type items status");
};

export const deleteInspection = async (tenantConn, inspectionId) => {
  if (!mongoose.Types.ObjectId.isValid(inspectionId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Inspection ID format");
  }

  const HousekeepingInspection = await getModel(tenantConn, "HousekeepingInspection");
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");

  const inspection = await HousekeepingInspection.findOne({
    _id: inspectionId,
    is_deleted: { $ne: true },
  });

  if (!inspection) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Inspection not found");
  }

  // Soft delete to maintain audit history
  inspection.is_deleted = true;
  await inspection.save();

  // Resynchronize room status with the remaining authoritative inspection
  const task = await HousekeepingTask.findById(inspection.task_id);
  if (task) {
    await syncOperationalState(tenantConn, task.room_id);
  }

  return { message: "Inspection deleted successfully" };
};

// Checklist Template Helpers
export const createChecklist = async (tenantConn, checklistData) => {
  const HousekeepingChecklist = await getModel(tenantConn, "HousekeepingChecklist");
  return HousekeepingChecklist.create({
    name: checklistData.name,
    task_type: checklistData.task_type || "INSPECTION",
    items: checklistData.items || [],
    status: checklistData.status || "ACTIVE",
    is_deleted: false,
  });
};

export const getChecklists = async (tenantConn, query = {}) => {
  const HousekeepingChecklist = await getModel(tenantConn, "HousekeepingChecklist");
  const filter = { is_deleted: { $ne: true } };

  if (query.task_type) {
    filter.task_type = query.task_type;
  }
  if (query.status) {
    filter.status = query.status.toUpperCase();
  }

  return HousekeepingChecklist.find(filter).sort({ created_at: -1 });
};

export const getChecklistById = async (tenantConn, checklistId) => {
  if (!mongoose.Types.ObjectId.isValid(checklistId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Checklist ID format");
  }
  const HousekeepingChecklist = await getModel(tenantConn, "HousekeepingChecklist");
  const checklist = await HousekeepingChecklist.findOne({
    _id: checklistId,
    is_deleted: { $ne: true },
  });
  if (!checklist) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Checklist not found");
  }
  return checklist;
};

export const updateChecklist = async (tenantConn, checklistId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(checklistId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Checklist ID format");
  }
  const HousekeepingChecklist = await getModel(tenantConn, "HousekeepingChecklist");
  const checklist = await HousekeepingChecklist.findOne({
    _id: checklistId,
    is_deleted: { $ne: true },
  });
  if (!checklist) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Checklist not found");
  }

  if (updateData.name !== undefined) checklist.name = updateData.name;
  if (updateData.task_type !== undefined) checklist.task_type = updateData.task_type;
  if (updateData.items !== undefined) checklist.items = updateData.items;
  if (updateData.status !== undefined) checklist.status = updateData.status.toUpperCase();

  await checklist.save();
  return checklist;
};

export const deleteChecklist = async (tenantConn, checklistId) => {
  if (!mongoose.Types.ObjectId.isValid(checklistId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Checklist ID format");
  }
  const HousekeepingChecklist = await getModel(tenantConn, "HousekeepingChecklist");
  const checklist = await HousekeepingChecklist.findOne({
    _id: checklistId,
    is_deleted: { $ne: true },
  });
  if (!checklist) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Checklist not found");
  }
  checklist.is_deleted = true;
  await checklist.save();
  return { message: "Checklist deleted successfully" };
};
