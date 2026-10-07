import { describe, it, expect, vi, beforeEach } from 'vitest';
import complaintService from '../services/complaintService.js';
import api, { ApiError } from '../api/client.js';

describe('Guest Complaint Frontend Service Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. getComplaints()', () => {
    it('calls api.get with /hotel/complaints and serialized query parameters', async () => {
      const mockParams = {
        page: 1,
        limit: 10,
        status: 'OPEN',
        severity: 'HIGH',
        category: 'PLUMBING',
        search: 'water leak',
        guest_id: '65a1b2c3d4e5f67890123456',
      };

      const mockResponse = {
        success: true,
        data: [{ _id: 'cmp_1', category: 'PLUMBING', status: 'OPEN' }],
        meta: { page: 1, limit: 10, total: 1, pages: 1 },
      };

      const getSpy = vi.spyOn(api, 'get').mockResolvedValue(mockResponse);

      const result = await complaintService.getComplaints(mockParams);

      expect(getSpy).toHaveBeenCalledWith('/hotel/complaints', mockParams);
      expect(result).toEqual(mockResponse);
    });

    it('defaults to empty object when called without parameters', async () => {
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ success: true, data: [] });

      await complaintService.getComplaints();

      expect(getSpy).toHaveBeenCalledWith('/hotel/complaints', {});
    });
  });

  describe('2. getComplaintById()', () => {
    it('calls api.get with /hotel/complaints/:id', async () => {
      const complaintId = '65b1c2d3e4f5678901234567';
      const mockResponse = {
        success: true,
        data: { _id: complaintId, category: 'ELECTRICAL', status: 'INVESTIGATING' },
      };

      const getSpy = vi.spyOn(api, 'get').mockResolvedValue(mockResponse);

      const result = await complaintService.getComplaintById(complaintId);

      expect(getSpy).toHaveBeenCalledWith(`/hotel/complaints/${complaintId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('3. createComplaint()', () => {
    it('calls api.post with /hotel/complaints and payload', async () => {
      const payload = {
        guest_id: '65a1b2c3d4e5f67890123456',
        category: 'AIR_CONDITIONING',
        description: 'AC blowing warm air',
        severity: 'HIGH',
      };

      const mockResponse = {
        success: true,
        data: { _id: 'cmp_new', complaint_ref: 'CMP-20261006-0001', ...payload, status: 'OPEN' },
      };

      const postSpy = vi.spyOn(api, 'post').mockResolvedValue(mockResponse);

      const result = await complaintService.createComplaint(payload);

      expect(postSpy).toHaveBeenCalledWith('/hotel/complaints', payload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('4. updateComplaint()', () => {
    it('calls api.patch with /hotel/complaints/:id and update payload', async () => {
      const complaintId = '65b1c2d3e4f5678901234567';
      const updateData = {
        status: 'RESOLVED',
        resolution_notes: 'Replaced AC capacitor',
      };

      const mockResponse = {
        success: true,
        data: { _id: complaintId, ...updateData },
      };

      const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue(mockResponse);

      const result = await complaintService.updateComplaint(complaintId, updateData);

      expect(patchSpy).toHaveBeenCalledWith(`/hotel/complaints/${complaintId}`, updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('5. deleteComplaint()', () => {
    it('calls api.delete with /hotel/complaints/:id', async () => {
      const complaintId = '65b1c2d3e4f5678901234567';
      const mockResponse = { success: true, message: 'Complaint deleted successfully' };

      const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValue(mockResponse);

      const result = await complaintService.deleteComplaint(complaintId);

      expect(deleteSpy).toHaveBeenCalledWith(`/hotel/complaints/${complaintId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('6. Error Handling Propagation', () => {
    it('propagates ApiError when API request fails', async () => {
      const apiError = new ApiError(404, 'Complaint not found');
      vi.spyOn(api, 'get').mockRejectedValue(apiError);

      await expect(complaintService.getComplaintById('nonexistent_id')).rejects.toThrow('Complaint not found');
    });
  });
});
