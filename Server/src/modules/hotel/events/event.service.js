import mongoose from "mongoose";
import crypto from "crypto";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, escapeRegex, parsePagination } from "../../../utils/query.js";

const generateEventRef = () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let rand = "";
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVT${rand}`;
};

const generateBeoRef = async (BeoModel) => {
  const count = await BeoModel.countDocuments();
  return `BEO-${400 + count + 1}`;
};

const DEFAULT_EVENTS_SEED = [
  {
    event_ref: "EVT31232CFL",
    name: "Johnson Wedding",
    event_type: "Wedding",
    client_name: "Sarah Johnson",
    contact_phone: "+1 (555) 234-5678",
    contact_email: "sarah.j@example.com",
    start_date: new Date("2026-10-15T16:00:00Z"),
    end_date: new Date("2026-10-15T23:00:00Z"),
    start_time: "16:00",
    end_time: "23:00",
    venue: "Grand Ballroom",
    expected_attendees: 150,
    total_amount: 15000,
    total_budget: 15000,
    advance_amount: 8000,
    balance_amount: 7000,
    catering: "Plated Dinner",
    status: "Confirmed",
    special_requests: "Pastel floral table centrepieces and white carpet aisle.",
    notes: "Bride requested Grand Piano entrance accompaniment.",
  },
  {
    event_ref: "EVT3123I1K2",
    name: "Tech Conference 2026",
    event_type: "Conference",
    client_name: "TechCorp Ltd",
    contact_phone: "+1 (555) 876-5432",
    contact_email: "events@techcorp.io",
    start_date: new Date("2026-10-20T09:00:00Z"),
    end_date: new Date("2026-10-20T18:00:00Z"),
    start_time: "09:00",
    end_time: "18:00",
    venue: "Conference Hall A",
    expected_attendees: 200,
    total_amount: 25000,
    total_budget: 25000,
    advance_amount: 15000,
    balance_amount: 10000,
    catering: "Buffet",
    status: "Confirmed",
    special_requests: "High-speed dedicated Wi-Fi access and live webcast rig.",
    notes: "Dual 4K laser projectors and 8 wireless lapel mics.",
  },
  {
    event_ref: "EVT31230X5B",
    name: "Birthday Celebration",
    event_type: "Birthday Party",
    client_name: "Mike Wilson",
    contact_phone: "+1 (555) 345-6789",
    contact_email: "mike.wilson@email.com",
    start_date: new Date("2026-10-25T19:00:00Z"),
    end_date: new Date("2026-10-26T00:00:00Z"),
    start_time: "19:00",
    end_time: "00:00",
    venue: "Rooftop Terrace",
    expected_attendees: 50,
    total_amount: 8000,
    total_budget: 8000,
    advance_amount: 4000,
    balance_amount: 4000,
    catering: "Cocktail & Canapés",
    status: "Pending",
    special_requests: "Custom Belgian chocolate fountain and DJ booth setup.",
    notes: "Outdoor fire pits and heated lamps on patio.",
  },
  {
    event_ref: "EVT3123D2FW",
    name: "Anderson Anniversary",
    event_type: "Anniversary",
    client_name: "Laura Anderson",
    contact_phone: "+1 (555) 456-7890",
    contact_email: "laura.a@andersonlaw.com",
    start_date: new Date("2026-11-10T18:30:00Z"),
    end_date: new Date("2026-11-10T22:30:00Z"),
    start_time: "18:30",
    end_time: "22:30",
    venue: "Garden Lounge",
    expected_attendees: 80,
    total_amount: 12000,
    total_budget: 12000,
    advance_amount: 12000,
    balance_amount: 0,
    catering: "Plated Dinner",
    status: "Confirmed",
    special_requests: "Silver theme decorations for 25th wedding anniversary.",
    notes: "String quartet booked for arrival reception.",
  },
  {
    event_ref: "EVT3123YHOW",
    name: "Startup Pitch Night",
    event_type: "Corporate",
    client_name: "InnovateX",
    contact_phone: "+1 (555) 567-8901",
    contact_email: "pitch@innovatex.co",
    start_date: new Date("2026-11-15T17:00:00Z"),
    end_date: new Date("2026-11-15T21:30:00Z"),
    start_time: "17:00",
    end_time: "21:30",
    venue: "Conference Hall B",
    expected_attendees: 120,
    total_amount: 10000,
    total_budget: 10000,
    advance_amount: 5000,
    balance_amount: 5000,
    catering: "Coffee & Snacks",
    status: "Pending",
    special_requests: "Pitch podium with countdown timer display.",
    notes: "6 demo table stations with power strips.",
  },
];

const DEFAULT_BEOS_SEED = [
  {
    beo_ref: "BEO-401",
    title: "Vance & Sterling Royal Wedding Gala",
    client: "Baroness Evelyn Vance • Vance Family Trust",
    venue: "Grand Crystal Ballroom",
    status: "Confirmed & Deposit Paid",
    status_type: "confirmed",
    schedule: "Oct 28, 2026 (18:00 – 23:30)",
    attendance: "320 Guests (Round Table Banquet (10-top))",
    catering: "6-Course Michelin Gala Dinner & Vintage Champagne Toast",
    total_price: "$68,500",
    deposit_paid: "$35,000",
    av_setup: "Full Line Array Audio, 4K LED Backdrop & Stage Spotlight",
    coordinator: "Marcella Dubois (Senior Event Director)",
  },
  {
    beo_ref: "BEO-402",
    title: "Global Private Wealth & Tech Summit 2026",
    client: "Julian Thorne • Thorne Capital Partners",
    venue: "Grand Crystal Ballroom",
    status: "BEO In Preparation",
    status_type: "in-prep",
    schedule: "Nov 04, 2026 (08:30 – 17:00)",
    attendance: "380 Guests (Theater Keynote & Stage)",
    catering: "Executive All-Day Coffee Bar & Gourmet Buffet Luncheon",
    total_price: "$42,000",
    deposit_paid: "$20,000",
    av_setup: "Dual Projectors, Live Webcast Rig & 8 Wireless Lapel Mics",
    coordinator: "Jonathan Sterling (Conference Lead)",
  },
  {
    beo_ref: "BEO-403",
    title: "Haute Horlogerie Luxury Watch Showcase",
    client: "Genevieve Moreau • Vacheron & Patek Guild",
    venue: "Skyline Rooftop Pavilion",
    status: "In-Progress Live Event",
    status_type: "in-progress",
    schedule: "Today (19:00 – 23:00)",
    attendance: "140 Guests (Cocktail Reception Standing)",
    catering: "Beluga Caviar Tasting, Truffle Canapés & Sommelier Wine Pairing",
    total_price: "$29,800",
    deposit_paid: "$29,800",
    av_setup: "Ambient DJ Sound System & Museum-Grade Vitrine Lighting",
    coordinator: "Elena Rostova (VIP Hospitality)",
  },
  {
    beo_ref: "BEO-404",
    title: "Diplomatic Corps Autumn Ambassadorial Dinner",
    client: "Ambassador Henri Zhao • Consular Diplomatic Mission",
    venue: "Royal Executive Boardroom",
    status: "Confirmed & Deposit Paid",
    status_type: "confirmed",
    schedule: "Oct 30, 2026 (19:30 – 22:30)",
    attendance: "28 Guests (U-Shape Executive)",
    catering: "Private Chef 5-Course State Banquet with Wine Pairing",
    total_price: "$12,400",
    deposit_paid: "$12,400",
    av_setup: "Encrypted Video Teleconference & Interpretation Booths",
    coordinator: "Marcella Dubois (Senior Event Director)",
  },
  {
    beo_ref: "BEO-405",
    title: "Luminis Biotech European Board Meeting",
    client: "Dr. Aris Thorne • Luminis Therapeutics",
    venue: "Botanical Garden Terrace",
    status: "BEO In Preparation",
    status_type: "in-prep",
    schedule: "Nov 12, 2026 (11:00 – 16:00)",
    attendance: "160 Guests (Classroom & Workshop)",
    catering: "Farm-to-Table Organic Garden Lunch & Artisan Gelato Bar",
    total_price: "$24,800",
    deposit_paid: "$10,000",
    av_setup: "High-Brightness Laser Displays & Polycom Hybrid Audio",
    coordinator: "Jonathan Sterling (Conference Lead)",
  },
];

export const ensureDefaultEvents = async (tenantConn) => {
  const Event = await getModel(tenantConn, "Event");
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.insertMany(DEFAULT_EVENTS_SEED, { ordered: false });
  }
};

export const ensureDefaultBeos = async (tenantConn) => {
  const BEO = await getModel(tenantConn, "BEO");
  const count = await BEO.countDocuments();
  if (count === 0) {
    await BEO.insertMany(DEFAULT_BEOS_SEED, { ordered: false });
  }
};

// =============================================================================
// EVENTS
// =============================================================================

export const getEvents = async (tenantConn, query = {}) => {
  const Event = await getModel(tenantConn, "Event");

  const filter = {};


  const search = asString(query.search);
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { event_ref: rx },
      { name: rx },
      { client_name: rx },
      { venue: rx },
      { event_type: rx },
      { status: rx },
    ];
  }

  const type = asString(query.type || query.event_type);
  if (type && type !== "All") {
    filter.event_type = type;
  }

  const venue = asString(query.venue);
  if (venue && venue !== "All") {
    filter.venue = venue;
  }

  const status = asString(query.status);
  if (status && status !== "All") {
    filter.status = new RegExp(`^${escapeRegex(status)}$`, "i");
  }

  const total = await Event.countDocuments(filter);
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50, maxLimit: 200 });

  const events = await Event.find(filter)
    .sort({ start_date: -1, created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getEventById = async (tenantConn, id) => {
  const Event = await getModel(tenantConn, "Event");

  const query = mongoose.Types.ObjectId.isValid(id)

    ? { $or: [{ _id: id }, { event_ref: id }] }
    : { event_ref: id };

  const event = await Event.findOne(query).lean();
  if (!event) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, `Event with identifier '${id}' not found`);
  }
  return event;
};

export const createEvent = async (tenantConn, data) => {
  const Event = await getModel(tenantConn, "Event");

  const eventRef = data.event_ref || data.id || generateEventRef();

  const existing = await Event.findOne({ event_ref: eventRef });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Event reference '${eventRef}' already exists`);
  }

  const clientName = (data.client_name || data.client || "").trim();
  if (!clientName) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Client name is required");
  }

  const name = (data.name || "").trim();
  if (!name) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Event name is required");
  }

  // Parse dates safely
  let startDate = data.start_date || data.date;
  if (!startDate) {
    startDate = new Date();
  } else {
    startDate = new Date(startDate);
  }

  let endDate = data.end_date;
  if (!endDate) {
    endDate = new Date(startDate.getTime() + 6 * 60 * 60 * 1000); // +6 hours default
  } else {
    endDate = new Date(endDate);
  }

  const totalAmount = Number(data.total_amount ?? data.amount ?? data.total_budget ?? 0);
  const advanceAmount = Number(data.advance_amount ?? data.advanceAmount ?? 0);

  if (advanceAmount > totalAmount) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Advance amount cannot exceed total amount");
  }

  const balanceAmount = Math.max(0, totalAmount - advanceAmount);


  const newDoc = {
    event_ref: eventRef,
    name,
    client_name: clientName,
    contact_email: (data.contact_email || data.email || "").trim(),
    contact_phone: (data.contact_phone || data.phone || "").trim(),
    start_date: startDate,
    end_date: endDate,
    start_time: data.start_time || data.startTime || "12:00",
    end_time: data.end_time || data.endTime || "18:00",
    expected_attendees: Number(data.expected_attendees ?? data.guests ?? 100),
    event_type: data.event_type || data.type || "Wedding",
    venue: data.venue || "Grand Ballroom",
    catering: data.catering || "Buffet",
    status: data.status || "Confirmed",
    total_amount: totalAmount,
    total_budget: totalAmount,
    advance_amount: advanceAmount,
    balance_amount: balanceAmount,
    special_requests: data.special_requests || data.specialRequests || "",
    notes: data.notes || "",
    payments: advanceAmount > 0 ? [
      {
        amount: advanceAmount,
        payment_method: data.payment_method || data.paymentMethod || "Advance Deposit",
        date: new Date(),
        notes: data.notes || "Initial booking advance deposit"
      }
    ] : []
  };

  const created = await Event.create(newDoc);
  return created.toObject();
};

