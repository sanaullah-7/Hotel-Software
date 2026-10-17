import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";

/**
 * Detects whether the query is in Roman Urdu or English.
 */
const detectRomanUrdu = (text) => {
  const romanUrduPattern =
    /\b(kya|kitne|kitni|kitna|hai|hain|batao|dikhao|chahiye|kamra|kamray|kamro|kamron|mehmaan|mehman|safai|khana|qeemat|madad|kaise|kaisa|aaj|abhi|karo|karna|maujood|paisa|paise|kharcha|kharchay|kamai|aamdan|mulazim|chutti|chhutti|gaari|gari|sunao|haal|ahwaal|sakty|sakte)\b/i;
  return romanUrduPattern.test(text);
};

const isAvailableRoom = (r) => {
  const s = String(r.status || "").toUpperCase();
  return s === "AVAILABLE" || s === "OPEN";
};

const isOccupiedRoom = (r) => {
  const s = String(r.status || "").toUpperCase();
  return s === "OCCUPIED" || s === "BOOKED";
};

const isMaintenanceRoom = (r) => {
  const s = String(r.status || "").toUpperCase();
  return s === "MAINTENANCE" || s === "OUT_OF_ORDER" || s === "INACTIVE" || s === "CLEANING";
};

const formatRoomStatus = (s) => {
  const up = String(s || "").toUpperCase();
  if (up === "AVAILABLE" || up === "OPEN") return "Available";
  if (up === "OCCUPIED" || up === "BOOKED") return "Occupied";
  if (up === "MAINTENANCE") return "Maintenance";
  if (up === "OUT_OF_ORDER") return "Out of Order";
  if (up === "CLEANING") return "Cleaning";
  return s || "Available";
};

/**
 * Checks if the message is a greeting or pleasantry.
 */
const isGreeting = (text) => {
  return /^\s*(hi|hello|hey|salam|assalam|assalamu\s*alaikum|adaab|good\s*morning|good\s*afternoon|good\s*evening|hola)\b/i.test(
    text
  );
};

/**
 * Checks if the message is asking for help or system capabilities.
 */
const isHelpQuery = (text) => {
  return /\b(help|assist|capabilities|what\s+can\s+you\s+do|menu\s+options|features|madad|kya\s+kar\s+sakte)\b/i.test(
    text
  );
};

/**
 * Calculates Levenshtein Distance between two strings.
 */
const levenshteinDistance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], prev, row[j]) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
};

/**
 * Normalizes and tokenizes message into searchable words.
 */
const tokenizeMessage = (text) => {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);
};

/**
 * Checks if a single word fuzzy-matches a target keyword.
 * Designed to handle common human typos (e.g. "expensee", "resevation")
 * while strictly rejecting unrelated vocabulary (e.g. "cricket" vs "ticket").
 */
const isFuzzyWordMatch = (word, target) => {
  if (word === target) return true;

  const w = word.toLowerCase();
  const t = target.toLowerCase();
  if (w === t) return true;

  // Stems & plurals (e.g. report/reports, room/rooms, booking/bookings)
  if (w.startsWith(t) && w.length <= t.length + 2) return true;
  if (t.startsWith(w) && t.length <= w.length + 2) return true;

  const maxLen = Math.max(w.length, t.length);
  const minLen = Math.min(w.length, t.length);

  // Short words (3 or fewer chars): require exact match to prevent noisy false positives
  if (minLen <= 3) return false;

  // Real-world human typos almost universally preserve the first letter of domain terms.
  // If first characters differ, require exact edit distance of at most 1 on words of length >= 5.
  const dist = levenshteinDistance(w, t);
  if (w[0] !== t[0]) {
    return dist <= 1 && minLen >= 5;
  }

  // Same starting character:
  // For words of length 4-6: allow at most 1 edit
  // For longer words (7+ chars): allow at most 2 edits (e.g. "resturant" vs "restaurant")
  const maxDistance = maxLen >= 7 ? 2 : 1;
  return dist <= maxDistance;
};

/**
 * Comprehensive domain dictionary covering hotel departments and Roman Urdu terms.
 */
