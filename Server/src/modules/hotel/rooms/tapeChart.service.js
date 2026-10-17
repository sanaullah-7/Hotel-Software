import { getModel } from "../../../database/hotel/modelFactory.js";

/**
 * Retrieves the read-only tape chart data for a specified date range.
 *
 * @param {string} tenantConn - Authenticated hotel tenant ID / connection context
 * @param {object} params - Query parameters
 * @param {string} params.startDate - YYYY-MM-DD
 * @param {string} params.endDate - YYYY-MM-DD
 * @returns {Promise<object>} Tape chart DTO containing date_range, room_types, rooms, and timeline_items
 */
export const getTapeChartData = async (tenantConn, { startDate, endDate }) => {
  const rangeStart = new Date(`${startDate}T00:00:00.000Z`);
  const rangeEnd = new Date(`${endDate}T00:00:00.000Z`);
  const totalDays = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));

  // 1. Resolve tenant models
  const RoomType = await getModel(tenantConn, "RoomType");
  const Room = await getModel(tenantConn, "Room");
  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
  const Stay = await getModel(tenantConn, "Stay");
  const StayRoom = await getModel(tenantConn, "StayRoom");
  const MaintenanceTicket = await getModel(tenantConn, "MaintenanceTicket");

  // 2. Fetch RoomTypes and Physical Rooms (untruncated inventory)
  const [rawRoomTypes, rawRooms] = await Promise.all([
    RoomType.find({}).sort({ name: 1 }).lean(),
    Room.find({}).populate("room_type_id").sort({ room_number: 1 }).lean(),
  ]);

  const roomTypeMap = new Map();
  const roomTypesDto = rawRoomTypes.map((rt) => {
    const id = rt._id.toString();
    const dto = {
      id,
      _id: id,
      name: rt.name,
      code: rt.code,
      base_price: Number(rt.base_price || 0),
      base_occupancy: Number(rt.base_occupancy || 1),
      max_occupancy: Number(rt.max_occupancy || 1),
    };
    roomTypeMap.set(id, dto);
    return dto;
  });

  // 3. Fetch active maintenance tickets
  const activeTickets = await MaintenanceTicket.find({
    status: { $in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] },
    room_id: { $ne: null },
  })
    .select("_id ticket_ref title priority status room_id created_at")
    .lean();

  const maintenanceByRoomId = new Map();
  activeTickets.forEach((ticket) => {
    if (!ticket.room_id) return;
    const rId = ticket.room_id.toString();
    if (!maintenanceByRoomId.has(rId)) {
      maintenanceByRoomId.set(rId, []);
    }
    maintenanceByRoomId.get(rId).push({
      id: ticket._id.toString(),
      ticket_ref: ticket.ticket_ref,
      title: ticket.title,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.created_at ? ticket.created_at.toISOString() : null,
    });
  });

  // 4. Map Rooms DTO
  const roomsDto = rawRooms.map((r) => {
    const id = r._id.toString();
    const rtId = r.room_type_id?._id ? r.room_type_id._id.toString() : (r.room_type_id ? r.room_type_id.toString() : null);
    const rtObj = rtId ? roomTypeMap.get(rtId) : null;

    return {
      id,
      _id: id,
      room_number: r.room_number,
      floor: r.floor || "",
      room_type_id: rtId,
      room_type_name: rtObj ? rtObj.name : (r.room_type_id?.name || null),
      room_type_code: rtObj ? rtObj.code : (r.room_type_id?.code || null),
      status: r.status || "AVAILABLE",
      housekeeping_status: r.housekeeping_status || "CLEAN",
      active_maintenance: maintenanceByRoomId.get(id) || [],
    };
  });

  const timelineItems = [];
  const inHouseReservationIds = new Set();

  // 5. Query Active Stays (authoritative current in-house occupancy)
  const activeStays = await Stay.find({
    status: "CHECKED_IN",
  })
    .populate("primary_guest_id", "first_name last_name phone email guest_ref")
    .populate("reservation_id", "booking_ref expected_check_in expected_check_out status special_requests adults children")
    .lean();

  if (activeStays.length > 0) {
    const activeStayIds = activeStays.map((s) => s._id);
    const occupiedStayRooms = await StayRoom.find({
      stay_id: { $in: activeStayIds },
      status: "OCCUPIED",
    }).lean();

    const stayRoomsByStayId = new Map();
    occupiedStayRooms.forEach((sr) => {
      const sId = sr.stay_id.toString();
      if (!stayRoomsByStayId.has(sId)) {
        stayRoomsByStayId.set(sId, []);
      }
      stayRoomsByStayId.get(sId).push(sr);
    });

    for (const stay of activeStays) {
      const reservation = stay.reservation_id;
      if (reservation?._id) {
        inHouseReservationIds.add(reservation._id.toString());
      }

      // Determine stay effective interval
      const stayStart = stay.actual_check_in ? new Date(stay.actual_check_in) : (reservation?.expected_check_in ? new Date(reservation.expected_check_in) : rangeStart);
      const stayEnd = reservation?.expected_check_out ? new Date(reservation.expected_check_out) : rangeEnd;

      // Check date overlap with requested window: existing_start < rangeEnd && existing_end > rangeStart
      if (stayStart < rangeEnd && stayEnd > rangeStart) {
        const assignedRooms = stayRoomsByStayId.get(stay._id.toString()) || [];

        assignedRooms.forEach((sr) => {
          if (!sr.room_id) return;
          const roomIdStr = sr.room_id.toString();

          const guestName = stay.primary_guest_id
            ? `${stay.primary_guest_id.first_name || ""} ${stay.primary_guest_id.last_name || ""}`.trim()
            : "Guest";

          timelineItems.push({
            id: `stay_${stay._id.toString()}_room_${roomIdStr}`,
            type: "STAY",
            item_type: "STAY",
            status: "IN_HOUSE",
            room_id: roomIdStr,
            reservation_id: reservation?._id ? reservation._id.toString() : null,
            stay_id: stay._id.toString(),
            booking_ref: reservation?.booking_ref || null,
            stay_ref: stay.stay_ref,
            guest: stay.primary_guest_id
              ? {
                  id: stay.primary_guest_id._id.toString(),
                  name: guestName || "Guest",
                  phone: stay.primary_guest_id.phone || null,
                }
              : null,
            start_date: stayStart.toISOString(),
            end_date: stayEnd.toISOString(),
            adults: Number(reservation?.adults || stay.total_guests || 1),
            children: Number(reservation?.children || 0),
            special_requests: reservation?.special_requests || null,
          });
        });
      }
    }
  }

  // 6. Query Overlapping Upcoming Reservations (PENDING, CONFIRMED)
  // Half-open overlap: expected_check_in < rangeEnd && expected_check_out > rangeStart
  // Excludes CANCELLED, NO_SHOW, CHECKED_OUT, and reservations already handled as IN_HOUSE stays
  const upcomingReservations = await Reservation.find({
    status: { $in: ["PENDING", "CONFIRMED"] },
    expected_check_in: { $lt: rangeEnd },
    expected_check_out: { $gt: rangeStart },
  })
    .populate("primary_guest_id", "first_name last_name phone email guest_ref")
    .lean();

  if (upcomingReservations.length > 0) {
    const resIds = upcomingReservations
      .map((r) => r._id)
      .filter((id) => !inHouseReservationIds.has(id.toString()));

    if (resIds.length > 0) {
      const assignedReservationRooms = await ReservationRoom.find({
        reservation_id: { $in: resIds },
        room_id: { $ne: null },
      }).lean();

      const resRoomsByResId = new Map();
      assignedReservationRooms.forEach((rr) => {
        const rId = rr.reservation_id.toString();
        if (!resRoomsByResId.has(rId)) {
          resRoomsByResId.set(rId, []);
        }
        resRoomsByResId.get(rId).push(rr);
      });

      for (const res of upcomingReservations) {
        if (inHouseReservationIds.has(res._id.toString())) continue;

        const assignedRooms = resRoomsByResId.get(res._id.toString()) || [];

        assignedRooms.forEach((rr) => {
          if (!rr.room_id) return;
          const roomIdStr = rr.room_id.toString();

          const guestName = res.primary_guest_id
            ? `${res.primary_guest_id.first_name || ""} ${res.primary_guest_id.last_name || ""}`.trim()
            : "Guest";

          timelineItems.push({
            id: `res_${res._id.toString()}_room_${roomIdStr}`,
            type: "RESERVATION",
            item_type: "RESERVATION",
            status: res.status, // "CONFIRMED" or "PENDING"
            room_id: roomIdStr,
            reservation_id: res._id.toString(),
            stay_id: null,
            booking_ref: res.booking_ref,
            stay_ref: null,
            guest: res.primary_guest_id
              ? {
                  id: res.primary_guest_id._id.toString(),
                  name: guestName || "Guest",
                  phone: res.primary_guest_id.phone || null,
                }
              : null,
            start_date: new Date(res.expected_check_in).toISOString(),
            end_date: new Date(res.expected_check_out).toISOString(),
            adults: Number(rr.adults || res.adults || 1),
            children: Number(rr.children || res.children || 0),
            special_requests: res.special_requests || null,
          });
        });
      }
    }
  }

  // 7. Sort timeline items chronologically
  timelineItems.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return {
    date_range: {
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
    },
    room_types: roomTypesDto,
    rooms: roomsDto,
    timeline_items: timelineItems,
  };
};
