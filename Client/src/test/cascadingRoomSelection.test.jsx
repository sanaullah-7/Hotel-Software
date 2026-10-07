import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  INITIAL_ROOMS,
  getRooms,
  getRoomsByRoomType,
  normalizeRoomType
} from '../features/rooms/state/roomStore';
import ReservationFormModal from '../features/reservations/components/ReservationFormModal';
import AddReservation from '../features/reservations/pages/AddReservation';
import { getReservations } from '../features/reservations/state/reservationStore';
import { checkInBooking } from '../features/reservations/state/reservationLifecycle';
import reservationService from '../services/reservationService';
import guestService from '../services/guestService';

describe('Cascading Room Type -> Room Number Selection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Canonical Room Inventory (roomStore.js)', () => {
    it('configures rooms 101, 102, 105, and 108 as Deluxe', () => {
      const rooms = getRooms();
      const deluxeRooms = rooms.filter((r) => normalizeRoomType(r.roomType) === 'deluxe');
      const deluxeNumbers = deluxeRooms.map((r) => String(r.roomNo)).sort();

      expect(deluxeNumbers).toEqual(['101', '102', '105', '108']);
    });

    it('filters rooms correctly using getRoomsByRoomType for both "Deluxe" and "Delux"', () => {
      const fromDeluxe = getRoomsByRoomType('Deluxe');
      const fromDelux = getRoomsByRoomType('Delux');

      const numbersFromDeluxe = fromDeluxe.map((r) => String(r.roomNo)).sort();
      const numbersFromDelux = fromDelux.map((r) => String(r.roomNo)).sort();

      expect(numbersFromDeluxe).toEqual(['101', '102', '105', '108']);
      expect(numbersFromDelux).toEqual(['101', '102', '105', '108']);
    });

    it('normalizes room type aliases consistently', () => {
      expect(normalizeRoomType('Deluxe')).toBe('deluxe');
      expect(normalizeRoomType('Delux')).toBe('deluxe');
      expect(normalizeRoomType('DELUXE')).toBe('deluxe');
      expect(normalizeRoomType('Super Deluxe')).toBe('super deluxe');
      expect(normalizeRoomType('Super Delux')).toBe('super deluxe');
    });
  });

  describe('ReservationFormModal Cascading UI', () => {
    it('renders cascading room options and badges [101] [102] [105] [108] when roomType is Deluxe Room', () => {
      const handleFormChange = vi.fn();

      render(
        <ReservationFormModal
          open={true}
          form={{ roomType: 'Deluxe Room', roomNo: '' }}
          onFormChange={handleFormChange}
          onClose={vi.fn()}
        />
      );

      // Verify Select Room Type is present
      const roomTypeSelect = screen.getByLabelText(/Select Room Type/i);
      expect(roomTypeSelect).toHaveProperty('id', 'res-room-type');
      expect(roomTypeSelect.value).toBe('Deluxe Room');

      // Verify Room Number select is present
      const roomNoSelect = screen.getByLabelText(/Room \/ Room No\./i);
      expect(roomNoSelect).toHaveProperty('id', 'res-room-no');

      // Verify Deluxe rooms are rendered in options
      const options = Array.from(roomNoSelect.querySelectorAll('option')).map((o) => o.value);
      expect(options).toContain('101');
      expect(options).toContain('102');
      expect(options).toContain('105');
      expect(options).toContain('108');

      // Verify quick-select buttons [101], [102], [105], [108]
      expect(screen.getByRole('button', { name: '[101]' })).toBeTruthy();
      expect(screen.getByRole('button', { name: '[102]' })).toBeTruthy();
      expect(screen.getByRole('button', { name: '[105]' })).toBeTruthy();
      expect(screen.getByRole('button', { name: '[108]' })).toBeTruthy();

      // Clicking quick-select button [105] triggers onFormChange with '105'
      fireEvent.click(screen.getByRole('button', { name: '[105]' }));
      expect(handleFormChange).toHaveBeenCalledWith('roomNo', '105');
    });

    it('updates room type and clears incompatible room selection on change', () => {
      const handleFormChange = vi.fn();

      render(
        <ReservationFormModal
          open={true}
          form={{ roomType: 'Standard Room', roomNo: '201' }}
          onFormChange={handleFormChange}
          onClose={vi.fn()}
        />
      );

      const roomTypeSelect = screen.getByLabelText(/Select Room Type/i);
      fireEvent.change(roomTypeSelect, { target: { value: 'Deluxe Room' } });

      expect(handleFormChange).toHaveBeenCalledWith('roomType', 'Deluxe Room');
      // Because '201' is not in Deluxe, roomNo is reset
      expect(handleFormChange).toHaveBeenCalledWith('roomNo', '');
    });
  });

  describe('AddReservation Standalone Page Cascading UI', () => {
    it('filters room options and renders quick select badges when Room Type is selected as Deluxe Room', () => {
      render(
        <MemoryRouter>
          <AddReservation />
        </MemoryRouter>
      );

      // Select Room Type combobox/select
      const roomTypeSelect = screen.getByRole('combobox', { name: /Select Room Type/i });
      expect(roomTypeSelect).toBeTruthy();

      // Change Room Type to Deluxe Room
      fireEvent.mouseDown(roomTypeSelect);
      const deluxeOption = screen.getByRole('option', { name: 'Deluxe Room' });
      fireEvent.click(deluxeOption);

      // Verify quick-select badges [101], [102], [105], [108] appear
      expect(screen.getByRole('button', { name: '[101]' })).toBeTruthy();
      expect(screen.getByRole('button', { name: '[102]' })).toBeTruthy();
      expect(screen.getByRole('button', { name: '[105]' })).toBeTruthy();
      expect(screen.getByRole('button', { name: '[108]' })).toBeTruthy();

      // Clicking badge [108] selects room
      fireEvent.click(screen.getByRole('button', { name: '[108]' }));
    });

    it('persists canonical roomId and room snapshots on submission and allows downstream check-in', async () => {
      const canonicalRoom102 = getRooms().find((r) => String(r.roomNo) === '102');
      expect(canonicalRoom102).toBeDefined();

      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        data: [{
          _id: '67a1b2c3d4e5f67890123457',
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice.smith@example.com',
        }],
      });

      vi.spyOn(guestService, 'createGuest').mockResolvedValue({
        data: {
          _id: '67a1b2c3d4e5f67890123457',
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice.smith@example.com',
        },
      });

      vi.spyOn(reservationService, 'createReservation').mockResolvedValue({
        statusCode: 201,
        data: {
          reservation: {
            _id: '67a1b2c3d4e5f67890123456',
            booking_ref: 'BK-2026-102',
            status: 'CONFIRMED',
            expected_check_in: '2026-09-11T00:00:00.000Z',
            expected_check_out: '2026-09-16T00:00:00.000Z',
            adults: 2,
            children: 0,
            primary_guest_id: {
              _id: '67a1b2c3d4e5f67890123457',
              first_name: 'Alice',
              last_name: 'Smith',
              email: 'alice.smith@example.com',
            },
            rooms: [
              {
                room_id: {
                  _id: canonicalRoom102.id,
                  room_number: canonicalRoom102.roomNo,
                },
                room_type_id: {
                  _id: canonicalRoom102.roomTypeId || '67a1b2c3d4e5f67890123459',
                  name: canonicalRoom102.roomType,
                },
              },
            ],
          },
        },
      });

      render(
        <MemoryRouter>
          <AddReservation />
        </MemoryRouter>
      );

      // 1. Select Room Type Deluxe Room
      const roomTypeSelect = screen.getByRole('combobox', { name: /Select Room Type/i });
      fireEvent.mouseDown(roomTypeSelect);
      const deluxeOption = screen.getByRole('option', { name: 'Deluxe Room' });
      fireEvent.click(deluxeOption);

      // 2. Select canonical room 102
      const badge102 = screen.getByRole('button', { name: '[102]' });
      fireEvent.click(badge102);

      // 3. Fill required fields
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Alice' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Smith' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alice.smith@example.com' } });
      fireEvent.change(screen.getByLabelText(/Total Person/i), { target: { value: '2' } });

      // 4. Submit form
      const saveButton = screen.getByRole('button', { name: /Save Booking/i });
      fireEvent.submit(saveButton.closest('form'));

      // 5. Read resulting hotel_reservations record
      await waitFor(() => {
        const reservations = getReservations();
        const savedBooking = reservations.find((b) => b.email === 'alice.smith@example.com');
        expect(savedBooking).toBeDefined();
      });

      const reservations = getReservations();
      const savedBooking = reservations.find((b) => b.email === 'alice.smith@example.com');

      // 6. Verify canonical roomId and room snapshots
      expect(savedBooking.roomId).toBe(canonicalRoom102.id);
      expect(savedBooking.room).toBe(canonicalRoom102.roomNo);
      expect(savedBooking.roomType).toBe(canonicalRoom102.roomType);

      // 7. Verify check-in lifecycle succeeds without missing-room-ID failure
      const checkInResult = checkInBooking(savedBooking.id);
      expect(checkInResult.status).toBe('Checked In');
      expect(checkInResult.roomId).toBe(canonicalRoom102.id);
      expect(checkInResult.invoice).toBeDefined();
    });
  });
});
