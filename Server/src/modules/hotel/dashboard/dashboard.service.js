import { getModel } from "../../../database/hotel/modelFactory.js";

export const getDashboardMetrics = async (hotelContext) => {
  const Reservation = await getModel(hotelContext, "Reservation");
  const Stay = await getModel(hotelContext, "Stay");
  const Room = await getModel(hotelContext, "Room");
  const Payment = await getModel(hotelContext, "Payment");
  const Folio = await getModel(hotelContext, "Folio");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Today Reservations
  const todayReservations = await Reservation.countDocuments({
    $or: [
      { created_at: { $gte: startOfDay, $lte: endOfDay } },
      { expected_check_in: { $gte: startOfDay, $lte: endOfDay } }
    ]
  });

  // 2. Today Check-ins (from Stay or active in-house reservations)
  const todayCheckIns = await Stay.countDocuments({
    actual_check_in: { $gte: startOfDay, $lte: endOfDay }
  });

  // 3. Today Check-outs
  const todayCheckOuts = await Stay.countDocuments({
    actual_check_out: { $gte: startOfDay, $lte: endOfDay }
  });

  // 4. Occupied Rooms & Available Rooms
  const [occupiedRooms, availableRooms, totalRooms] = await Promise.all([
    Room.countDocuments({ status: "OCCUPIED" }),
    Room.countDocuments({ status: "AVAILABLE" }),
    Room.countDocuments({})
  ]);

  // 5. Today Revenue & Payments count (from room payments and hotel events)
  const todayPayments = await Payment.find({
    status: { $in: ["COMPLETED", "completed", "SUCCESS", "success"] },
    created_at: { $gte: startOfDay, $lte: endOfDay }
  });

  const Event = await getModel(hotelContext, "Event");
  const todayEvents = await Event.find({ status: { $ne: "Cancelled" } }).lean().catch(() => []);
  let eventTodayRevenue = 0;
  let eventPaymentsCount = 0;

  todayEvents.forEach((ev) => {
    if (Array.isArray(ev.payments) && ev.payments.length > 0) {
      ev.payments.forEach((p) => {
        const pd = new Date(p.date || p.created_at);
        if (pd >= startOfDay && pd <= endOfDay) {
          eventTodayRevenue += Number(p.amount) || 0;
          eventPaymentsCount++;
        }
      });
    } else if (ev.created_at >= startOfDay && ev.created_at <= endOfDay && ev.advance_amount > 0) {
      eventTodayRevenue += Number(ev.advance_amount) || 0;
      eventPaymentsCount++;
    }
  });

  const todayRevenue = todayPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) + eventTodayRevenue;
  const paymentsTodayCount = todayPayments.length + eventPaymentsCount;

  // 6. Outstanding Dues (sum of balances of OPEN folios + pending balance on confirmed events)
  const openFolios = await Folio.find({ status: "OPEN" });
  const folioDues = openFolios.reduce((sum, f) => sum + (Number(f.balance) || 0), 0);
  const activeEvents = await Event.find({ status: { $in: ["Confirmed", "In-Progress", "Pending"] } }).catch(() => []);
  const eventDues = activeEvents.reduce((sum, e) => sum + (Number(e.balance_amount) || 0), 0);
  const outstandingDues = folioDues + eventDues;

  return {
    today_reservations: todayReservations,
    today_check_ins: todayCheckIns,
    today_check_outs: todayCheckOuts,
    occupied_rooms: occupiedRooms,
    available_rooms: availableRooms,
    total_rooms: totalRooms,
    today_revenue: todayRevenue,
    payments_today_count: paymentsTodayCount,
    outstanding_dues: outstandingDues,
  };
};
