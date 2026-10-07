/**
 * Inspection Checklist Data Contract Adapter
 * Centralizes UI <-> Backend data mapping for Housekeeping Inspection domain.
 */

export const mapStatusToFrontend = (backendStatus) => {
  switch ((backendStatus || "").toUpperCase()) {
    case "PASSED":
      return "Passed";
    case "FAILED":
      return "Failed";
    case "PENDING":
    default:
      return "Pending";
  }
};

export const mapStatusToBackend = (frontendStatus) => {
  switch (frontendStatus) {
    case "Passed":
      return "PASSED";
    case "Failed":
      return "FAILED";
    case "Pending":
    default:
      return "PENDING";
  }
};

export const toFrontendInspection = (item) => {
  if (!item) return null;

  // Extract room details from populated task_id.room_id or top-level properties
  let roomNo = "";
  let roomType = "Deluxe";
  let roomId = null;
  let taskId = null;

  if (item.task_id && typeof item.task_id === "object") {
    taskId = item.task_id._id || item.task_id.id;
    if (item.task_id.room_id && typeof item.task_id.room_id === "object") {
      roomId = item.task_id.room_id._id || item.task_id.room_id.id;
      roomNo = item.task_id.room_id.room_number || "";
      if (item.task_id.room_id.room_type_id && typeof item.task_id.room_id.room_type_id === "object") {
        roomType = item.task_id.room_id.room_type_id.name || "Deluxe";
      }
    } else if (item.task_id.room_id) {
      roomId = item.task_id.room_id;
    }
  } else if (item.task_id) {
    taskId = item.task_id;
  }

  if (!roomNo) {
    roomNo = item.room_number || item.roomNo || "";
  }

  let normalizedRoomType = "Deluxe";
  const rawType = (roomType || item.room_type || item.roomType || "").toString();
  if (/penthouse/i.test(rawType)) normalizedRoomType = "Penthouse";
  else if (/suite/i.test(rawType) && !/deluxe/i.test(rawType)) normalizedRoomType = "Suite";
  else if (/deluxe/i.test(rawType)) normalizedRoomType = "Deluxe";
  else if (/standard/i.test(rawType)) normalizedRoomType = "Standard";
  else if (["Standard", "Deluxe", "Suite", "Penthouse"].includes(rawType)) normalizedRoomType = rawType;

  // Extract inspector details from populated inspector_id
  let inspector = "";
  let inspectorId = null;

  if (item.inspector_id && typeof item.inspector_id === "object") {
    inspectorId = item.inspector_id._id || item.inspector_id.id;
    inspector = `${item.inspector_id.first_name || ""} ${item.inspector_id.last_name || ""}`.trim();
  } else if (item.inspector_id) {
    inspectorId = item.inspector_id;
  }

  if (!inspector) {
    inspector = item.inspector_name || item.inspector || "-";
  }

  // Format date
  const rawDate = item.inspected_at || item.created_at || item.inspectionDate;
  const inspectionDate = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : "";

  return {
    id: item._id || item.id,
    _id: item._id || item.id,
    roomNo: String(roomNo),
    roomType: normalizedRoomType,
    roomId,
    taskId,
    inspector,
    inspectorId,
    status: mapStatusToFrontend(item.status),
    backendStatus: (item.status || "PENDING").toUpperCase(),
    score: Number(item.score !== undefined ? item.score : 0),
    comments: item.comments || "",
    inspectionDate,
    checklistId: item.checklist_id ? (item.checklist_id._id || item.checklist_id) : null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    raw: item,
  };
};

export const toFrontendInspectionList = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(toFrontendInspection).filter(Boolean);
};

export const toBackendPayload = (form) => {
  if (!form) return {};

  const status = mapStatusToBackend(form.status);
  const payload = {
    room_number: (form.roomNo || "").trim(),
    inspector_name: (form.inspector || "").trim(),
    status,
    score: Number(form.score !== undefined ? form.score : 0),
    comments: (form.comments || "").trim(),
  };

  if (form.inspectionDate) {
    payload.inspected_at = new Date(form.inspectionDate).toISOString();
  }

  if (form.roomId) {
    payload.room_id = form.roomId;
  }
  if (form.taskId) {
    payload.task_id = form.taskId;
  }
  if (form.inspectorId) {
    payload.inspector_id = form.inspectorId;
  }
  if (form.checklistId) {
    payload.checklist_id = form.checklistId;
  }

  return payload;
};

export default {
  mapStatusToFrontend,
  mapStatusToBackend,
  toFrontendInspection,
  toFrontendInspectionList,
  toBackendPayload,
};
