import roomService from './roomService.js';
import stayService from './stayService.js';
import reservationService from './reservationService.js';
import { toFrontendOccupancyRooms } from '../features/occupancy/adapters/occupancyAdapter.js';

export const occupancyService = {
  /**
   * Fetches authoritative backend rooms, active stays, and reservations to assemble Occupancy view models.
   */
  getOccupancyData: async () => {
    const [roomsRes, staysRes, reservationsRes] = await Promise.all([
      roomService.getRooms(),
      stayService.getStays(),
      reservationService.getReservations(),
    ]);

    const rooms = Array.isArray(roomsRes?.data) ? roomsRes.data : (Array.isArray(roomsRes) ? roomsRes : (roomsRes?.data?.rooms || []));
    const stays = Array.isArray(staysRes?.data) ? staysRes.data : (Array.isArray(staysRes) ? staysRes : (staysRes?.data?.stays || []));
    const reservations = Array.isArray(reservationsRes?.data) ? reservationsRes.data : (Array.isArray(reservationsRes) ? reservationsRes : (reservationsRes?.data?.reservations || []));

    return {
      rooms: toFrontendOccupancyRooms(rooms, stays, reservations),
      rawRooms: rooms,
      rawStays: stays,
      rawReservations: reservations,
    };
  },

  /**
   * Submits backend Stay check-in
   */
  checkIn: (payload) => stayService.checkIn(payload),

  /**
   * Submits backend Stay check-out
   */
  checkOut: (payload) => stayService.checkOut(payload),
};

export default occupancyService;