export const updateEvent = async (tenantConn, id, data) => {
  const Event = await getModel(tenantConn, "Event");

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { event_ref: id }] }
    : { event_ref: id };

  const event = await Event.findOne(query);
  if (!event) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, `Event with identifier '${id}' not found`);
  }

  if (data.name !== undefined) event.name = data.name.trim();
  if (data.client_name !== undefined || data.client !== undefined) {
    event.client_name = (data.client_name || data.client).trim();
  }
  if (data.contact_email !== undefined || data.email !== undefined) {
    event.contact_email = (data.contact_email || data.email || "").trim();
  }
  if (data.contact_phone !== undefined || data.phone !== undefined) {
    event.contact_phone = (data.contact_phone || data.phone || "").trim();
  }
  if (data.start_date !== undefined || data.date !== undefined) {
    event.start_date = new Date(data.start_date || data.date);
  }
  if (data.end_date !== undefined) {
    event.end_date = new Date(data.end_date);
  }
  if (data.start_time !== undefined || data.startTime !== undefined) {
    event.start_time = data.start_time || data.startTime;
  }
  if (data.end_time !== undefined || data.endTime !== undefined) {
    event.end_time = data.end_time || data.endTime;
  }
  if (data.expected_attendees !== undefined || data.guests !== undefined) {
    event.expected_attendees = Number(data.expected_attendees ?? data.guests);
  }
  if (data.event_type !== undefined || data.type !== undefined) {
    event.event_type = data.event_type || data.type;
  }
  if (data.venue !== undefined) event.venue = data.venue;
  if (data.catering !== undefined) event.catering = data.catering;
  if (data.status !== undefined) event.status = data.status;

  if (data.total_amount !== undefined || data.amount !== undefined) {
    const total = Number(data.total_amount ?? data.amount);
    event.total_amount = total;
    event.total_budget = total;
  }
  if (data.advance_amount !== undefined || data.advanceAmount !== undefined) {
    const newAdvance = Number(data.advance_amount ?? data.advanceAmount);
    const oldAdvance = Number(event.advance_amount || 0);
    const delta = newAdvance - oldAdvance;
    event.advance_amount = newAdvance;

    if (delta > 0) {
      if (!Array.isArray(event.payments)) event.payments = [];
      event.payments.push({
        amount: delta,
        payment_method: data.payment_method || data.paymentMethod || "Cash",
        date: new Date(),
        notes: data.notes || `Collected payment of $${delta}`
      });
    }
  }

  if (event.advance_amount > event.total_amount) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Advance amount cannot exceed total amount");
  }

  event.balance_amount = Math.max(0, event.total_amount - event.advance_amount);

  if (data.special_requests !== undefined || data.specialRequests !== undefined) {
    event.special_requests = data.special_requests || data.specialRequests;
  }
  if (data.notes !== undefined) event.notes = data.notes;

  await event.save();
  return event.toObject();
};

