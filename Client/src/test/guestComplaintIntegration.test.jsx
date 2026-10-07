import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GuestComplaint from '../features/front-office/pages/GuestComplaint';
import complaintService from '../services/complaintService';
import guestService from '../services/guestService';
import roomService from '../services/roomService';

describe('Phase 5 Step 4: Front Office Guest Complaint Backend Integration Tests', () => {
  const mockMongoGuestId = '65a1b2c3d4e5f67890123001';
  const mockMongoRoomId = '65d1e2f3a4b5678901234001';

  const sampleBackendComplaints = [
    {
      _id: '65b1c2d3e4f5678901234501',
      complaint_ref: 'CMP-20261006-A101',
      category: 'PLUMBING',
      severity: 'MEDIUM',
      status: 'OPEN',
      description: 'Leaking pipe under the bathroom sink',
      created_at: '2026-10-06T10:00:00.000Z',
      resolved_at: null,
      guest_id: {
        _id: mockMongoGuestId,
        guest_ref: 'GST-9001',
        first_name: 'Arthur',
        last_name: 'Dent',
        email: 'arthur@galaxy.org',
        phone: '+44 7700 900077',
      },
      room_id: {
        _id: mockMongoRoomId,
        room_number: '101',
        floor: '1',
        status: 'OCCUPIED',
      },
      reservation_id: {
        _id: '65c1d2e3f4a5678901234001',
        booking_ref: 'RES-5001',
        status: 'IN_HOUSE',
      },
    },
    {
      _id: '65b1c2d3e4f5678901234502',
      complaint_ref: 'CMP-20261006-B202',
      category: 'AIR_CONDITIONING',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      description: 'AC unit making loud grinding noise',
      created_at: '2026-10-06T11:00:00.000Z',
      resolved_at: null,
      guest_id: {
        _id: '65a1b2c3d4e5f67890123002',
        guest_ref: 'GST-9002',
        first_name: 'Trillian',
        last_name: 'Astra',
        email: 'trillian@galaxy.org',
        phone: '+44 7700 900088',
      },
      room_id: {
        _id: '65d1e2f3a4b5678901234002',
        room_number: '202',
        floor: '2',
        status: 'OCCUPIED',
      },
    },
  ];

  const sampleGuests = [
    {
      _id: mockMongoGuestId,
      first_name: 'Arthur',
      last_name: 'Dent',
      name: 'Arthur Dent',
      guest_ref: 'GST-9001',
      email: 'arthur@galaxy.org',
    },
    {
      _id: '65a1b2c3d4e5f67890123002',
      first_name: 'Trillian',
      last_name: 'Astra',
      name: 'Trillian Astra',
      guest_ref: 'GST-9002',
      email: 'trillian@galaxy.org',
    },
  ];

  const sampleRooms = [
    {
      _id: mockMongoRoomId,
      room_number: '101',
      roomNo: '101',
      roomType: 'Standard Room',
    },
    {
      _id: '65d1e2f3a4b5678901234002',
      room_number: '202',
      roomNo: '202',
      roomType: 'Deluxe Room',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({ data: sampleGuests });
    vi.spyOn(roomService, 'getRooms').mockResolvedValue({ data: sampleRooms });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Initial Load & States (Read)', () => {
    it('displays loading state, loads backend complaints, adapts data, and renders rows', async () => {
      vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        data: sampleBackendComplaints,
      });

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      // Loading state visible initially
      expect(screen.getByText('Loading guest complaints...')).toBeTruthy();

      // Successfully renders mapped backend data
      expect(await screen.findByText('Arthur Dent')).toBeTruthy();
      expect(screen.getByText('Trillian Astra')).toBeTruthy();
      expect(screen.getByText('101')).toBeTruthy();
      expect(screen.getByText('202')).toBeTruthy();
      expect(screen.getByText('Plumbing')).toBeTruthy();
      expect(screen.getByText('Air Conditioning')).toBeTruthy();
      expect(screen.getByText('In Progress')).toBeTruthy();
    });

    it('renders genuine empty state when backend returns empty array without mock fallback', async () => {
      vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        data: [],
      });

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      expect(await screen.findByText('No complaints found.')).toBeTruthy();
      // Ensure legacy hardcoded data is NOT displayed
      expect(screen.queryByText('John Doe')).toBeNull();
      expect(screen.queryByText('Jane Smith')).toBeNull();
    });

    it('renders error banner with functional Retry button on backend failure without mock fallback', async () => {
      const getSpy = vi.spyOn(complaintService, 'getComplaints')
        .mockRejectedValueOnce(new Error('Network error connecting to complaints service'))
        .mockResolvedValueOnce({ data: sampleBackendComplaints });

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      // Error message rendered
      const alertEl = await screen.findByRole('alert');
      expect(alertEl).toBeTruthy();
      expect(alertEl.textContent).toContain('Network error connecting to complaints service');
      expect(screen.queryByText('John Doe')).toBeNull();

      // Click Retry button
      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      fireEvent.click(retryBtn);

      // Successfully retries and renders data
      expect(await screen.findByText('Arthur Dent')).toBeTruthy();
      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('2. Create Complaint Workflow', () => {
    it('creates a complaint with canonical guest_id, canonical room_id, and mapped enums', async () => {
      let complaintsState = [...sampleBackendComplaints];
      vi.spyOn(complaintService, 'getComplaints').mockImplementation(async () => ({
        data: complaintsState,
      }));

      const createSpy = vi.spyOn(complaintService, 'createComplaint').mockImplementation(async (payload) => {
        const newRecord = {
          _id: '65b1c2d3e4f5678901234599',
          complaint_ref: 'CMP-20261006-NEW1',
          category: payload.category,
          severity: payload.severity,
          status: payload.status,
          description: payload.description,
          created_at: new Date().toISOString(),
          resolved_at: null,
          guest_id: {
            _id: payload.guest_id,
            first_name: 'Arthur',
            last_name: 'Dent',
          },
          room_id: {
            _id: payload.room_id,
            room_number: '101',
          },
        };
        complaintsState = [newRecord, ...complaintsState];
        return { data: newRecord };
      });

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      expect(await screen.findByText('Arthur Dent')).toBeTruthy();

      // Open Add Complaint modal
      const addBtn = screen.getByTitle('Add Complaint');
      fireEvent.click(addBtn);

      expect(screen.getByText('New Complaint')).toBeTruthy();

      // Fill in form fields
      const guestInput = screen.getByPlaceholderText(/Search or select guest/i);
      const roomInput = screen.getByPlaceholderText(/Enter or select room/i);
      const descInput = screen.getByLabelText(/Description\*/i);

      fireEvent.change(guestInput, { target: { value: 'Arthur Dent' } });
      fireEvent.change(roomInput, { target: { value: '101' } });
      fireEvent.change(descInput, { target: { value: 'Cold water tap running hot unexpectedly' } });

      // Save complaint
      const saveBtn = screen.getByRole('button', { name: 'Save' });
      expect(saveBtn).not.toBeDisabled();
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledTimes(1);
      });

      const payload = createSpy.mock.calls[0][0];

      // Verifications of payload integrity
      expect(payload.guest_id).toBe(mockMongoGuestId);
      expect(payload.room_id).toBe(mockMongoRoomId);
      expect(payload.category).toBe('GENERAL');
      expect(payload.severity).toBe('LOW');
      expect(payload.status).toBe('OPEN');
      expect(payload.description).toBe('Cold water tap running hot unexpectedly');

      // Immutable & server-controlled fields must NOT be present
      expect(payload._id).toBeUndefined();
      expect(payload.complaint_ref).toBeUndefined();
      expect(payload.created_at).toBeUndefined();
      expect(payload.resolved_at).toBeUndefined();

      // New complaint appears in table
      expect(await screen.findByText('Cold water tap running hot unexpectedly')).toBeTruthy();
    });

    it('rejects creation if guest is not registered in system and shows modal validation error', async () => {
      vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        data: sampleBackendComplaints,
      });
      const createSpy = vi.spyOn(complaintService, 'createComplaint');

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      expect(await screen.findByText('Arthur Dent')).toBeTruthy();

      // Open Add Complaint modal
      fireEvent.click(screen.getByTitle('Add Complaint'));

      // Enter unregistered guest name
      fireEvent.change(screen.getByPlaceholderText(/Search or select guest/i), {
        target: { value: 'Unregistered Unknown Person' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Enter or select room/i), {
        target: { value: '101' },
      });
      fireEvent.change(screen.getByLabelText(/Description\*/i), {
        target: { value: 'Something broken' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      // Inline validation error displayed
      expect(await screen.findByText(/Please select a valid registered guest/i)).toBeTruthy();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('3. Edit / Update Workflow', () => {
    it('updates complaint via PATCH with clean payload without sending immutable fields', async () => {
      let complaintsState = [...sampleBackendComplaints];
      vi.spyOn(complaintService, 'getComplaints').mockImplementation(async () => ({
        data: complaintsState,
      }));

      const updateSpy = vi.spyOn(complaintService, 'updateComplaint').mockImplementation(async (id, payload) => {
        complaintsState = complaintsState.map(c => {
          if (c._id === id) {
            return {
              ...c,
              category: payload.category || c.category,
              severity: payload.severity || c.severity,
              status: payload.status || c.status,
              description: payload.description || c.description,
            };
          }
          return c;
        });
        return { data: complaintsState.find(c => c._id === id) };
      });

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      expect(await screen.findByText('Arthur Dent')).toBeTruthy();

      // Click Edit icon on first complaint
      const editBtns = screen.getAllByTitle('Edit Complaint');
      fireEvent.click(editBtns[0]);

      expect(await screen.findByText(/Edit Complaint — Arthur Dent/i)).toBeTruthy();

      // Change description and status
      const descInput = screen.getByLabelText(/Description\*/i);
      fireEvent.change(descInput, { target: { value: 'Plumber repaired the leak completely' } });

      const statusSelect = screen.getByLabelText(/Status\*/i);
      fireEvent.change(statusSelect, { target: { value: 'Resolved' } });

      // Save changes
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledTimes(1);
      });

      const [calledId, updatePayload] = updateSpy.mock.calls[0];
      expect(calledId).toBe('65b1c2d3e4f5678901234501');
      expect(updatePayload.status).toBe('RESOLVED');
      expect(updatePayload.description).toBe('Plumber repaired the leak completely');

      // Critical: Immutable fields must NOT be in the PATCH payload
      expect(updatePayload.guest_id).toBeUndefined();
      expect(updatePayload.complaint_ref).toBeUndefined();
      expect(updatePayload._id).toBeUndefined();
      expect(updatePayload.created_at).toBeUndefined();
      expect(updatePayload.resolved_at).toBeUndefined();

      // Table reflects updated values
      expect(await screen.findByText('Plumber repaired the leak completely')).toBeTruthy();
      expect(screen.getByText('Resolved')).toBeTruthy();
    });
  });

  describe('4. Delete Workflow', () => {
    it('opens confirmation modal, calls deleteComplaint API, and removes record from table', async () => {
      let complaintsState = [...sampleBackendComplaints];
      vi.spyOn(complaintService, 'getComplaints').mockImplementation(async () => ({
        data: complaintsState,
      }));

      const deleteSpy = vi.spyOn(complaintService, 'deleteComplaint').mockImplementation(async (id) => {
        complaintsState = complaintsState.filter(c => c._id !== id);
        return { success: true };
      });

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      expect(await screen.findByText('Arthur Dent')).toBeTruthy();

      // Click Delete on first row
      const deleteBtns = screen.getAllByTitle('Delete Complaint');
      fireEvent.click(deleteBtns[0]);

      // Confirm modal appears with complaint details
      expect(screen.getByText('Are you sure?')).toBeTruthy();
      expect(screen.getAllByText('Arthur Dent').length).toBeGreaterThan(0);
      expect(screen.getAllByText('101').length).toBeGreaterThan(0);

      // Click Delete in modal
      const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete' });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith('65b1c2d3e4f5678901234501');
      });

      // Record is removed
      await waitFor(() => {
        expect(screen.queryByText('Leaking pipe under the bathroom sink')).toBeNull();
      });
      // Other complaint remains
      expect(screen.getByText('Trillian Astra')).toBeTruthy();
    });

    it('handles 403 Forbidden permission error cleanly with appropriate message', async () => {
      vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        data: sampleBackendComplaints,
      });

      const forbiddenError = new Error('Forbidden');
      forbiddenError.status = 403;
      vi.spyOn(complaintService, 'deleteComplaint').mockRejectedValue(forbiddenError);

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      expect(await screen.findByText('Arthur Dent')).toBeTruthy();

      fireEvent.click(screen.getAllByTitle('Delete Complaint')[0]);
      expect(screen.getByText('Are you sure?')).toBeTruthy();

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

      // Permission error rendered
      expect(await screen.findByText(/Permission denied: You do not have permission to delete complaints/i)).toBeTruthy();
      // Record not deleted
      expect(screen.getAllByText('Arthur Dent').length).toBeGreaterThan(0);
    });
  });

  describe('5. Search, Filter & Refresh', () => {
    it('filters complaint list by text query across guest, room, type, and description', async () => {
      vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        data: sampleBackendComplaints,
      });

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      expect(await screen.findByText('Arthur Dent')).toBeTruthy();
      expect(screen.getByText('Trillian Astra')).toBeTruthy();

      // Search by guest name
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Astra' } });

      expect(screen.queryByText('Arthur Dent')).toBeNull();
      expect(screen.getByText('Trillian Astra')).toBeTruthy();

      // Search by complaint description
      fireEvent.change(searchInput, { target: { value: 'grinding' } });
      expect(screen.queryByText('Arthur Dent')).toBeNull();
      expect(screen.getByText('Trillian Astra')).toBeTruthy();

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Arthur Dent')).toBeTruthy();
      expect(screen.getByText('Trillian Astra')).toBeTruthy();
    });

    it('refreshes complaints from backend and clears search when Refresh is clicked', async () => {
      const getSpy = vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        data: sampleBackendComplaints,
      });

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      expect(await screen.findByText('Arthur Dent')).toBeTruthy();

      // Set search query
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Dent' } });
      expect(searchInput.value).toBe('Dent');

      // Click refresh button
      const refreshBtn = screen.getByTitle('Refresh');
      fireEvent.click(refreshBtn);

      await waitFor(() => {
        expect(getSpy).toHaveBeenCalledTimes(2);
      });
      expect(searchInput.value).toBe('');
      expect(screen.getByText('Trillian Astra')).toBeTruthy();
    });
  });

  describe('6. View Complaint Modal', () => {
    it('opens view modal showing complaint ref, guest name, status, and full details', async () => {
      vi.spyOn(complaintService, 'getComplaints').mockResolvedValue({
        data: sampleBackendComplaints,
      });

      render(
        <MemoryRouter>
          <GuestComplaint />
        </MemoryRouter>
      );

      expect(await screen.findByText('Arthur Dent')).toBeTruthy();

      // Click row to open view modal
      fireEvent.click(screen.getByText('Arthur Dent'));

      // View modal contains details
      expect(screen.getAllByText('CMP-20261006-A101').length).toBeGreaterThan(0);
      expect(screen.getByText('Complaint Reference')).toBeTruthy();
      expect(screen.getAllByText('Leaking pipe under the bathroom sink').length).toBeGreaterThan(0);

      // Close modal
      fireEvent.click(screen.getByTitle('Close'));
      await waitFor(() => {
        expect(screen.queryByText('Complaint Reference')).toBeNull();
      });
    });
  });
});
