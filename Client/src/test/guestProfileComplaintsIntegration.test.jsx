import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GuestProfile from '../features/guests/pages/GuestProfile.jsx';
import { guestService } from '../services/guestService.js';
import { complaintService } from '../services/complaintService.js';
import { roomService } from '../services/roomService.js';

describe('Phase 5 Step 5: Guest Profile Complaints Backend Integration Tests', () => {
  const canonicalGuestId = '6ac4d15f26af300cd8e56f57';
  const canonicalRoomId = '6ac4d14b26af300cd8e56f56';
  const canonicalComplaintId = '6ac4e21a26af300cd8e56f88';

  const mockBackendGuest = {
    _id: canonicalGuestId,
    guest_ref: 'GST-2026-001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    city: 'San Francisco',
    country: 'USA',
    status: 'Active',
    created_at: '2026-05-18T10:00:00.000Z'
  };

  const mockBackendRooms = [
    {
      _id: canonicalRoomId,
      room_number: '101',
      floor: 1,
      status: 'AVAILABLE'
    }
  ];

  const mockBackendComplaints = [
    {
      _id: canonicalComplaintId,
      complaint_ref: 'CMP-20261006-A101',
      guest_id: {
        _id: canonicalGuestId,
        first_name: 'John',
        last_name: 'Doe',
        guest_ref: 'GST-2026-001'
      },
      room_id: {
        _id: canonicalRoomId,
        room_number: '101'
      },
      category: 'PLUMBING',
      severity: 'HIGH',
      status: 'OPEN',
      description: 'Water leak under sink in bathroom',
      created_at: '2026-10-06T10:00:00.000Z'
    }
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    vi.spyOn(guestService, 'getGuestById').mockResolvedValue({
      statusCode: 200,
      data: mockBackendGuest,
      success: true
    });

    vi.spyOn(roomService, 'getRooms').mockResolvedValue({
      statusCode: 200,
      data: mockBackendRooms,
      success: true
    });
  });

  const renderProfileOnComplaintsTab = async (guestId = canonicalGuestId) => {
    const utils = render(
      <MemoryRouter initialEntries={[`/guests/${guestId}?tab=requests-complaints`]}>
        <Routes>
          <Route path="/guests/:id" element={<GuestProfile />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText(/loading guest\.\.\./i)).not.toBeInTheDocument();
    });
    const tabBtn = screen.getByRole('tab', { name: /requests & complaints/i });
    fireEvent.click(tabBtn);
    return utils;
  };

  // ─── 1. READ MIGRATION & ADAPTATION ─────────────────────────────────────────
  describe('1. Read Migration & Authoritative Fetching', () => {
    it('calls complaintService.getComplaints with canonical guest_id, adapts data, and renders ticket row', async () => {
      const getSpy = vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        statusCode: 200,
        data: mockBackendComplaints,
        success: true
      });

      await renderProfileOnComplaintsTab();

      await waitFor(() => {
        expect(getSpy).toHaveBeenCalledWith({ guest_id: canonicalGuestId });
      });

      await waitFor(() => {
        expect(screen.queryByText(/loading complaints\.\.\./i)).not.toBeInTheDocument();
      });

      // Verify rendered complaint details
      await waitFor(() => {
        expect(screen.getByText('#CMP-20261006-A101')).toBeInTheDocument();
        expect(screen.getByText('Plumbing')).toBeInTheDocument();
        expect(screen.getByText(/Room 101/)).toBeInTheDocument();
        expect(screen.getByText('Water leak under sink in bathroom')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getAllByText('Open').length).toBeGreaterThan(0);
      });
    });

    it('renders legitimate empty state when backend returns empty complaints array without static fallback', async () => {
      vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        statusCode: 200,
        data: [],
        success: true
      });

      await renderProfileOnComplaintsTab();

      await waitFor(() => {
        expect(screen.getByText('No requests or complaints found')).toBeInTheDocument();
        expect(screen.getByText('No issues or service requests have been registered for this guest.')).toBeInTheDocument();
      });

      // Assert legacy demo complaints are NOT rendered
      expect(screen.queryByText(/Leaking tap in bathroom/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Waitlight not functioning/i)).not.toBeInTheDocument();
    });

    it('displays error state and provides functional Retry button on API failure', async () => {
      const getSpy = vi.spyOn(complaintService, 'getComplaints')
        .mockRejectedValueOnce(new Error('Backend complaint cluster unavailable'))
        .mockResolvedValueOnce({
          statusCode: 200,
          data: mockBackendComplaints,
          success: true
        });

      await renderProfileOnComplaintsTab();

      await waitFor(() => {
        expect(screen.getByText('Backend complaint cluster unavailable')).toBeInTheDocument();
      });

      // Click retry
      const retryBtn = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('#CMP-20261006-A101')).toBeInTheDocument();
      });

      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });

  // ─── 2. CREATE WORKFLOW ─────────────────────────────────────────────────────
  describe('2. Create Workflow Migration', () => {
    it('creates complaint using canonical guest_id, mapped room_id, canonical enums, and no synthetic IDs', async () => {
      let complaintsState = [...mockBackendComplaints];

      vi.spyOn(complaintService, 'getComplaints').mockImplementation(async () => ({
        statusCode: 200,
        data: complaintsState,
        success: true
      }));

      const createSpy = vi.spyOn(complaintService, 'createComplaint').mockImplementation(async (payload) => {
        const newComplaint = {
          _id: '6ac4e21a26af300cd8e56f99',
          complaint_ref: 'CMP-20261006-NEW1',
          guest_id: {
            _id: payload.guest_id,
            first_name: 'John',
            last_name: 'Doe'
          },
          room_id: {
            _id: payload.room_id,
            room_number: '101'
          },
          category: payload.category,
          severity: payload.severity,
          status: 'OPEN',
          description: payload.description,
          created_at: '2026-10-06T12:00:00.000Z'
        };
        complaintsState = [newComplaint, ...complaintsState];
        return { statusCode: 201, data: newComplaint, success: true };
      });

      await renderProfileOnComplaintsTab();

      // Click New Ticket
      const newTicketBtn = screen.getByRole('button', { name: /new ticket/i });
      fireEvent.click(newTicketBtn);

      await waitFor(() => {
        expect(screen.getByText('New Guest Request / Complaint')).toBeInTheDocument();
      });

      // Fill in form details
      const descInput = screen.getByPlaceholderText(/Provide specific details about the guest/i);
      fireEvent.change(descInput, { target: { value: 'A/C is making strange rattling noise' } });

      // Submit form
      const submitBtn = screen.getByRole('button', { name: /submit ticket/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalled();
      });

      const calledPayload = createSpy.mock.calls[0][0];

      // Verification of Canonical Contract
      expect(calledPayload.guest_id).toBe(canonicalGuestId);
      expect(calledPayload.room_id).toBe(canonicalRoomId);
      expect(calledPayload.category).toBe('HOUSEKEEPING');
      expect(calledPayload.severity).toBe('MEDIUM');
      expect(calledPayload.description).toBe('A/C is making strange rattling noise');

      // Verification of Prohibited synthetic fields
      expect(calledPayload.complaint_ref).toBeUndefined();
      expect(calledPayload._id).toBeUndefined();
      expect(calledPayload.id).toBeUndefined();
      expect(calledPayload.created_at).toBeUndefined();
      expect(calledPayload.resolved_at).toBeUndefined();

      // New ticket appears in UI
      await waitFor(() => {
        expect(screen.getByText('#CMP-20261006-NEW1')).toBeInTheDocument();
      });
    });
  });

  // ─── 3. UPDATE WORKFLOW ─────────────────────────────────────────────────────
  describe('3. Update Workflow Migration', () => {
    it('marks complaint resolved via complaintService.updateComplaint with PATCH and immutable fields stripped', async () => {
      let complaintsState = [...mockBackendComplaints];

      vi.spyOn(complaintService, 'getComplaints').mockImplementation(async () => ({
        statusCode: 200,
        data: complaintsState,
        success: true
      }));

      const updateSpy = vi.spyOn(complaintService, 'updateComplaint').mockImplementation(async (id, payload) => {
        complaintsState = complaintsState.map((c) =>
          c._id === id ? { ...c, status: payload.status, resolved_at: '2026-10-06T13:00:00.000Z' } : c
        );
        return { statusCode: 200, data: complaintsState[0], success: true };
      });

      await renderProfileOnComplaintsTab();

      await waitFor(() => {
        expect(screen.getByText('Mark Resolved')).toBeInTheDocument();
      });

      // Click Mark Resolved
      const markResolvedBtn = screen.getByText('Mark Resolved');
      fireEvent.click(markResolvedBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith(
          canonicalComplaintId,
          expect.objectContaining({ status: 'RESOLVED' })
        );
      });

      const sentPayload = updateSpy.mock.calls[0][1];
      expect(sentPayload.guest_id).toBeUndefined();
      expect(sentPayload.complaint_ref).toBeUndefined();
      expect(sentPayload._id).toBeUndefined();
      expect(sentPayload.created_at).toBeUndefined();
      expect(sentPayload.resolved_at).toBeUndefined();

      // UI updates to Completed / Resolved
      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });
    });
  });

  // ─── 4. LOCALSTORAGE PURGE GATE ─────────────────────────────────────────────
  describe('4. LocalStorage Purge Gate', () => {
    it('does not read or write hotel_complaints in localStorage during operations', async () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      // Seed stale demo complaint in localStorage
      localStorage.setItem('hotel_complaints', JSON.stringify([
        {
          id: 999,
          guestId: canonicalGuestId,
          description: 'STALE LOCALSTORAGE RECORD THAT MUST BE IGNORED',
          status: 'Open'
        }
      ]));

      // Reset spies after seed
      getItemSpy.mockClear();
      setItemSpy.mockClear();

      vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        statusCode: 200,
        data: mockBackendComplaints,
        success: true
      });

      await renderProfileOnComplaintsTab();

      await waitFor(() => {
        expect(screen.getByText('#CMP-20261006-A101')).toBeInTheDocument();
      });

      // Prove hotel_complaints was NEVER accessed
      const getItemCalls = getItemSpy.mock.calls.map((c) => c[0]);
      const setItemCalls = setItemSpy.mock.calls.map((c) => c[0]);

      expect(getItemCalls).not.toContain('hotel_complaints');
      expect(setItemCalls).not.toContain('hotel_complaints');
      expect(screen.queryByText('STALE LOCALSTORAGE RECORD THAT MUST BE IGNORED')).not.toBeInTheDocument();
    });
  });
});