export const deleteEvent = async (tenantConn, id) => {
  const Event = await getModel(tenantConn, "Event");

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { event_ref: id }] }
    : { event_ref: id };

  const deleted = await Event.findOneAndDelete(query);
  if (!deleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, `Event with identifier '${id}' not found`);
  }
  return { message: "Event deleted successfully", id: deleted._id, event_ref: deleted.event_ref };
};

export const bulkDeleteEvents = async (tenantConn, ids = []) => {
  const Event = await getModel(tenantConn, "Event");
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "An array of IDs is required for bulk delete");
  }

  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const refs = ids.filter((id) => typeof id === "string" && !mongoose.Types.ObjectId.isValid(id));

  const filter = {
    $or: [
      { _id: { $in: objectIds } },
      { event_ref: { $in: refs.concat(ids) } },
    ],
  };

  const result = await Event.deleteMany(filter);
  return { message: "Events deleted successfully", deletedCount: result.deletedCount };
};

export const getEventMetrics = async (tenantConn) => {
  const Event = await getModel(tenantConn, "Event");

  const all = await Event.find().lean();

  const total = all.length;
  const confirmed = all.filter((e) => /confirmed/i.test(e.status)).length;
  const pending = all.filter((e) => /pending|proposal/i.test(e.status)).length;
  const inProgress = all.filter((e) => /in-progress|in_progress|in progress/i.test(e.status)).length;

  const totalRevenue = all.reduce((sum, e) => sum + (e.total_amount || e.total_budget || 0), 0);
  const balanceDue = all.reduce((sum, e) => sum + (e.balance_amount || 0), 0);

  return {
    total,
    confirmed,
    pending,
    inProgress,
    totalRevenue,
    balanceDue,
  };
};

