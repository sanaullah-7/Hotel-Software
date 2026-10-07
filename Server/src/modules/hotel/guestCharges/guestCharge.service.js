import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { getOrCreateFolioForReservation } from "../folios/folio.service.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const generateInvoiceNumber = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `INV-${Date.now().toString().slice(-6)}${randHex}`;
};

const normalizeChargeType = (type) => {
  if (!type) return "MISCELLANEOUS";
  const upper = String(type).trim().toUpperCase().replace(/\s+/g, "_");
  const mapping = {
    CONSUMPTION: "CONSUMPTION",
    DAMAGE: "DAMAGE",
    MISSING_ITEM: "MISSING_ITEM",
    MINIBAR: "MINIBAR",
    ROOM_SERVICE: "ROOM_SERVICE",
    OTHER_SERVICE: "OTHER_SERVICE",
    LAUNDRY: "LAUNDRY",
    SPA: "SPA",
    RESTAURANT: "RESTAURANT",
    ROOM_RATE: "ROOM_RATE",
    TAX: "TAX",
    FEE: "FEE",
    PARKING: "PARKING",
    MISCELLANEOUS: "MISCELLANEOUS",
    EXTERNAL_ORDER: "MISCELLANEOUS",
  };
  return mapping[upper] || "MISCELLANEOUS";
};

