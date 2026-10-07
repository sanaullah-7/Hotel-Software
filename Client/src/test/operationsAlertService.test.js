import { describe, it, expect, vi, beforeEach } from 'vitest';
import operationsAlertService from '../services/operationsAlertService.js';
import api, { ApiError } from '../api/client.js';

describe('Operations Alert Frontend Service Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. getOperationsAlerts() & getAlerts()', () => {
    it('calls api.get with /hotel/operations-alerts and query parameters', async () => {
      const mockParams = {
        page: 1,
        limit: 10,
        status: 'OPEN',
        severity: 'CRITICAL',
        department: 'VIP_ARRIVALS',
        search: 'Presidential',
      };

      const mockResponse = {
        success: true,
        data: [{ _id: 'alert_1', title: 'VIP Arrival', status: 'OPEN' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      const getSpy = vi.spyOn(api, 'get').mockResolvedValue(mockResponse);

      const result = await operationsAlertService.getOperationsAlerts(mockParams);

      expect(getSpy).toHaveBeenCalledWith('/hotel/operations-alerts', mockParams);
      expect(result).toEqual(mockResponse);
    });

    it('defaults to empty object when called without parameters', async () => {
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ success: true, data: [] });

      await operationsAlertService.getOperationsAlerts();

      expect(getSpy).toHaveBeenCalledWith('/hotel/operations-alerts', {});
    });

    it('supports alias getAlerts() with identical behavior', async () => {
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ success: true, data: [] });

      await operationsAlertService.getAlerts({ department: 'MAINTENANCE' });

      expect(getSpy).toHaveBeenCalledWith('/hotel/operations-alerts', { department: 'MAINTENANCE' });
    });
  });

  describe('2. getOperationsAlertById() & getAlertById()', () => {
    it('calls api.get with /hotel/operations-alerts/:id', async () => {
      const alertId = '67a3f81023b123456789abcd';
      const mockResponse = {
        success: true,
        data: { _id: alertId, title: 'AC Malfunction', status: 'IN_PROGRESS' },
      };

      const getSpy = vi.spyOn(api, 'get').mockResolvedValue(mockResponse);

      const result = await operationsAlertService.getOperationsAlertById(alertId);

      expect(getSpy).toHaveBeenCalledWith(`/hotel/operations-alerts/${alertId}`);
      expect(result).toEqual(mockResponse);
    });

    it('supports alias getAlertById() with identical behavior', async () => {
      const alertId = '67a3f81023b123456789abcd';
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ success: true, data: { _id: alertId } });

      await operationsAlertService.getAlertById(alertId);

      expect(getSpy).toHaveBeenCalledWith(`/hotel/operations-alerts/${alertId}`);
    });
  });

  describe('3. createOperationsAlert() & createAlert()', () => {
    it('calls api.post with /hotel/operations-alerts and payload', async () => {
      const payload = {
        title: 'Priority Turnover Villa 108',
        message: 'Complete private pool reset',
        department: 'HOUSEKEEPING',
        severity: 'HIGH',
      };

      const mockResponse = {
        success: true,
        data: { _id: 'alert_new', alert_ref: 'ALT-20261006-0001', ...payload, status: 'OPEN' },
      };

      const postSpy = vi.spyOn(api, 'post').mockResolvedValue(mockResponse);

      const result = await operationsAlertService.createOperationsAlert(payload);

      expect(postSpy).toHaveBeenCalledWith('/hotel/operations-alerts', payload);
      expect(result).toEqual(mockResponse);
    });

    it('supports alias createAlert() with identical behavior', async () => {
      const payload = { title: 'Test Alert', message: 'Test message' };
      const postSpy = vi.spyOn(api, 'post').mockResolvedValue({ success: true, data: {} });

      await operationsAlertService.createAlert(payload);

      expect(postSpy).toHaveBeenCalledWith('/hotel/operations-alerts', payload);
    });
  });

  describe('4. updateOperationsAlert() & updateAlert()', () => {
    it('calls api.patch with /hotel/operations-alerts/:id and update payload', async () => {
      const alertId = '67a3f81023b123456789abcd';
      const updateData = {
        status: 'RESOLVED',
        severity: 'CRITICAL',
      };

      const mockResponse = {
        success: true,
        data: { _id: alertId, ...updateData },
      };

      const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue(mockResponse);

      const result = await operationsAlertService.updateOperationsAlert(alertId, updateData);

      expect(patchSpy).toHaveBeenCalledWith(`/hotel/operations-alerts/${alertId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('supports alias updateAlert() with identical behavior', async () => {
      const alertId = '67a3f81023b123456789abcd';
      const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({ success: true, data: {} });

      await operationsAlertService.updateAlert(alertId, { status: 'IN_PROGRESS' });

      expect(patchSpy).toHaveBeenCalledWith(`/hotel/operations-alerts/${alertId}`, { status: 'IN_PROGRESS' });
    });
  });

  describe('5. deleteOperationsAlert() & deleteAlert()', () => {
    it('calls api.delete with /hotel/operations-alerts/:id', async () => {
      const alertId = '67a3f81023b123456789abcd';
      const mockResponse = { success: true, message: 'Operations alert deleted successfully', data: null };

      const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValue(mockResponse);

      const result = await operationsAlertService.deleteOperationsAlert(alertId);

      expect(deleteSpy).toHaveBeenCalledWith(`/hotel/operations-alerts/${alertId}`);
      expect(result).toEqual(mockResponse);
    });

    it('supports alias deleteAlert() with identical behavior', async () => {
      const alertId = '67a3f81023b123456789abcd';
      const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValue({ success: true });

      await operationsAlertService.deleteAlert(alertId);

      expect(deleteSpy).toHaveBeenCalledWith(`/hotel/operations-alerts/${alertId}`);
    });
  });

  describe('6. Error Handling Propagation', () => {
    it('propagates ApiError when API request fails', async () => {
      const apiError = new ApiError(404, 'Operations alert not found');
      vi.spyOn(api, 'get').mockRejectedValue(apiError);

      await expect(operationsAlertService.getOperationsAlertById('nonexistent_id')).rejects.toThrow('Operations alert not found');
    });
  });
});
