import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import GroupReservations from '../features/reservations/pages/GroupReservations';
import reservationService from '../services/reservationService';
import {
  toFrontendGroupReservation,
  toBackendGroupReservationPayload,
} from '../features/reservations/adapters/reservationAdapter';

describe('Group Reservations Backend Integration & Adapter Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleBackendGroups = [
    {
      _id: '67a1b2c3d4e5f67890123991',
      group_ref: 'GRP-LIVE-001',
      name: 'Tech Innovators Summit',
      contact_person: 'Elena Rostova',
      email: 'elena@techsummit.io',
      phone: '+14155550199',
      expected_check_in: '2026-11-15T00:00:00.000Z',
      expected_check_out: '2026-11-20T00:00:00.000Z',
      rooms_count: 10,
      total_guests: 20,
      room_types: 'Standard',
      status: 'CONFIRMED',
      total_price: 12500,
      billing_instructions: 'Bill room charges to company master folio',
      created_at: '2026-10-01T10:00:00.000Z',
    },
    {
      _id: '67a1b2c3d4e5f67890123992',
      group_ref: 'GRP-LIVE-002',
      name: 'Medical Symposium',
      contact_person: 'Dr. Marcus Vance',
      email: 'marcus@medsymp.org',
      phone: '+14155550188',
      expected_check_in: '2026-11-15T00:00:00.000Z',
      expected_check_out: '2026-11-19T00:00:00.000Z',
      rooms_count: 5,
      total_guests: 8,
      room_types: 'Delux',
      status: 'PENDING',
      total_price: 6400,
      billing_instructions: 'Individual guest pay incidentals',
      created_at: '2026-10-02T10:00:00.000Z',
    },
  ];

  describe('Adapter unit transformation tests', () => {
    it('toFrontendGroupReservation correctly converts backend document to UI model', () => {
      const adapted = toFrontendGroupReservation(sampleBackendGroups[0]);

      expect(adapted.id).toBe('67a1b2c3d4e5f67890123991');
      expect(adapted.groupName).toBe('Tech Innovators Summit');
      expect(adapted.contactPerson).toBe('Elena Rostova');
      expect(adapted.email).toBe('elena@techsummit.io');
      expect(adapted.phone).toBe('+14155550199');
      expect(adapted.checkIn).toBe('2026-11-15');
      expect(adapted.checkOut).toBe('2026-11-20');
      expect(adapted.rooms).toBe(10);
      expect(adapted.guests).toBe(20);
      expect(adapted.roomTypes).toBe('Standard');
      expect(adapted.status).toBe('Confirmed');
      expect(adapted.totalPrice).toBe(12500);
      expect(adapted.specialRequests).toBe('Bill room charges to company master folio');
    });

    it('toBackendGroupReservationPayload correctly formats UI form data for API', () => {
      const form = {
        groupName: 'Design Leaders Meetup',
        contactPerson: 'Sarah Jenkins',
        email: 'sarah@design.co',
        phone: '5551234567',
        checkIn: '2026-12-01',
        checkOut: '2026-12-04',
        rooms: 4,
        guests: 8,
        roomTypes: 'Delux',
        status: 'Confirmed',
        totalPrice: 4200,
        specialRequests: 'Conference room required',
      };

      const payload = toBackendGroupReservationPayload(form);

      expect(payload.name).toBe('Design Leaders Meetup');
      expect(payload.contact_person).toBe('Sarah Jenkins');
      expect(payload.email).toBe('sarah@design.co');
      expect(payload.phone).toBe('5551234567');
      expect(payload.expected_check_in).toBe(new Date('2026-12-01').toISOString());
      expect(payload.expected_check_out).toBe(new Date('2026-12-04').toISOString());
      expect(payload.rooms_count).toBe(4);
      expect(payload.total_guests).toBe(8);
      expect(payload.room_types).toBe('Delux');
      expect(payload.status).toBe('CONFIRMED');
      expect(payload.total_price).toBe(4200);
      expect(payload.billing_instructions).toBe('Conference room required');
    });
  });

  describe('UI Component Integration', () => {
    it('1. Loads backend group reservations and displays them in the table', async () => {
      vi.spyOn(reservationService, 'getGroupReservations').mockResolvedValue({
        success: true,
        data: sampleBackendGroups,
      });

      render(<GroupReservations />);

      await waitFor(() => {
        expect(reservationService.getGroupReservations).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Tech Innovators Summit')).toBeInTheDocument();
        expect(screen.getByText('Medical Symposium')).toBeInTheDocument();
        expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
        expect(screen.getByText('Dr. Marcus Vance')).toBeInTheDocument();
      });
    });

    it('2. Successfully creates a new group reservation via modal and re-fetches', async () => {
      vi.spyOn(reservationService, 'getGroupReservations').mockResolvedValue({
        success: true,
        data: sampleBackendGroups,
      });
      vi.spyOn(reservationService, 'createGroupReservation').mockResolvedValue({
        success: true,
        data: {
          _id: '67a1b2c3d4e5f67890123993',
          name: 'Annual Charity Gala',
          contact_person: 'Charles Bing',
          email: 'charles@gala.org',
          phone: '9998887777',
          status: 'PENDING',
        },
      });

      render(<GroupReservations />);

      await waitFor(() => {
        expect(screen.getByText('Tech Innovators Summit')).toBeInTheDocument();
      });

      // Click Add button
      const addButton = screen.getByTitle('New Group Booking');
      fireEvent.click(addButton);

      // Modal opens
      expect(screen.getByText('New Group Reservation')).toBeInTheDocument();

      // Fill in required fields
      const groupNameInput = screen.getByLabelText(/Group Name/i);
      const contactPersonInput = screen.getByLabelText(/Contact Person/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const phoneInput = screen.getByLabelText(/Phone/i);

      fireEvent.change(groupNameInput, { target: { value: 'Annual Charity Gala' } });
      fireEvent.change(contactPersonInput, { target: { value: 'Charles Bing' } });
      fireEvent.change(emailInput, { target: { value: 'charles@gala.org' } });
      fireEvent.change(phoneInput, { target: { value: '9998887777' } });

      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(reservationService.createGroupReservation).toHaveBeenCalled();
      });

      expect(reservationService.getGroupReservations).toHaveBeenCalledTimes(2);
    });

    it('3. Successfully cancels a group reservation and re-fetches', async () => {
      vi.spyOn(reservationService, 'getGroupReservations').mockResolvedValue({
        success: true,
        data: sampleBackendGroups,
      });
      vi.spyOn(reservationService, 'cancelGroupReservation').mockResolvedValue({
        success: true,
        message: 'Group reservation cancelled successfully',
      });

      render(<GroupReservations />);

      await waitFor(() => {
        expect(screen.getByText('Tech Innovators Summit')).toBeInTheDocument();
      });

      // Find cancel buttons in table
      const cancelButtons = screen.getAllByTitle(/Cancel Group Reservation/i);
      fireEvent.click(cancelButtons[0]);

      // Confirm cancel dialog
      const modalHeading = screen.getByText('Cancel Group Reservation?');
      expect(modalHeading).toBeInTheDocument();

      const modalDialog = modalHeading.closest('div');
      const confirmButton = within(modalDialog).getByRole('button', { name: /Confirm Cancellation/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(reservationService.cancelGroupReservation).toHaveBeenCalledWith(
          '67a1b2c3d4e5f67890123991',
          expect.any(String)
        );
      });

      expect(reservationService.getGroupReservations).toHaveBeenCalledTimes(2);
    });

    it('4. Surfaces error alert gracefully if backend fetch fails', async () => {
      vi.spyOn(reservationService, 'getGroupReservations').mockRejectedValue(
        new Error('Network Error: Database unreachable')
      );

      render(<GroupReservations />);

      await waitFor(() => {
        expect(screen.getByText(/Network Error: Database unreachable/i)).toBeInTheDocument();
      });
    });
  });
});