// =============================================================================
// BEOs (BANQUET MANAGER)
// =============================================================================

export const getBeos = async (tenantConn, query = {}) => {
  const BEO = await getModel(tenantConn, "BEO");

  const filter = {};


  const search = asString(query.search);
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { beo_ref: rx },
      { title: rx },
      { client: rx },
      { venue: rx },
      { status: rx },
    ];
  }

  const venue = asString(query.venue);
  if (venue && venue !== "all") {
    // If slug provided (e.g. 'grand-crystal'), or exact venue name
    const venueMap = {
      "grand-crystal": "Grand Crystal Ballroom",
      "skyline-rooftop": "Skyline Rooftop Pavilion",
      "royal-executive": "Royal Executive Boardroom",
      "botanical-garden": "Botanical Garden Terrace",
    };
    const targetVenue = venueMap[venue] || venue;
    filter.venue = new RegExp(escapeRegex(targetVenue), "i");
  }

  const status = asString(query.status);
  if (status && status !== "All Statuses" && status !== "All") {
    filter.status = new RegExp(escapeRegex(status), "i");
  }

  const beos = await BEO.find(filter).sort({ created_at: -1 }).lean();
  return beos;
};

export const getBeoById = async (tenantConn, id) => {
  const BEO = await getModel(tenantConn, "BEO");

  const query = mongoose.Types.ObjectId.isValid(id)

    ? { $or: [{ _id: id }, { beo_ref: id }] }
    : { beo_ref: id };

  const beo = await BEO.findOne(query).lean();
  if (!beo) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, `BEO with identifier '${id}' not found`);
  }
  return beo;
};

