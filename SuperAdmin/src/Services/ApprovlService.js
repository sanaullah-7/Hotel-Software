import { HotelService } from './HotelService.js';

export const ApprovalService = {
  async getApprovals({ status = '', page = 1, limit = 10, search = '' } = {}) {
    return HotelService.getHotels({ status, page, limit, search });
  },

  async getApprovalById(id) {
    return HotelService.getHotelById(id);
  },

  async approveRequest(id) {
    return HotelService.approveHotel(id);
  },

  async getPendingApprovals(params = {}) {
    return HotelService.getHotels({ ...params, status: 'PENDING' });
  },

  async rejectRequest(id, reason) {
    return HotelService.rejectHotel(id, reason);
  },

  async getPendingCount() {
    const stats = await HotelService.getStats();
    return stats?.pending ?? 0;
  },
};
