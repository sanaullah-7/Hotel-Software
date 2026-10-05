import api from "../api/client.js";

export const roomService = {
  // Amenities
  getAmenities: () => api.get("/hotel/amenities"),
  createAmenity: (data) => api.post("/hotel/amenities", data),
  updateAmenity: (id, data) => api.put(`/hotel/amenities/${id}`, data),
  deleteAmenity: (id) => api.delete(`/hotel/amenities/${id}`),

  // Room Types
  getRoomTypes: () => api.get("/hotel/room-types"),
  createRoomType: (data) => api.post("/hotel/room-types", data),
  updateRoomType: (id, data) => api.put(`/hotel/room-types/${id}`, data),
  deleteRoomType: (id) => api.delete(`/hotel/room-types/${id}`),

  // Rooms
  getRooms: (params) => api.get("/hotel/rooms", params),
  getRoomById: (id) => api.get(`/hotel/rooms/${id}`),
  createRoom: (data) => api.post("/hotel/rooms", data),
  updateRoom: (id, data) => api.put(`/hotel/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/hotel/rooms/${id}`),
};

export default roomService;
