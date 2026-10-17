/**
 * Guest Charge Adapter
 * Maps between backend GuestCharge schema and frontend Guest Charges UI components.
 */

export const formatChargeType = (rawType) => {
  if (!rawType) return "Miscellaneous";
  const type = String(rawType).toUpperCase().replace(/\s+/g, "_");
  const map = {
    CONSUMPTION: "Consumption",
    DAMAGE: "Damage",
    MISSING_ITEM: "Damage",
    MINIBAR: "Minibar",
    ROOM_SERVICE: "Room Service",
    OTHER_SERVICE: "Other Service",
    LAUNDRY: "Laundry",
    SPA: "Spa",
    RESTAURANT: "Restaurant",
    ROOM_RATE: "Room Rate",
    TAX: "Tax",
    FEE: "Fee",
    PARKING: "Parking",
    MISCELLANEOUS: "Miscellaneous",
  };
  return map[type] || rawType;
};

export const adaptGuestChargeToUI = (backendCharge) => {
  if (!backendCharge) return null;

  const id = backendCharge._id || backendCharge.id;
  
  // Resolve Guest Name
  let guestName = "Guest";
  if (backendCharge.guest_id) {
    if (typeof backendCharge.guest_id === "object") {
      const first = backendCharge.guest_id.first_name || "";
      const last = backendCharge.guest_id.last_name || "";
      const combined = `${first} ${last}`.trim();
      if (combined) guestName = combined;
    } else if (typeof backendCharge.guest_id === "string") {
      guestName = backendCharge.guest_id;
    }
  } else if (backendCharge.folio_id?.guest_id) {
    const first = backendCharge.folio_id.guest_id.first_name || "";
    const last = backendCharge.folio_id.guest_id.last_name || "";
    const combined = `${first} ${last}`.trim();
    if (combined) guestName = combined;
  } else if (backendCharge.guestName) {
    guestName = backendCharge.guestName;
  }

  // Resolve Room Number
  let roomNumber = "—";
  if (backendCharge.reservation_id?.room_id?.room_number) {
    roomNumber = String(backendCharge.reservation_id.room_id.room_number);
  } else if (backendCharge.folio_id?.reservation_id?.room_id?.room_number) {
    roomNumber = String(backendCharge.folio_id.reservation_id.room_id.room_number);
  } else if (backendCharge.roomNumber) {
    roomNumber = String(backendCharge.roomNumber);
  }

  // Resolve Folio Ref
  let folioId = "—";
  if (backendCharge.folio_id?.folio_ref) {
    folioId = backendCharge.folio_id.folio_ref;
  } else if (typeof backendCharge.folio_id === "string") {
    folioId = backendCharge.folio_id;
  } else if (backendCharge.folioId) {
    folioId = backendCharge.folioId;
  }

  // Resolve Status
  let status = "Added to Folio";
  if (backendCharge.is_voided) {
    status = "Voided";
  } else if (backendCharge.invoice_id?.status === "PAID") {
    status = "Paid";
  } else if (backendCharge.status) {
    status = backendCharge.status;
  }

  const quantity = Number(backendCharge.quantity) || 1;
  const unitPrice = Number(backendCharge.unit_price) || (Number(backendCharge.amount) || 0) / quantity;
  const amount = Number(backendCharge.amount) || quantity * unitPrice;
  const itemName = backendCharge.item_name || backendCharge.itemName || backendCharge.description || "Room Item";
  const chargeType = formatChargeType(backendCharge.charge_type || backendCharge.chargeType);

  const dateObj = backendCharge.date || backendCharge.created_at ? new Date(backendCharge.date || backendCharge.created_at) : new Date();
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    id,
    _id: id,
    guestName,
    roomNumber,
    folioId,
    folio_id: typeof backendCharge.folio_id === "object" ? backendCharge.folio_id?._id : backendCharge.folio_id,
    chargeType,
    rawChargeType: backendCharge.charge_type,
    itemName,
    description: backendCharge.description || itemName,
    quantity,
    unitPrice,
    amount,
    status,
    isVoided: Boolean(backendCharge.is_voided),
    date: formattedDate,
    rawDate: dateObj.toISOString(),
    notes: backendCharge.notes || "",
    invoiceNumber: backendCharge.invoice_id?.invoice_number || "",
    invoiceId: backendCharge.invoice_id?._id || backendCharge.invoice_id || null,
    guestEmail: backendCharge.guest_id?.email || backendCharge.folio_id?.guest_id?.email || "",
    guestPhone: backendCharge.guest_id?.phone || backendCharge.folio_id?.guest_id?.phone || "",
    bookingRef: backendCharge.reservation_id?.booking_ref || backendCharge.folio_id?.reservation_id?.booking_ref || "",
  };
};

export const computeGuestChargeMetrics = (charges = []) => {
  const activeCharges = charges.filter((c) => !c.isVoided && c.status !== "Voided");
  const totalAmount = activeCharges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const consumptionTotal = activeCharges
    .filter((c) => c.chargeType === "Consumption" || c.chargeType === "Minibar")
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const damageTotal = activeCharges
    .filter((c) => c.chargeType === "Damage")
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const voidedCount = charges.filter((c) => c.isVoided || c.status === "Voided").length;

  return {
    totalCharges: charges.length,
    activeCharges: activeCharges.length,
    totalAmount,
    consumptionTotal,
    damageTotal,
    voidedCount,
  };
};