const DOMAIN_KEYWORDS = {
  rooms: [
    "room", "rooms", "kamra", "kamray", "kamro", "kamron", "suite", "suites",
    "bed", "beds", "occupancy", "vacant", "available", "occupied", "single",
    "double", "deluxe", "presidential"
  ],
  reservations: [
    "reservation", "reservations", "booking", "bookings", "book", "checkin",
    "check-in", "checkout", "check-out", "arrival", "arrivals", "departure", "departures"
  ],
  financials: [
    "revenue", "income", "earn", "earnings", "finance", "financial", "money",
    "paisa", "paise", "aamdan", "profit", "bill", "billing", "invoice",
    "invoices", "payment", "payments", "revpar", "adr", "expense", "expenses",
    "cost", "costs", "spending", "spend", "kharcha", "kharchay", "report", "reports"
  ],
  housekeeping: [
    "housekeep", "housekeeping", "clean", "cleaning", "dirty", "safai",
    "inspection", "checklist", "task", "tasks", "laundry", "linen",
    "maintenance", "ticket", "tickets", "repair", "repairs", "broken", "defect", "damage"
  ],
  staff: [
    "staff", "employee", "employees", "hr", "attendance", "leave", "leaves",
    "salary", "payroll", "mulazim", "chutti", "worker", "workers"
  ],
  inventory: [
    "inventory", "stock", "item", "items", "supply", "supplies", "asset",
    "assets", "reorder", "goods"
  ],
  restaurant: [
    "restaurant", "menu", "food", "dish", "dishes", "order", "orders",
    "pos", "dining", "khana", "kitchen"
  ],
  events: [
    "event", "events", "banquet", "banquets", "hall", "halls", "beo",
    "function", "meeting", "meetings", "conference", "party"
  ],
  parking: [
    "parking", "car", "cars", "vehicle", "vehicles", "slot", "slots",
    "space", "spaces", "gaari", "gari"
  ],
  guests: [
    "guest", "guests", "mehmaan", "mehman", "customer", "customers",
    "vip", "profile", "profiles"
  ],
  overview: [
    "summary", "overview", "briefing", "status", "dashboard", "kpi",
    "performance", "overall"
  ],
};

/**
 * Checks if tokens match any keyword in a specific domain.
 */
const matchesDomain = (tokens, domainKey) => {
  const keywords = DOMAIN_KEYWORDS[domainKey] || [];
  return tokens.some((token) => keywords.some((kw) => isFuzzyWordMatch(token, kw)));
};

/**
 * Detects if the question falls within the hotel management domain (exact or fuzzy).
 */
const isHotelDomainQuery = (text) => {
  const tokens = tokenizeMessage(text);
  if (tokens.length === 0) return false;

  for (const domainKey of Object.keys(DOMAIN_KEYWORDS)) {
    if (matchesDomain(tokens, domainKey)) return true;
  }
  return false;
};

/**
 * Safely fetches counts or docs from a model, handling missing or empty collections gracefully.
 */
const safeFetch = async (modelPromise, fallback = []) => {
  try {
    return await modelPromise;
  } catch (err) {
    return fallback;
  }
};

/**
 * Core AI Assistant logic: Inspects query, aggregates live database records,
 * and formats precise answers or out-of-domain guardrails.
 */
