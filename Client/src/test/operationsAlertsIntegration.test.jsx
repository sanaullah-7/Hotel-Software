import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OperationsAlerts from '../features/front-office/pages/OperationsAlerts';
import operationsAlertService from '../services/operationsAlertService';

describe('Phase 5 Step 9: Operations Alerts UI Backend Integration Tests', () => {
  const sampleBackendAlerts = [
    {
      _id: '65f1a2b3c4d5e67890123001',
      alert_ref: 'ALT-20261006-0001',
      title: 'VIP Presidential Arrival - Final Amenity Placement',
      message: 'Lady Evelyn Montague landing at private hangar at 5:45 PM. Verify Dom Perignon chilling in Presidential Suite 501.',
      department: 'VIP_ARRIVALS',
      severity: 'CRITICAL',
      status: 'OPEN',
      is_active: true,
      action_required: 'Inspect suite amenities and dispatch luxury housefloor kit.',
      location: 'Presidential Suite 501',
      guest_name: 'Lady Evelyn Montague',
      reported_by: 'Concierge Team',
      assigned_to: 'Concierge Team (Sarah)',
      created_at: '2026-10-06T10:00:00.000Z',
      updated_at: '2026-10-06T10:00:00.000Z',
      resolved_at: null,
    },
    {
      _id: '65f1a2b3c4d5e67890123002',
      alert_ref: 'ALT-20261006-0002',
      title: 'AC Cooling Malfunction in Deluxe Ocean Suite',
      message: 'Guest reported ambient room temperature rising to 78°F despite thermostat set to 70°F.',
      department: 'MAINTENANCE',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      is_active: true,
      action_required: 'Dispatch HVAC technician to inspect compressor unit.',
      location: 'Suite 214',
      guest_name: 'Multiple Guests',
      reported_by: 'Front Desk Team',
      assigned_to: 'Engineering Lead (David)',
      created_at: '2026-10-06T11:00:00.000Z',
      updated_at: '2026-10-06T11:05:00.000Z',
      resolved_at: null,
    },
    {
      _id: '65f1a2b3c4d5e67890123003',
      alert_ref: 'ALT-20261006-0003',
      title: 'Priority Turnover - Villa 108',
      message: 'Early check-in requested for Villa 108.',
      department: 'HOUSEKEEPING',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      is_active: false,
      action_required: 'Complete turnover and staging.',
      location: 'Villa 108',
      guest_name: 'Loudon Party',
      reported_by: 'Front Desk',
      assigned_to: 'Housekeeping Supervisor (Maria)',
      created_at: '2026-10-06T09:00:00.000Z',
      updated_at: '2026-10-06T09:45:00.000Z',
      resolved_at: '2026-10-06T09:45:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on localStorage to guarantee zero runtime interaction
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Initial Load, Adaptation & States (Read)', () => {
    it('shows loading indicator, loads backend alerts, adapts data, and renders summary metrics and cards', async () => {
      vi.spyOn(operationsAlertService, 'getOperationsAlerts').mockResolvedValue({
        data: sampleBackendAlerts,
      });

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      // Loading state visible initially
      expect(screen.getByText('Loading operations alerts...')).toBeTruthy();

      // Successfully renders mapped backend alerts
      expect(await screen.findByText('VIP Presidential Arrival - Final Amenity Placement')).toBeTruthy();
      expect(screen.getByText('AC Cooling Malfunction in Deluxe Ocean Suite')).toBeTruthy();
      expect(screen.getByText('Priority Turnover - Villa 108')).toBeTruthy();

      // Alert refs rendered correctly
      expect(screen.getByText('ALT-20261006-0001')).toBeTruthy();
      expect(screen.getByText('ALT-20261006-0002')).toBeTruthy();
      expect(screen.getByText('ALT-20261006-0003')).toBeTruthy();

      // Department & assignees mapped
      expect(screen.getByText('Concierge Team (Sarah)')).toBeTruthy();
      expect(screen.getByText('Engineering Lead (David)')).toBeTruthy();

      // Operational context rendered
      expect(screen.getAllByText(/Presidential Suite 501/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Lady Evelyn Montague/i).length).toBeGreaterThan(0);

      // Metrics computed reactively:
      // Active: 2 (indices 0 and 1; index 2 is RESOLVED)
      // Critical & Urgent: 1 (index 0)
      // In Progress: 1 (index 1)
      // Resolved Today: 1 (index 2)
      expect(screen.getByText('Active Alerts')).toBeTruthy();
      expect(screen.getByText('Critical & Urgent')).toBeTruthy();
      expect(screen.getByText('Resolved Today')).toBeTruthy();

      // Verify localStorage was never accessed for operations alerts
      expect(localStorage.getItem).not.toHaveBeenCalledWith('hotel_ops_alerts');
      expect(localStorage.setItem).not.toHaveBeenCalledWith('hotel_ops_alerts', expect.anything());
    });

    it('renders empty state when backend returns empty array without mock fallback', async () => {
      vi.spyOn(operationsAlertService, 'getOperationsAlerts').mockResolvedValue({
        data: [],
      });

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      expect(await screen.findByText('No alerts match your current filters.')).toBeTruthy();
      // Ensure legacy hardcoded alerts are NOT present
      expect(screen.queryByText('AL-0087')).toBeNull();
      expect(screen.queryByText('AL-0091')).toBeNull();
      expect(screen.queryByText('AL-0093')).toBeNull();
    });

    it('renders error banner with functional Retry button on backend failure without mock fallback', async () => {
      const getSpy = vi.spyOn(operationsAlertService, 'getOperationsAlerts')
        .mockRejectedValueOnce(new Error('Backend connection failed'))
        .mockResolvedValueOnce({ data: sampleBackendAlerts });

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      // Error banner rendered
      const alertEl = await screen.findByRole('alert');
      expect(alertEl).toBeTruthy();
      expect(alertEl.textContent).toContain('Backend connection failed');

      // Click Retry button
      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      fireEvent.click(retryBtn);

      // Successfully recovers and loads alerts
      expect(await screen.findByText('VIP Presidential Arrival - Final Amenity Placement')).toBeTruthy();
      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('2. Dispatch / Create Alert Workflow', () => {
    it('converts modal inputs to controlled state and calls createOperationsAlert with canonical payload', async () => {
      let alertsState = [...sampleBackendAlerts];
      vi.spyOn(operationsAlertService, 'getOperationsAlerts').mockImplementation(async () => ({
        data: alertsState,
      }));

      const createSpy = vi.spyOn(operationsAlertService, 'createOperationsAlert').mockImplementation(async (payload) => {
        const newDoc = {
          _id: '65f1a2b3c4d5e67890123099',
          alert_ref: 'ALT-20261006-0099',
          title: payload.title,
          message: payload.message,
          department: payload.department,
          severity: payload.severity,
          status: payload.status,
          is_active: true,
          action_required: payload.action_required,
          location: payload.location,
          guest_name: payload.guest_name,
          reported_by: payload.reported_by,
          assigned_to: payload.assigned_to,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          resolved_at: null,
        };
        alertsState = [newDoc, ...alertsState];
        return { success: true, data: { alert: newDoc } };
      });

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      expect(await screen.findByText('VIP Presidential Arrival - Final Amenity Placement')).toBeTruthy();

      // Open Broadcast Alert modal
      const broadcastBtn = screen.getByRole('button', { name: /Broadcast Alert/i });
      fireEvent.click(broadcastBtn);

      expect(screen.getByText('Dispatch Operations Alert')).toBeTruthy();

      // Fill controlled inputs
      const titleInput = screen.getByLabelText(/Alert Title \/ Summary\*/i);
      const locationInput = screen.getByLabelText(/Room \/ Location/i);
      const guestInput = screen.getByLabelText(/Guest Name/i);
      const assignedInput = screen.getByLabelText(/Assign To Staff/i);
      const actionInput = screen.getByLabelText(/Specific Action Required\*/i);
      const descInput = screen.getByLabelText(/Detailed Operational Instructions/i);

      fireEvent.change(titleInput, { target: { value: 'Elevator 3 Sensor Calibration Failure' } });
      fireEvent.change(locationInput, { target: { value: 'Tower B, Core Shaft' } });
      fireEvent.change(guestInput, { target: { value: 'Facility Wide' } });
      fireEvent.change(assignedInput, { target: { value: 'Engineering Lead (Sam)' } });
      fireEvent.change(actionInput, { target: { value: 'Lock out elevator 3 and recalibrate floor optical sensors.' } });
      fireEvent.change(descInput, { target: { value: 'Elevator 3 stopped level 2 inches above door threshold.' } });

      // Click submit
      const submitBtn = screen.getAllByRole('button', { name: /Broadcast Alert/i }).find(btn => btn.closest('.fixed'));
      expect(submitBtn).toBeTruthy();
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledTimes(1);
      });

      const payload = createSpy.mock.calls[0][0];

      // Verifications of outgoing payload
      expect(payload.title).toBe('Elevator 3 Sensor Calibration Failure');
      expect(payload.message).toBe('Elevator 3 stopped level 2 inches above door threshold.');
      expect(payload.department).toBe('VIP_ARRIVALS'); // default selected department
      expect(payload.severity).toBe('HIGH'); // default selected severity
      expect(payload.status).toBe('OPEN');
      expect(payload.location).toBe('Tower B, Core Shaft');
      expect(payload.guest_name).toBe('Facility Wide');
      expect(payload.assigned_to).toBe('Engineering Lead (Sam)');
      expect(payload.action_required).toBe('Lock out elevator 3 and recalibrate floor optical sensors.');

      // Server-owned fields MUST NOT be present
      expect(payload._id).toBeUndefined();
      expect(payload.alert_ref).toBeUndefined();
      expect(payload.created_at).toBeUndefined();
      expect(payload.updated_at).toBeUndefined();
      expect(payload.resolved_at).toBeUndefined();
      expect(payload.is_active).toBeUndefined();
      expect(payload.hotelId).toBeUndefined();
      expect(payload.tenantId).toBeUndefined();

      // UI reflects created alert from backend response
      expect(await screen.findByText('Elevator 3 Sensor Calibration Failure')).toBeTruthy();
      expect(screen.getByText('ALT-20261006-0099')).toBeTruthy();
    });

    it('shows error banner in modal if createOperationsAlert fails', async () => {
      vi.spyOn(operationsAlertService, 'getOperationsAlerts').mockResolvedValue({
        data: sampleBackendAlerts,
      });
      vi.spyOn(operationsAlertService, 'createOperationsAlert').mockRejectedValue(
        new Error('Validation failed: Title is invalid')
      );

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      expect(await screen.findByText('VIP Presidential Arrival - Final Amenity Placement')).toBeTruthy();

      // Open modal
      fireEvent.click(screen.getByRole('button', { name: /Broadcast Alert/i }));

      // Fill title
      fireEvent.change(screen.getByLabelText(/Alert Title \/ Summary\*/i), {
        target: { value: 'Short' },
      });

      // Submit
      const submitBtn = screen.getAllByRole('button', { name: /Broadcast Alert/i }).find(btn => btn.closest('.fixed'));
      fireEvent.click(submitBtn);

      // Modal error message displayed
      expect(await screen.findByText('Validation failed: Title is invalid')).toBeTruthy();
    });
  });

  describe('3. Lifecycle Actions (Escalate, Acknowledge, Resolve)', () => {
    it('escalates alert urgency via PATCH with CRITICAL severity', async () => {
      let alertsState = [...sampleBackendAlerts];
      vi.spyOn(operationsAlertService, 'getOperationsAlerts').mockImplementation(async () => ({
        data: alertsState,
      }));

      const updateSpy = vi.spyOn(operationsAlertService, 'updateOperationsAlert').mockImplementation(async (id, payload) => {
        alertsState = alertsState.map(a => {
          if (a._id === id) {
            return { ...a, severity: payload.severity };
          }
          return a;
        });
        const updated = alertsState.find(a => a._id === id);
        return { success: true, data: { alert: updated } };
      });

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      expect(await screen.findByText('AC Cooling Malfunction in Deluxe Ocean Suite')).toBeTruthy();

      // Click "Escalate Urgency" on second alert (which has severity HIGH)
      const escalateBtn = screen.getByRole('button', { name: /Escalate Urgency/i });
      fireEvent.click(escalateBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledTimes(1);
      });

      const [calledId, calledPayload] = updateSpy.mock.calls[0];
      expect(calledId).toBe('65f1a2b3c4d5e67890123002');
      expect(calledPayload).toEqual({ severity: 'CRITICAL' });

      // After update, critical count updates
      await waitFor(() => {
        expect(screen.queryByText('Escalate Urgency')).toBeNull();
      });
    });

    it('acknowledges open alert via PATCH with IN_PROGRESS status', async () => {
      let alertsState = [...sampleBackendAlerts];
      vi.spyOn(operationsAlertService, 'getOperationsAlerts').mockImplementation(async () => ({
        data: alertsState,
      }));

      const updateSpy = vi.spyOn(operationsAlertService, 'updateOperationsAlert').mockImplementation(async (id, payload) => {
        alertsState = alertsState.map(a => {
          if (a._id === id) {
            return { ...a, status: payload.status };
          }
          return a;
        });
        const updated = alertsState.find(a => a._id === id);
        return { success: true, data: { alert: updated } };
      });

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      expect(await screen.findByText('VIP Presidential Arrival - Final Amenity Placement')).toBeTruthy();

      // Click "Acknowledge" on first alert (which has status OPEN)
      const ackBtn = screen.getByRole('button', { name: /Acknowledge/i });
      fireEvent.click(ackBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledTimes(1);
      });

      const [calledId, calledPayload] = updateSpy.mock.calls[0];
      expect(calledId).toBe('65f1a2b3c4d5e67890123001');
      expect(calledPayload).toEqual({ status: 'IN_PROGRESS' });
    });

    it('marks alert resolved via PATCH with RESOLVED status and updates lifecycle display', async () => {
      let alertsState = [...sampleBackendAlerts];
      vi.spyOn(operationsAlertService, 'getOperationsAlerts').mockImplementation(async () => ({
        data: alertsState,
      }));

      const updateSpy = vi.spyOn(operationsAlertService, 'updateOperationsAlert').mockImplementation(async (id, payload) => {
        alertsState = alertsState.map(a => {
          if (a._id === id) {
            return {
              ...a,
              status: payload.status,
              is_active: false,
              resolved_at: new Date().toISOString(),
            };
          }
          return a;
        });
        const updated = alertsState.find(a => a._id === id);
        return { success: true, data: { alert: updated } };
      });

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      expect(await screen.findByText('AC Cooling Malfunction in Deluxe Ocean Suite')).toBeTruthy();

      // Click "Mark Resolved" on second alert
      const markResolvedBtns = screen.getAllByRole('button', { name: /Mark Resolved/i });
      fireEvent.click(markResolvedBtns[0]);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledTimes(1);
      });

      const [calledId, calledPayload] = updateSpy.mock.calls[0];
      expect(calledId).toBe('65f1a2b3c4d5e67890123001');
      expect(calledPayload).toEqual({ status: 'RESOLVED' });
    });
  });

  describe('4. Search & Client Filters', () => {
    it('filters alerts by search query across title, room/location, and staff', async () => {
      vi.spyOn(operationsAlertService, 'getOperationsAlerts').mockResolvedValue({
        data: sampleBackendAlerts,
      });

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      expect(await screen.findByText('VIP Presidential Arrival - Final Amenity Placement')).toBeTruthy();
      expect(screen.getByText('AC Cooling Malfunction in Deluxe Ocean Suite')).toBeTruthy();

      // Search by location
      const searchInput = screen.getByPlaceholderText(/Search alerts by task/i);
      fireEvent.change(searchInput, { target: { value: 'Presidential Suite' } });

      expect(screen.getByText('VIP Presidential Arrival - Final Amenity Placement')).toBeTruthy();
      expect(screen.queryByText('AC Cooling Malfunction in Deluxe Ocean Suite')).toBeNull();

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('AC Cooling Malfunction in Deluxe Ocean Suite')).toBeTruthy();
    });

    it('filters alerts by department when clicking load button', async () => {
      vi.spyOn(operationsAlertService, 'getOperationsAlerts').mockResolvedValue({
        data: sampleBackendAlerts,
      });

      render(
        <MemoryRouter>
          <OperationsAlerts />
        </MemoryRouter>
      );

      expect(await screen.findByText('VIP Presidential Arrival - Final Amenity Placement')).toBeTruthy();

      // Click "Maintenance" department card
      const maintenanceBtn = screen.getAllByRole('button', { name: /Maintenance/i })[0];
      fireEvent.click(maintenanceBtn);

      // Only maintenance alert visible
      expect(screen.getByText('AC Cooling Malfunction in Deluxe Ocean Suite')).toBeTruthy();
      expect(screen.queryByText('VIP Presidential Arrival - Final Amenity Placement')).toBeNull();
      expect(screen.queryByText('Priority Turnover - Villa 108')).toBeNull();

      // Click Reset
      const resetBtn = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(resetBtn);

      expect(screen.getByText('VIP Presidential Arrival - Final Amenity Placement')).toBeTruthy();
      expect(screen.getByText('Priority Turnover - Villa 108')).toBeTruthy();
    });
  });
});