export const createGuestCharge = async (hotelContext, chargeData) => {
  const Folio = await getModel(hotelContext, "Folio");
  const Reservation = await getModel(hotelContext, "Reservation");
  const Invoice = await getModel(hotelContext, "Invoice");
  const Room = await getModel(hotelContext, "Room");
  const GuestCharge = await getModel(hotelContext, "GuestCharge");

  const {
    folio_id,
    reservation_id,
    booking_id,
    guest_id,
    room_number,
    charge_type,
    item_name,
    quantity = 1,
    unit_price,
    description,
    amount,
    notes,
    date,
    reference_id,
  } = chargeData;

  let resolvedFolio = null;

  // 1. Direct folio_id
  if (folio_id) {
    if (!mongoose.Types.ObjectId.isValid(folio_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
    }
    resolvedFolio = await Folio.findOne({ _id: folio_id, hotelId: hotelContext });
    if (!resolvedFolio) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Folio not found in this hotel");
    }
  }

  // 2. Resolve via reservation_id / booking_id
  const targetReservationIdentifier = reservation_id || booking_id;
  if (!resolvedFolio && targetReservationIdentifier) {
    let reservation = null;
    if (mongoose.Types.ObjectId.isValid(targetReservationIdentifier)) {
      reservation = await Reservation.findOne({ _id: targetReservationIdentifier, hotelId: hotelContext });
    }
    if (!reservation) {
      reservation = await Reservation.findOne({
        hotelId: hotelContext,
        $or: [
          { booking_ref: String(targetReservationIdentifier).trim() },
          { _id: mongoose.Types.ObjectId.isValid(targetReservationIdentifier) ? targetReservationIdentifier : null },
        ],
      });
    }
    if (!reservation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Reservation "${targetReservationIdentifier}" not found`);
    }
    resolvedFolio = await getOrCreateFolioForReservation(hotelContext, reservation._id);
  }

  // 3. Resolve via room_number
  if (!resolvedFolio && room_number) {
    const room = await Room.findOne({ hotelId: hotelContext, room_number: String(room_number).trim() });
    if (room) {
      const activeReservation = await Reservation.findOne({
        hotelId: hotelContext,
        room_id: room._id,
        status: { $in: ["CHECKED_IN", "CONFIRMED", "Checked In"] },
      }).sort({ created_at: -1 });
      if (activeReservation) {
        resolvedFolio = await getOrCreateFolioForReservation(hotelContext, activeReservation._id);
      }
    }
  }

  // 4. Resolve via guest_id
  if (!resolvedFolio && guest_id) {
    if (mongoose.Types.ObjectId.isValid(guest_id)) {
      resolvedFolio = await Folio.findOne({ hotelId: hotelContext, guest_id, status: "OPEN" }).sort({ created_at: -1 });
    }
  }

  if (!resolvedFolio) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Could not resolve an active guest folio for this charge. Please provide a valid folio_id, reservation_id, or active room_number.");
  }

  if (reference_id && !mongoose.Types.ObjectId.isValid(reference_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reference ID format");
  }

  const numQuantity = Number(quantity) > 0 ? Number(quantity) : 1;
  const numUnitPrice = unit_price !== undefined && unit_price !== null ? Number(unit_price) : (amount !== undefined ? Number(amount) / numQuantity : 0);
  const calculatedAmount = amount !== undefined && amount !== null ? Number(amount) : numQuantity * numUnitPrice;
  const normalizedType = normalizeChargeType(charge_type);
  const finalDescription = description || (item_name ? `${item_name} (${normalizedType})` : `${normalizedType} Charge`);

  // Create GuestCharge
  const charge = await GuestCharge.create({
    hotelId: hotelContext,
    folio_id: resolvedFolio._id,
    guest_id: resolvedFolio.guest_id || null,
    reservation_id: resolvedFolio.reservation_id || null,
    charge_type: normalizedType,
    item_name: item_name || "",
    quantity: numQuantity,
    unit_price: numUnitPrice,
    description: finalDescription,
    amount: calculatedAmount,
    notes: notes || "",
    date: date || new Date(),
    is_voided: false,
    reference_id: reference_id || null,
  });

  // 5. Automatically post to Folio balance
  await Folio.findOneAndUpdate({ _id: resolvedFolio._id, hotelId: hotelContext }, { $inc: { balance: calculatedAmount } });

  // 6. Automatically attach to Folio's active Invoice (Billing line items)
  let activeInvoice = await Invoice.findOne({ hotelId: hotelContext, folio_id: resolvedFolio._id, status: "UNPAID" });
  if (activeInvoice) {
    activeInvoice.line_items.push({
      description: finalDescription,
      amount: calculatedAmount,
      tax_amount: 0,
    });
    activeInvoice.total_amount += calculatedAmount;
    await activeInvoice.save();
    charge.invoice_id = activeInvoice._id;
    await charge.save();
  } else {
    // Create new Invoice for this Folio charge
    const newInvoice = await Invoice.create({
      hotelId: hotelContext,
      invoice_number: generateInvoiceNumber(),
      folio_id: resolvedFolio._id,
      guest_id: resolvedFolio.guest_id,
      total_amount: calculatedAmount,
      tax_total: 0,
      amount_paid: 0,
      status: "UNPAID",
      line_items: [
        {
          description: finalDescription,
          amount: calculatedAmount,
          tax_amount: 0,
        },
      ],
    });
    charge.invoice_id = newInvoice._id;
    await charge.save();
  }

  return await GuestCharge.findOne({ _id: charge._id, hotelId: hotelContext });
};

export const getGuestCharges = async (hotelContext, query = {}) => {
  const GuestCharge = await getModel(hotelContext, "GuestCharge");
  const Folio = await getModel(hotelContext, "Folio");

  const filter = { hotelId: hotelContext };

  const folioId = asString(query.folio_id);
  if (folioId) {
    if (!mongoose.Types.ObjectId.isValid(folioId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
    }
    filter.folio_id = folioId;
  }

  const guestId = asString(query.guest_id);
  if (guestId) {
    if (!mongoose.Types.ObjectId.isValid(guestId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
    }
    const folios = await Folio.find({ hotelId: hotelContext, guest_id: guestId }).select("_id");
    const folioIds = folios.map((f) => f._id);
    filter.folio_id = { $in: folioIds };
  }

  const chargeType = asString(query.charge_type);
  if (chargeType && chargeType !== "All" && chargeType !== "All Types") {
    filter.charge_type = normalizeChargeType(chargeType);
  }

  if (query.is_voided !== undefined && query.is_voided !== null && query.is_voided !== "") {
    filter.is_voided = query.is_voided === "true" || query.is_voided === true;
  }

  // Text search query across description, item_name, notes
  const search = asString(query.search);
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { description: regex },
      { item_name: regex },
      { notes: regex },
    ];
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const charges = await GuestCharge.find(filter)
    .populate({
      path: "folio_id",
      select: "folio_ref balance status currency reservation_id guest_id",
      populate: [
        { path: "guest_id", select: "first_name last_name email phone" },
        { path: "reservation_id", select: "booking_ref status primary_guest_id" },
      ],
    })
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
    .populate("invoice_id", "invoice_number total_amount amount_paid status")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await GuestCharge.countDocuments(filter);

  return {
    charges,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getGuestChargeById = async (hotelContext, chargeId) => {
  if (!mongoose.Types.ObjectId.isValid(chargeId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Charge ID format");
  }

  const GuestCharge = await getModel(hotelContext, "GuestCharge");
  const charge = await GuestCharge.findOne({ _id: chargeId, hotelId: hotelContext })
    .populate({
      path: "folio_id",
      select: "folio_ref balance status currency reservation_id guest_id",
      populate: [
        { path: "guest_id", select: "first_name last_name email phone" },
        { path: "reservation_id", select: "booking_ref status primary_guest_id" },
      ],
    })
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
    .populate("invoice_id", "invoice_number total_amount amount_paid status");

  if (!charge) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest charge not found");
  }

  return charge;
};

export const voidGuestCharge = async (hotelContext, chargeId) => {
  if (!mongoose.Types.ObjectId.isValid(chargeId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Charge ID format");
  }

  const GuestCharge = await getModel(hotelContext, "GuestCharge");
  const Folio = await getModel(hotelContext, "Folio");
  const Invoice = await getModel(hotelContext, "Invoice");

  const charge = await GuestCharge.findOne({ _id: chargeId, hotelId: hotelContext });

  if (!charge) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest charge not found");
  }

  if (charge.is_voided) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Charge is already voided");
  }

  charge.is_voided = true;
  await charge.save();

  // Decrement Folio balance
  if (charge.folio_id) {
    await Folio.findOneAndUpdate({ _id: charge.folio_id, hotelId: hotelContext }, { $inc: { balance: -charge.amount } });
  }

  // Adjust linked invoice if exists
  if (charge.invoice_id) {
    const invoice = await Invoice.findOne({ _id: charge.invoice_id, hotelId: hotelContext });
    if (invoice) {
      invoice.total_amount = Math.max(0, invoice.total_amount - charge.amount);
      await invoice.save();
    }
  }

  return charge;
};
