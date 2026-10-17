/**
 * Inventory Module Adapter
 * Handles bidirectional mapping between Backend Canonical schemas and Frontend UI models.
 */

export const adaptInventoryItemToUI = (backendItem) => {
  if (!backendItem) return null;

  const id = backendItem._id || backendItem.id;
  const sku = backendItem.sku || "";
  const name = backendItem.name || backendItem.itemName || "";
  const category = backendItem.category || "General";
  const quantity = Number(backendItem.quantity) || 0;
  const unitPrice = Number(backendItem.unit_cost !== undefined ? backendItem.unit_cost : backendItem.unitPrice) || 0;
  const minimumStock = Number(backendItem.reorder_level !== undefined ? backendItem.reorder_level : backendItem.minimumStock) || 0;
  const locationType = backendItem.location_type === "ROOM" || backendItem.locationType === "Room" ? "Room" : "Storage";
  
  const roomNumber = backendItem.room_number || (backendItem.room_id?.room_number) || (locationType === "Room" ? "—" : "-");
  const location = backendItem.location || (roomNumber !== "-" && roomNumber !== "—" ? `Room ${roomNumber}` : "Hotel Storage");

  let status = "Available";
  if (backendItem.status === "INACTIVE") {
    status = "Out of Stock";
  } else if (quantity === 0) {
    status = "Out of Stock";
  } else if (quantity <= minimumStock) {
    status = "Low Stock";
  } else {
    status = "Available";
  }

  const rawCondition = backendItem.condition || "GOOD";
  const condition = rawCondition.charAt(0).toUpperCase() + rawCondition.slice(1).toLowerCase();

  return {
    id,
    _id: id,
    sku,
    itemName: name,
    name,
    category,
    description: backendItem.description || "",
    locationType,
    location_type: backendItem.location_type || (locationType === "Room" ? "ROOM" : "STORAGE"),
    room_id: typeof backendItem.room_id === "object" ? backendItem.room_id?._id : (backendItem.room_id || null),
    roomNumber,
    location,
    quantity,
    unit: backendItem.unit || "PIECE",
    unitPrice,
    unit_cost: unitPrice,
    minimumStock,
    reorder_level: minimumStock,
    totalValue: quantity * unitPrice,
    condition,
    supplier: backendItem.supplier || "",
    notes: backendItem.notes || "",
    status,
    rawStatus: backendItem.status || "ACTIVE",
    lastUpdated: backendItem.updated_at ? new Date(backendItem.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    purchaseDate: backendItem.created_at ? new Date(backendItem.created_at).toISOString().split("T")[0] : "",
  };
};

export const adaptInventoryItemToBackend = (formData) => {
  if (!formData) return {};

  const name = (formData.itemName || formData.name || "").trim();
  const sku = (formData.sku || "").trim();
  const category = (formData.category || "").trim();
  const description = (formData.description || "").trim();
  const locationType = formData.locationType === "Room" || formData.location_type === "ROOM" ? "ROOM" : "STORAGE";
  const quantity = Number(formData.quantity) >= 0 ? Number(formData.quantity) : 0;
  const unitPrice = Number(formData.unitPrice !== undefined ? formData.unitPrice : formData.unit_cost) || 0;
  const minimumStock = Number(formData.minimumStock !== undefined ? formData.minimumStock : formData.reorder_level) || 0;
  
  let condition = "GOOD";
  if (formData.condition) {
    const uc = formData.condition.toUpperCase();
    if (["NEW", "GOOD", "FAIR", "DAMAGED"].includes(uc)) {
      condition = uc;
    } else if (uc === "BROKEN") {
      condition = "DAMAGED";
    }
  }

  const payload = {
    name,
    sku,
    category,
    description,
    location_type: locationType,
    quantity,
    unit: formData.unit || "PIECE",
    unit_cost: unitPrice,
    reorder_level: minimumStock,
    condition,
    supplier: (formData.supplier || "").trim(),
    notes: (formData.notes || "").trim(),
    status: formData.status === "INACTIVE" || formData.rawStatus === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };

  if (formData.room_id) {
    payload.room_id = formData.room_id;
  }
  if (formData.roomNumber && formData.roomNumber !== "-" && formData.roomNumber !== "—") {
    payload.room_number = formData.roomNumber;
  }
  if (formData.location) {
    payload.location = formData.location.trim();
  }

  return payload;
};

export const adaptIncidentToUI = (backendIncident) => {
  if (!backendIncident) return null;

  const id = backendIncident._id || backendIncident.id;
  const incidentNumber = backendIncident.incident_ref || id;
  const item = backendIncident.item_id || {};
  const itemId = typeof item === "object" ? item._id : item;
  const itemName = typeof item === "object" && item.name ? item.name : (backendIncident.itemName || "Inventory Item");
  const category = typeof item === "object" && item.category ? item.category : (backendIncident.category || "General");

  const missingQty = Number(backendIncident.quantity_lost) || 1;
  const unitValue = Number(backendIncident.unit_loss_value) || (typeof item === "object" && item.unit_cost ? Number(item.unit_cost) : 0);
  const totalLoss = Number(backendIncident.total_loss_value) || (missingQty * unitValue);

  let uiStatus = "Reported";
  if (backendIncident.status === "INVESTIGATING") {
    uiStatus = "Under Investigation";
  } else if (backendIncident.status === "RESOLVED") {
    if (backendIncident.resolution_type === "RECOVERED") uiStatus = "Recovered";
    else if (backendIncident.resolution_type === "REPLACED") uiStatus = "Replaced";
    else if (backendIncident.resolution_type === "WRITTEN_OFF") uiStatus = "Written Off";
    else uiStatus = "Recovered";
  }

  const reportedBy = backendIncident.reported_by?.firstName
    ? `${backendIncident.reported_by.firstName} ${backendIncident.reported_by.lastName || ""}`.trim()
    : (backendIncident.reportedBy || "Housekeeping Staff");

  const assignedTo = backendIncident.assigned_to?.firstName
    ? `${backendIncident.assigned_to.firstName} ${backendIncident.assigned_to.lastName || ""}`.trim()
    : (backendIncident.assignedTo || "Housekeeping Supervisor");

  const timeline = (backendIncident.timeline || []).map((t) => ({
    date: t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "Today",
    action: t.action,
    user: t.user || "Staff",
    detail: t.detail || "",
  }));

  return {
    id,
    _id: id,
    incidentNumber,
    incident_ref: backendIncident.incident_ref,
    inventoryItemId: itemId,
    itemName,
    category,
    roomNumber: backendIncident.room_number || "N/A",
    location: backendIncident.room_number ? `Room ${backendIncident.room_number}` : "Hotel Storage",
    quantity: missingQty,
    missingQty,
    quantity_lost: missingQty,
    unitValue,
    totalLoss,
    condition: "Missing",
    reportedDate: backendIncident.date ? new Date(backendIncident.date).toISOString().split("T")[0] : "Today",
    reportedBy,
    assignedTo,
    guestName: backendIncident.guestName || "N/A",
    reason: backendIncident.reason || "DAMAGE",
    notes: backendIncident.description || "",
    status: uiStatus,
    rawStatus: backendIncident.status || "REPORTED",
    resolutionType: backendIncident.resolution_type || null,
    resolutionNotes: backendIncident.resolution_notes || "",
    resolutionDate: backendIncident.resolution_date || null,
    timeline,
  };
};

export const adaptIncidentToBackend = (formData) => {
  if (!formData) return {};

  const itemId = formData.inventoryItemId || formData.item_id || formData.itemId;
  const quantityLost = Number(formData.missingQty || formData.quantity || formData.quantity_lost || 1);

  let reason = "DAMAGE";
  if (formData.reason) {
    const r = formData.reason.toUpperCase();
    if (["DAMAGE", "THEFT", "EXPIRED", "UNKNOWN"].includes(r)) {
      reason = r;
    } else if (r.includes("THEFT") || r.includes("STOLEN")) {
      reason = "THEFT";
    } else if (r.includes("EXPIRED")) {
      reason = "EXPIRED";
    }
  }

  const payload = {
    item_id: itemId,
    quantity_lost: quantityLost,
    reason,
    description: (formData.notes || formData.description || "").trim(),
  };

  if (formData.roomNumber && formData.roomNumber !== "N/A" && formData.roomNumber !== "-" && formData.roomNumber !== "—") {
    payload.room_number = formData.roomNumber;
  }
  if (formData.room_id) {
    payload.room_id = formData.room_id;
  }
  if (formData.unitValue !== undefined) {
    payload.unit_loss_value = Number(formData.unitValue);
  }
  if (formData.totalLoss !== undefined) {
    payload.total_loss_value = Number(formData.totalLoss);
  }

  return payload;
};

export const computeInventoryMetrics = (items = []) => {
  const totalCount = items.length;
  const totalQuantity = items.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const availableStock = items.filter((i) => i.status === "Available").length;
  const lowStock = items.filter((i) => i.status === "Low Stock").length;
  const missingItems = items.filter((i) => i.status === "Missing").length;
  const outOfStock = items.filter((i) => i.status === "Out of Stock").length;
  const totalValuation = items.reduce((acc, curr) => acc + (Number(curr.totalValue) || (Number(curr.quantity) * Number(curr.unitPrice)) || 0), 0);

  return {
    totalCount,
    totalQuantity,
    availableStock,
    lowStock,
    missingItems,
    outOfStock,
    totalValuation,
  };
};

export const computeIncidentMetrics = (incidents = []) => {
  const openIncidents = incidents.filter((i) => i.status === "Reported" || i.rawStatus === "REPORTED").length;
  const underInvestigation = incidents.filter((i) => i.status === "Under Investigation" || i.rawStatus === "INVESTIGATING").length;
  const recovered = incidents.filter((i) => i.status === "Recovered" || i.resolutionType === "RECOVERED").length;
  const replaced = incidents.filter((i) => i.status === "Replaced" || i.resolutionType === "REPLACED").length;
  const writtenOff = incidents.filter((i) => i.status === "Written Off" || i.resolutionType === "WRITTEN_OFF").length;
  const totalLoss = incidents
    .filter((i) => ["Reported", "Under Investigation", "Written Off"].includes(i.status) || ["REPORTED", "INVESTIGATING"].includes(i.rawStatus) || i.resolutionType === "WRITTEN_OFF")
    .reduce((acc, curr) => acc + (Number(curr.totalLoss) || 0), 0);

  return {
    total: incidents.length,
    openIncidents,
    underInvestigation,
    recovered,
    replaced,
    writtenOff,
    totalLoss,
  };
};