export const askAssistant = async (tenantConn, { message, history = [] }, user = {}) => {
  const text = (message || "").trim();
  const lowerText = text.toLowerCase();
  const romanUrdu = detectRomanUrdu(text);
  const tokens = tokenizeMessage(text);

  // 1. Handle Greetings
  if (isGreeting(lowerText) && text.split(/\s+/).length <= 4) {
    const greetingReply = romanUrdu
      ? `Walaikum Assalam! Main Luxuria AI Assistant hoon. Main aap ko live hotel operations—jaise ke rooms, bookings, revenue, housekeeping, staff, inventory aur restaurant ke baray mein kisi bhi waqt live data bata sakta hoon. Aap aaj kya jan-na chahte hain?`
      : `Hello ${user?.fullName ? user.fullName : "there"}! I am Luxuria AI, your intelligent hotel operations assistant. I can provide real-time information and analytics on rooms, reservations, revenue, housekeeping, staff, inventory, restaurant, and events. How can I assist you today?`;

    return {
      reply: greetingReply,
      domain: "greeting",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 2. Handle Help & Capabilities
  if (isHelpQuery(lowerText)) {
    const helpReply = romanUrdu
      ? `Main Luxuria Hotel Management ke tamam zaroori shobon (departments) ke baray mein live data faraham kar sakta hoon:
• Rooms & Occupancy: Khali aur occupied kamray, room status
• Reservations: Aaj ki arrivals, departures aur active bookings
• Financials: Live revenue, expenses aur net profit
• Housekeeping & Maintenance: Clean aur dirty kamray, maintenance tickets
• Staff & HR: On-duty staff, attendance aur leave requests
• Inventory: Total items aur low-stock alerts
• Restaurant: Menu items aur orders
• Events & Parking: Banquets, events aur parking slots

Aap seedha sawal pooch sakte hain, maslan: "Kitne rooms available hain?" ya "Aaj ka revenue kitna hai?"`
      : `I can provide real-time operational insights and answers across all hotel departments:
• Rooms & Occupancy: Available, occupied, and maintenance room breakdowns
• Reservations: Today's check-ins, check-outs, and active booking details
• Financials: Real-time revenue, expenses, invoices, and RevPAR/ADR metrics
• Housekeeping & Maintenance: Clean, dirty, and inspection-ready rooms, plus open tickets
• Staff & HR: Active staff headcount, attendance, and pending leave requests
• Inventory: Stock availability and low-inventory warnings
• Restaurant: Menu items, categories, and dining orders
• Events & Parking: Banquet schedules and parking spot occupancy

Try asking questions like: "How many rooms are available?", "What is our revenue this month?", or "Show inventory low stock items."`;

    return {
      reply: helpReply,
      domain: "help",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 3. Out-of-Domain Guardrail Check
  if (!isHotelDomainQuery(lowerText)) {
    const outOfDomainReply = romanUrdu
      ? `Main Luxuria AI Assistant hoon, aur sirf hotel management aur operations ke mutalliq sawalat ke jawab de sakta hoon. Main hotel ke rooms, reservations, guests, financials, housekeeping, staff, inventory, restaurant, events aur parking ke baray mein live data faraham kar sakta hoon. Aap ka sawal hotel operations ke domain se bahir hai. Barah-e-karam hotel ke kisi shobay ke baray mein poochiye.`
      : `I am the Luxuria AI Assistant, specialized strictly in hotel management and operations. I can only provide insights and answer questions regarding your hotel's rooms, reservations, guests, finances, housekeeping, staff, inventory, restaurant, events, and parking. Your question is outside my operational domain. Please ask a hotel-related question.`;

    return {
      reply: outOfDomainReply,
      domain: "out_of_domain",
      isLive: false,
      timestamp: new Date().toISOString(),
    };
  }

  // 4. Resolve Domain and Fetch Live Data from Tenant MongoDB Models
  const Room = await getModel(tenantConn, "Room");
  const Reservation = await getModel(tenantConn, "Reservation");
  const Guest = await getModel(tenantConn, "Guest");
  const Invoice = await getModel(tenantConn, "Invoice");
  const Payment = await getModel(tenantConn, "Payment");
  const Expense = await getModel(tenantConn, "Expense");
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");
  const MaintenanceTicket = await getModel(tenantConn, "MaintenanceTicket");
  const Employee = await getModel(tenantConn, "Employee");
  const InventoryItem = await getModel(tenantConn, "InventoryItem");
  const RestaurantMenuItem = await getModel(tenantConn, "RestaurantMenuItem");
  const RestaurantOrder = await getModel(tenantConn, "RestaurantOrder");
  const Event = await getModel(tenantConn, "Event");
  const ParkingSpace = await getModel(tenantConn, "ParkingSpace");

  // DOMAIN A: Rooms & Occupancy
  if (
    (matchesDomain(tokens, "rooms") ||
      /\b(room|rooms|kamra|kamray|occupancy|vacant|single|double|suite|deluxe)\b/i.test(lowerText)) &&
    !matchesDomain(tokens, "housekeeping") &&
    !/\b(housekeep|clean|dirty|safai)\b/i.test(lowerText)
  ) {
    const allRooms = await safeFetch(Room.find({}).lean(), []);
    const totalRooms = allRooms.length;

    // Check if user is asking for a specific room number (e.g. "room 101" or "is room 205 free")
    const specificRoomMatch = lowerText.match(/\b(?:room|kamra)\s*#?\s*([a-z0-9\-]+)\b/i);
    if (specificRoomMatch && specificRoomMatch[1]) {
      const targetRoomNo = specificRoomMatch[1];
      const targetRoom = allRooms.find(
        (r) =>
          String(r.room_number || r.roomNo || r.number || "").toLowerCase() ===
          targetRoomNo.toLowerCase()
      );

      if (targetRoom) {
        const roomStatus = formatRoomStatus(targetRoom.status);
        const roomType = targetRoom.room_type || targetRoom.type || "Standard";
        const cleanStatus = targetRoom.cleaning_status || targetRoom.cleanStatus || "Clean";

        const reply = romanUrdu
          ? `Room ${targetRoomNo} ki tafseelat:
• Status: ${roomStatus}
• Category / Type: ${roomType}
• Housekeeping: ${cleanStatus}
• Price / Rate: Rs. ${targetRoom.base_price || targetRoom.price || "N/A"} فی رات`
          : `Room ${targetRoomNo} details:
• Status: ${roomStatus}
• Type: ${roomType}
• Cleanliness: ${cleanStatus}
• Base Rate: Rs. ${targetRoom.base_price || targetRoom.price || "N/A"}/night`;

        return {
          reply,
          domain: "rooms_specific",
          isLive: true,
          timestamp: new Date().toISOString(),
        };
      }
    }

    const availableRooms = allRooms.filter(isAvailableRoom);
    const occupiedRooms = allRooms.filter(isOccupiedRoom);
    const maintenanceRooms = allRooms.filter(isMaintenanceRoom);

    const occupancyRate =
      totalRooms > 0 ? Math.round((occupiedRooms.length / totalRooms) * 100) : 0;

    const reply = romanUrdu
      ? `Hotel ke live rooms ka record:
• Total Rooms: ${totalRooms}
• Khali (Available): ${availableRooms.length} rooms
• Booked / Occupied: ${occupiedRooms.length} rooms
• Maintenance / Out of Order: ${maintenanceRooms.length} rooms
• Occupancy Rate: ${occupancyRate}%

Agar aap kisi makhsoos room ka status jan-na chahte hain to "Room [Number]" likh kar pooch sakte hain.`
      : `Live Room Inventory & Occupancy status:
• Total Rooms: ${totalRooms}
• Available: ${availableRooms.length} rooms
• Occupied / Booked: ${occupiedRooms.length} rooms
• Maintenance / Out of Order: ${maintenanceRooms.length} rooms
• Current Occupancy Rate: ${occupancyRate}%

You can also ask about a specific room (e.g. "Is room 101 available?").`;

    return {
      reply,
      domain: "rooms",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN B: Reservations & Arrivals/Departures
  if (
    matchesDomain(tokens, "reservations") ||
    /\b(reservation|reservations|booking|bookings|arrival|arrivals|departure|departures|checkin|check-in|checkout|check-out)\b/i.test(lowerText)
  ) {
    const allReservations = await safeFetch(Reservation.find({}).lean(), []);
    const totalReservations = allReservations.length;

    const activeBookings = allReservations.filter((r) =>
      ["CONFIRMED", "IN_HOUSE", "PENDING", "Booked", "Confirmed", "CheckIn", "CheckedIn"].includes(r.status)
    );
    const checkedIn = allReservations.filter((r) =>
      ["IN_HOUSE", "CHECKED_IN", "CheckIn", "CheckedIn", "checked_in"].includes(r.status)
    );
    const cancelled = allReservations.filter((r) =>
      ["CANCELLED", "Cancelled", "cancelled"].includes(r.status)
    );

    // Today's arrivals comparison
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayArrivals = allReservations.filter((r) => {
      const checkInDate = r.expected_check_in || r.check_in_date || r.checkInDate || r.arrival_date;
      return checkInDate && new Date(checkInDate).toISOString().slice(0, 10) === todayStr;
    });

    const reply = romanUrdu
      ? `Reservations ka live record:
• Total Bookings: ${totalReservations}
• Active / Confirmed: ${activeBookings.length}
• Checked-In Mehman: ${checkedIn.length}
• Aaj ki Arrivals (Check-in): ${todayArrivals.length}
• Cancelled Bookings: ${cancelled.length}

Aap kisi makhsoos reservation ya guest ka naam bata kar bhi inquiry kar sakte hain.`
      : `Live Reservation & Guest Traffic overview:
• Total System Reservations: ${totalReservations}
• Active / Confirmed Bookings: ${activeBookings.length}
• Currently Checked-In: ${checkedIn.length}
• Today's Expected Arrivals: ${todayArrivals.length}
• Cancelled Bookings: ${cancelled.length}

You can also look up a specific booking or guest by name or reservation reference.`;

    return {
      reply,
      domain: "reservations",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN C: Financials, Revenue, Expenses & Invoices
  if (
    matchesDomain(tokens, "financials") ||
    /\b(revenue|income|earn|earnings|finance|financial|money|paisa|paise|aamdan|profit|bill|billing|invoice|invoices|payment|payments|revpar|adr|expense|expenses|cost|kharcha|kharchay)\b/i.test(lowerText)
  ) {
    const [allInvoices, allPayments, allExpenses] = await Promise.all([
      safeFetch(Invoice.find({}).lean(), []),
      safeFetch(Payment.find({}).lean(), []),
      safeFetch(Expense.find({}).lean(), []),
    ]);

    const totalInvoiced = allInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount || inv.totalAmount || 0) || 0), 0);
    const totalPaymentsReceived = allPayments.reduce((sum, p) => sum + (Number(p.amount || 0) || 0), 0);
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + (Number(exp.amount || 0) || 0), 0);

    const paidInvoices = allInvoices.filter((i) => i.status === "Paid");
    const unpaidInvoices = allInvoices.filter((i) => ["Unpaid", "Pending", "Partially Paid"].includes(i.status));
    const netProfit = totalPaymentsReceived - totalExpenses;

    const reply = romanUrdu
      ? `Live Financial & Revenue Report:
• Kul Billed Amount (Invoices): Rs. ${totalInvoiced.toLocaleString()}
• Vasool Shuda Payments (Revenue): Rs. ${totalPaymentsReceived.toLocaleString()}
• Kul Ikhrajat (Expenses): Rs. ${totalExpenses.toLocaleString()}
• Net Profit / Surplus: Rs. ${netProfit.toLocaleString()}
• Paid Invoices: ${paidInvoices.length} | Wajib-ul-Ada Invoices: ${unpaidInvoices.length}

Financial reports aur breakdown Reports tab mein live graph ke sath dastiyab hain.`
      : `Real-time Financial & Revenue Summary:
• Total Invoiced Amount: Rs. ${totalInvoiced.toLocaleString()}
• Total Payments Collected (Revenue): Rs. ${totalPaymentsReceived.toLocaleString()}
• Total Operational Expenses: Rs. ${totalExpenses.toLocaleString()}
• Net Operating Surplus: Rs. ${netProfit.toLocaleString()}
• Paid Invoices: ${paidInvoices.length} | Outstanding Invoices: ${unpaidInvoices.length}

Detailed charts and trends can be inspected in the Reports section.`;

    return {
      reply,
      domain: "financials",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN D: Housekeeping & Maintenance
  if (
    matchesDomain(tokens, "housekeeping") ||
    /\b(housekeep|housekeeping|clean|cleaning|dirty|safai|inspection|maintenance|ticket|repair|damage|broken)\b/i.test(lowerText)
  ) {
    const [allRooms, allTasks, allTickets] = await Promise.all([
      safeFetch(Room.find({}).lean(), []),
      safeFetch(HousekeepingTask.find({}).lean(), []),
      safeFetch(MaintenanceTicket.find({}).lean(), []),
    ]);

    const cleanRooms = allRooms.filter((r) =>
      ["Clean", "Clean / Ready", "clean"].includes(r.cleaning_status || r.cleanStatus || r.status)
    );
    const dirtyRooms = allRooms.filter((r) =>
      ["Dirty", "Cleaning", "dirty", "cleaning"].includes(r.cleaning_status || r.cleanStatus || r.status)
    );

    const pendingTasks = allTasks.filter((t) => ["Pending", "In Progress", "pending"].includes(t.status));
    const openTickets = allTickets.filter((t) => ["Open", "In Progress", "open"].includes(t.status));

    const reply = romanUrdu
      ? `Housekeeping aur Maintenance ka live status:
• Clean / Ready Rooms: ${cleanRooms.length}
• Dirty / Safai Talab Rooms: ${dirtyRooms.length}
• Pending Housekeeping Tasks: ${pendingTasks.length}
• Open Maintenance Tickets: ${openTickets.length}

Staff Assignment aur inspection checklist ke zariye safai ko manage kiya ja sakta hai.`
      : `Live Housekeeping & Maintenance Triage:
• Clean & Guest-Ready Rooms: ${cleanRooms.length}
• Dirty / Pending Cleaning: ${dirtyRooms.length}
• Active Housekeeping Tasks: ${pendingTasks.length}
• Open Maintenance Tickets: ${openTickets.length}

You can dispatch cleaners or assign rooms from the Housekeeping & Maintenance module.`;

    return {
      reply,
      domain: "housekeeping",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN E: Staff & Human Resources
  if (
    matchesDomain(tokens, "staff") ||
    /\b(staff|employee|employees|hr|attendance|leave|salary|payroll|mulazim|chutti|worker|workers)\b/i.test(lowerText)
  ) {
    const allEmployees = await safeFetch(Employee.find({}).lean(), []);
    const activeStaff = allEmployees.filter((e) => ["Active", "active"].includes(e.status));

    const reply = romanUrdu
      ? `Staff aur Human Resources ka live record:
• Total Staff Members: ${allEmployees.length}
• Active Employees: ${activeStaff.length}
• Mukhtalif Departments: Front Office, Housekeeping, Kitchen, Maintenance aur Management shamil hain.

Staff attendance aur leave requests Human Resources tab mein dekhi ja sakti hain.`
      : `Staff & Human Resources status:
• Total Staff Registered: ${allEmployees.length}
• Currently Active Staff: ${activeStaff.length}
• Departments: Front Office, Housekeeping, Food & Beverage, Maintenance, and Management.

View detailed staff shifts, attendance, and leave requests under the Staff / HR section.`;

    return {
      reply,
      domain: "staff",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN F: Inventory & Supplies
  if (
    matchesDomain(tokens, "inventory") ||
    /\b(inventory|stock|item|items|supply|supplies|asset|reorder)\b/i.test(lowerText)
  ) {
    const allItems = await safeFetch(InventoryItem.find({}).lean(), []);
    const lowStockItems = allItems.filter(
      (item) => Number(item.quantity || 0) <= Number(item.minimum_stock || item.minimumStock || 5)
    );

    const lowStockNames = lowStockItems.slice(0, 5).map((i) => i.name || i.item_name).join(", ");

    const reply = romanUrdu
      ? `Inventory aur Stock ka live status:
• Total Items Tracked: ${allItems.length}
• Low Stock / Reorder Items: ${lowStockItems.length} ${
          lowStockNames ? `(Maslan: ${lowStockNames})` : ""
        }

Stock purchase aur movement ki tafseelat Inventory tab mein dastiyab hain.`
      : `Inventory & Warehouse Stock overview:
• Total Stock Items Tracked: ${allItems.length}
• Items at or Below Reorder Threshold: ${lowStockItems.length} ${
          lowStockNames ? `(Including: ${lowStockNames})` : ""
        }

You can create purchase orders or record adjustments in the Inventory module.`;

    return {
      reply,
      domain: "inventory",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN G: Restaurant & POS
  if (
    matchesDomain(tokens, "restaurant") ||
    /\b(restaurant|menu|food|dish|dishes|order|orders|pos|dining|khana|kitchen)\b/i.test(lowerText)
  ) {
    const [allMenuItems, allOrders] = await Promise.all([
      safeFetch(RestaurantMenuItem.find({}).lean(), []),
      safeFetch(RestaurantOrder.find({}).lean(), []),
    ]);

    const availableItems = allMenuItems.filter((item) =>
      ["Available", "available", true].includes(item.is_available ?? item.availability ?? true)
    );
    const activeOrders = allOrders.filter((o) =>
      ["Pending", "Preparing", "Ready"].includes(o.status)
    );

    const reply = romanUrdu
      ? `Restaurant aur Kitchen ka live status:
• Total Menu Dishes: ${allMenuItems.length}
• Available Dishes: ${availableItems.length}
• Active / Pending Dining Orders: ${activeOrders.length}

Restaurant POS aur Kitchen display system mein live orders manage kiye ja sakte hain.`
      : `Restaurant & Food Service overview:
• Total Menu Items: ${allMenuItems.length}
• Dishes Currently Available: ${availableItems.length}
• Active Orders in Kitchen / Service: ${activeOrders.length}

New orders and table bills can be processed in the Restaurant POS module.`;

    return {
      reply,
      domain: "restaurant",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN H: Events & Banquets
  if (
    matchesDomain(tokens, "events") ||
    /\b(event|events|banquet|banquets|hall|halls|beo|function|party|conference|meeting)\b/i.test(lowerText)
  ) {
    const allEvents = await safeFetch(Event.find({}).lean(), []);
    const upcomingEvents = allEvents.filter((e) =>
      ["Confirmed", "Booked", "In Progress"].includes(e.status)
    );

    const reply = romanUrdu
      ? `Events aur Banquets ka live status:
• Total Scheduled Events: ${allEvents.length}
• Upcoming / Active Banquets: ${upcomingEvents.length}

Event packages, banquet venues aur BEO execution details Events & Banquets tab mein dastiyab hain.`
      : `Events & Banquets overview:
• Total Events in System: ${allEvents.length}
• Upcoming / Confirmed Events: ${upcomingEvents.length}

Banquet halls, menus, and BEO specs can be viewed under Events & Banquets.`;

    return {
      reply,
      domain: "events",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN I: Parking
  if (
    matchesDomain(tokens, "parking") ||
    /\b(parking|car|cars|vehicle|vehicles|slot|slots|space|spaces|gaari|gari)\b/i.test(lowerText)
  ) {
    const allSpaces = await safeFetch(ParkingSpace.find({}).lean(), []);
    const availableSlots = allSpaces.filter((s) => ["Available", "available"].includes(s.status));
    const occupiedSlots = allSpaces.filter((s) => ["Occupied", "occupied"].includes(s.status));

    const reply = romanUrdu
      ? `Car Parking ka live status:
• Total Parking Spaces: ${allSpaces.length}
• Khali (Available) Slots: ${availableSlots.length}
• Occupied Slots: ${occupiedSlots.length}

Car parking reservations aur vehicle check-in/out Parking tab se kiye ja sakte hain.`
      : `Car Parking status:
• Total Parking Bays: ${allSpaces.length}
• Available Bays: ${availableSlots.length}
• Occupied Bays: ${occupiedSlots.length}

Vehicle check-ins and spot assignments can be managed in the Parking module.`;

    return {
      reply,
      domain: "parking",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN J: Guests
  if (
    matchesDomain(tokens, "guests") ||
    /\b(guest|guests|mehmaan|mehman|customer|customers|vip)\b/i.test(lowerText)
  ) {
    const allGuests = await safeFetch(Guest.find({}).lean(), []);
    const vipGuests = allGuests.filter((g) => g.vip || g.category === "VIP");

    const reply = romanUrdu
      ? `Guest Register ka live status:
• Kul Registered Mehman: ${allGuests.length}
• VIP Guests: ${vipGuests.length}

Tamam mehmanon ki stay history aur identity verification Guests tab mein mehfooz hai.`
      : `Guest Register overview:
• Total Registered Guests: ${allGuests.length}
• VIP Guests: ${vipGuests.length}

Detailed guest profiles and preferences can be reviewed in the Guests module.`;

    return {
      reply,
      domain: "guests",
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  }

  // DOMAIN K: Overall Executive Briefing / Summary
  const [rooms, reservations, invoices, payments, expenses, employees, inventory] = await Promise.all([
    safeFetch(Room.find({}).lean(), []),
    safeFetch(Reservation.find({}).lean(), []),
    safeFetch(Invoice.find({}).lean(), []),
    safeFetch(Payment.find({}).lean(), []),
    safeFetch(Expense.find({}).lean(), []),
    safeFetch(Employee.find({}).lean(), []),
    safeFetch(InventoryItem.find({}).lean(), []),
  ]);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(isAvailableRoom).length;
  const occupiedRooms = rooms.filter(isOccupiedRoom).length;
  const activeBookings = reservations.filter((r) =>
    ["CONFIRMED", "IN_HOUSE", "PENDING", "Booked", "Confirmed", "CheckIn"].includes(r.status)
  ).length;
  const totalRev = payments.reduce((sum, p) => sum + (Number(p.amount || 0) || 0), 0);
  const totalExp = expenses.reduce((sum, e) => sum + (Number(e.amount || 0) || 0), 0);
  const lowStock = inventory.filter((i) => Number(i.quantity || 0) <= Number(i.minimum_stock || 5)).length;

  const reply = romanUrdu
    ? `Hotel Executive Briefing (Live Database):
• Rooms: ${availableRooms} available / ${totalRooms} kul (${occupiedRooms} occupied)
• Bookings: ${activeBookings} active reservations
• Financials: Rs. ${totalRev.toLocaleString()} revenue | Rs. ${totalExp.toLocaleString()} expenses
• Staff: ${employees.length} employees registered
• Inventory: ${lowStock} items low-stock alerts par hain

Kisi bhi shobay ke bare mein mazeed tafseelat janne ke liye pooch sakte hain.`
    : `Luxuria Executive Briefing (Live Database):
• Rooms & Occupancy: ${availableRooms} available out of ${totalRooms} total (${occupiedRooms} occupied)
• Bookings: ${activeBookings} active reservations in the system
• Financials: Rs. ${totalRev.toLocaleString()} collected revenue against Rs. ${totalExp.toLocaleString()} expenses
• Staff: ${employees.length} registered employees
• Inventory: ${lowStock} items currently flagged for reorder

Ask me for more details on any specific department or guest record!`;

  return {
    reply,
    domain: "overview",
    isLive: true,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Returns executive real-time summary KPIs for the assistant header/widget.
 */
export const getAssistantSummary = async (tenantConn) => {
  const Room = await getModel(tenantConn, "Room");
  const Reservation = await getModel(tenantConn, "Reservation");
  const Payment = await getModel(tenantConn, "Payment");
  const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");

  const [rooms, reservations, payments, tasks] = await Promise.all([
    safeFetch(Room.find({}).lean(), []),
    safeFetch(Reservation.find({}).lean(), []),
    safeFetch(Payment.find({}).lean(), []),
    safeFetch(HousekeepingTask.find({}).lean(), []),
  ]);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(isAvailableRoom).length;
  const occupiedRooms = rooms.filter(isOccupiedRoom).length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const activeReservations = reservations.filter((r) =>
    ["CONFIRMED", "IN_HOUSE", "PENDING", "Booked", "Confirmed", "CheckIn"].includes(r.status)
  ).length;
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount || 0) || 0), 0);
  const pendingTasks = tasks.filter((t) => ["Pending", "In Progress"].includes(t.status)).length;

  return {
    totalRooms,
    availableRooms,
    occupiedRooms,
    occupancyRate,
    activeReservations,
    totalRevenue,
    pendingTasks,
  };
};

/**
 * Returns dynamic smart inquiry suggestions tailored to real hotel data state.
 */
export const getAssistantSuggestions = async (tenantConn) => {
  const Room = await getModel(tenantConn, "Room");
  const InventoryItem = await getModel(tenantConn, "InventoryItem");

  const [rooms, inventory] = await Promise.all([
    safeFetch(Room.find({}).lean(), []),
    safeFetch(InventoryItem.find({}).lean(), []),
  ]);

  const dirtyRooms = rooms.filter((r) =>
    ["Dirty", "Cleaning"].includes(r.cleaning_status || r.cleanStatus || r.status)
  ).length;

  const lowStock = inventory.filter(
    (i) => Number(i.quantity || 0) <= Number(i.minimum_stock || 5)
  ).length;

  return [
    {
      id: "rooms",
      label: "Room Occupancy Forecast",
      query: "What is our current room inventory and occupancy forecast?",
    },
    {
      id: "revenue",
      label: "Revenue & Financials",
      query: "Show me real-time revenue, invoices, and expense trends.",
    },
    {
      id: "arrivals",
      label: "Today's Arrivals & Bookings",
      query: "Summarize today's check-ins, VIP arrivals, and active reservations.",
    },
    {
      id: "housekeeping",
      label: dirtyRooms > 0 ? `${dirtyRooms} Dirty Rooms Pending` : "Housekeeping Status",
      query: "Are there any rooms dirty, in cleaning, or under maintenance?",
    },
    {
      id: "inventory",
      label: lowStock > 0 ? `${lowStock} Low Stock Alerts` : "Inventory Supplies",
      query: "Show inventory items that are running low on stock.",
    },
  ];
};
