/**
 * Lost & Found Data Contract Adapter
 * Centralizes UI <-> Backend data mapping for Lost and Found domain.
 */

export const mapStatusToFrontend = (backendStatus) => {
  switch (backendStatus) {
    case "REPORTED":
      return "Found";
    case "CLAIMED":
      return "Claimed";
    case "DISCARDED":
      return "Disposed";
    case "DONATED":
      return "Disposed";
    default:
      return "Found";
  }
};

export const mapStatusToBackend = (frontendStatus) => {
  switch (frontendStatus) {
    case "Found":
      return "REPORTED";
    case "Claimed":
      return "CLAIMED";
    case "Returned":
      return "CLAIMED";
    case "Disposed":
      return "DISCARDED";
    case "Donated":
      return "DONATED";
    default:
      return "REPORTED";
  }
};

export const toFrontendItem = (item) => {
  if (!item) return null;

  let finderName = "";
  let foundById = null;

  if (item.found_by && typeof item.found_by === "object") {
    foundById = item.found_by._id || item.found_by.id;
    finderName = `${item.found_by.first_name || ""} ${item.found_by.last_name || ""}`.trim();
  } else if (item.found_by) {
    foundById = item.found_by;
  }

  if (!finderName && item.finder_name) {
    finderName = item.finder_name;
  }

  const rawDate = item.found_date || item.createdAt || item.created_at;
  const formattedFoundDate = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : "";

  const rawClaimedDate = item.claimed_date;
  const formattedClaimedDate = rawClaimedDate ? new Date(rawClaimedDate).toISOString().slice(0, 10) : "";

  return {
    id: item._id || item.id,
    _id: item._id || item.id,
    reference: item.reference_number || "",
    referenceNumber: item.reference_number || "",
    itemName: item.item_name || item.item_type || "",
    itemType: item.item_type || item.item_name || "",
    location: item.found_location || "",
    foundLocation: item.found_location || "",
    foundDate: formattedFoundDate,
    foundBy: foundById,
    finderName: finderName || "-",
    status: mapStatusToFrontend(item.status),
    backendStatus: item.status || "REPORTED",
    description: item.description || "",
    claimant: item.claimed_by || "",
    claimedBy: item.claimed_by || "",
    claimedDate: formattedClaimedDate,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

export const toFrontendItemList = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(toFrontendItem).filter(Boolean);
};

export const toBackendPayload = (form) => {
  if (!form) return {};

  const status = mapStatusToBackend(form.status);
  const payload = {
    item_type: (form.itemName || form.itemType || "Unspecified Item").trim(),
    item_name: (form.itemName || form.itemType || "").trim(),
    description: (form.description || "").trim(),
    found_location: (form.location || form.foundLocation || "").trim(),
    status,
  };

  if (form.foundDate) {
    payload.found_date = new Date(form.foundDate).toISOString();
  }

  if (form.foundBy) {
    payload.found_by = form.foundBy;
  }

  if (form.finderName && form.finderName !== "-") {
    payload.finder_name = form.finderName.trim();
  }

  if (form.claimant || form.claimedBy) {
    payload.claimed_by = (form.claimant || form.claimedBy).trim();
  }

  if (form.claimedDate) {
    payload.claimed_date = new Date(form.claimedDate).toISOString();
  } else if (status === "CLAIMED") {
    payload.claimed_date = new Date().toISOString();
  }

  return payload;
};

export default {
  mapStatusToFrontend,
  mapStatusToBackend,
  toFrontendItem,
  toFrontendItemList,
  toBackendPayload,
};