export const createBeo = async (tenantConn, data) => {
  const BEO = await getModel(tenantConn, "BEO");

  const beoRef = data.beo_ref || data.id || (await generateBeoRef(BEO));

  const existing = await BEO.findOne({ beo_ref: beoRef });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `BEO reference '${beoRef}' already exists`);
  }

  const title = (data.title || "").trim();
  const client = (data.client || "").trim();
  if (!title || !client) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Title and Client are required for BEO");
  }

  const totalPrice = typeof data.totalPrice === "number"
    ? `$${data.totalPrice.toLocaleString()}`
    : (data.totalPrice || data.total_price || "$0");

  const depositPaid = typeof data.depositPaid === "number"
    ? `$${data.depositPaid.toLocaleString()}`
    : (data.depositPaid || data.deposit_paid || "$0");

  const status = data.status || "Confirmed & Deposit Paid";
  const statusType = data.statusType || data.status_type || (status.includes("Confirmed") ? "confirmed" : "in-prep");

  let linkedEventId = undefined;
  if (data.event_id) {
    const Event = await getModel(tenantConn, "Event");
    const eventQuery = mongoose.Types.ObjectId.isValid(data.event_id)
      ? { $or: [{ _id: data.event_id }, { event_ref: data.event_id }] }
      : { event_ref: data.event_id };
    const linkedEvent = await Event.findOne(eventQuery);
    if (!linkedEvent) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Referenced event '${data.event_id}' does not exist in this hotel`);
    }
    linkedEventId = linkedEvent._id;
  }

  const newDoc = {
    beo_ref: beoRef,
    event_id: linkedEventId,
    title,
    client,
    venue: data.venue || "Grand Crystal Ballroom",
    status,
    status_type: statusType,
    schedule: data.schedule || "Upcoming Scheduled Date",
    attendance: data.attendance || "100 Guests (Standard Banquet)",
    catering: data.catering || "Chef Tasting Menu & Beverage Package",
    total_price: totalPrice,
    deposit_paid: depositPaid,
    av_setup: data.avSetup || data.av_setup || "Standard Stage, Podium Mic & Ambient Lighting",
    coordinator: data.coordinator || "Marcella Dubois (Senior Event Director)",
    setup_requirements: data.setup_requirements || "Standard banquet layout",
  };


  const created = await BEO.create(newDoc);
  return created.toObject();
};

export const updateBeo = async (tenantConn, id, data) => {
  const BEO = await getModel(tenantConn, "BEO");

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { beo_ref: id }] }
    : { beo_ref: id };

  const beo = await BEO.findOne(query);
  if (!beo) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, `BEO with identifier '${id}' not found`);
  }

  if (data.event_id !== undefined) {
    if (data.event_id) {
      const Event = await getModel(tenantConn, "Event");
      const eventQuery = mongoose.Types.ObjectId.isValid(data.event_id)
        ? { $or: [{ _id: data.event_id }, { event_ref: data.event_id }] }
        : { event_ref: data.event_id };
      const linkedEvent = await Event.findOne(eventQuery);
      if (!linkedEvent) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, `Referenced event '${data.event_id}' does not exist in this hotel`);
      }
      beo.event_id = linkedEvent._id;
    } else {
      beo.event_id = undefined;
    }
  }

  if (data.title !== undefined) beo.title = data.title.trim();

  if (data.client !== undefined) beo.client = data.client.trim();
  if (data.venue !== undefined) beo.venue = data.venue;
  if (data.status !== undefined) beo.status = data.status;
  if (data.statusType !== undefined || data.status_type !== undefined) {
    beo.status_type = data.statusType || data.status_type;
  }
  if (data.schedule !== undefined) beo.schedule = data.schedule;
  if (data.attendance !== undefined) beo.attendance = data.attendance;
  if (data.catering !== undefined) beo.catering = data.catering;
  if (data.totalPrice !== undefined || data.total_price !== undefined) {
    beo.total_price = data.totalPrice || data.total_price;
  }
  if (data.depositPaid !== undefined || data.deposit_paid !== undefined) {
    beo.deposit_paid = data.depositPaid || data.deposit_paid;
  }
  if (data.avSetup !== undefined || data.av_setup !== undefined) {
    beo.av_setup = data.avSetup || data.av_setup;
  }
  if (data.coordinator !== undefined) beo.coordinator = data.coordinator;
  if (data.setup_requirements !== undefined) beo.setup_requirements = data.setup_requirements;

  await beo.save();
  return beo.toObject();
};

export const deleteBeo = async (tenantConn, id) => {
  const BEO = await getModel(tenantConn, "BEO");

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { beo_ref: id }] }
    : { beo_ref: id };

  const deleted = await BEO.findOneAndDelete(query);
  if (!deleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, `BEO with identifier '${id}' not found`);
  }
  return { message: "BEO deleted successfully", id: deleted._id, beo_ref: deleted.beo_ref };
};

export const getBeoMetrics = async (tenantConn) => {
  const BEO = await getModel(tenantConn, "BEO");

  const beos = await BEO.find().lean();

  const totalBeos = beos.length;
  const venuesSet = new Set(beos.map((b) => b.venue).filter(Boolean));
  const activeVenues = venuesSet.size;

  const parseCurrency = (val) => {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]+/g, "");
    return parseFloat(cleaned) || 0;
  };

  const totalValue = beos.reduce((sum, b) => sum + parseCurrency(b.total_price), 0);
  const totalDeposits = beos.reduce((sum, b) => sum + parseCurrency(b.deposit_paid), 0);

  return {
    totalBeos,
    activeVenues,
    totalValue,
    totalDeposits,
  };
};
