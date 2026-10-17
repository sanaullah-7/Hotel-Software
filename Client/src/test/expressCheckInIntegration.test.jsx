import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ExpressCheckInModal from '../features/front-office/components/ExpressCheckInModal';
import CheckInOut from '../features/front-office/pages/CheckInOut';
import CommandPalette from '../layouts/DashboardLayout/CommandPalette';
import guestService from '../services/guestService';
import roomService from '../services/roomService';
import reservationService from '../services/reservationService';
import stayService from '../services/stayService';
import billingService from '../services/billingService';
import shiftService from '../services/shiftService';

describe('Phase 4 Step 5: Express Check-In Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockRooms = [
    {
      _id: '670101',
      room_number: '101',
      status: 'AVAILABLE',
      housekeeping_status: 'CLEAN',
      floor: '1',
      room_type_id: {
        _id: 'rt-1',
        name: 'Executive Deluxe',
        base_price: 15000,
      },
    },
    {
      _id: '670102',
      room_number: '102',
      status: 'AVAILABLE',
      housekeeping_status: 'DIRTY',
      floor: '1',
      room_type_id: {
        _id: 'rt-1',
        name: 'Executive Deluxe',
        base_price: 15000,
      },
    },
    {
      _id: '670103',
      room_number: '103',
      status: 'OCCUPIED',
      housekeeping_status: 'CLEAN',
      floor: '1',
      room_type_id: {
        _id: 'rt-1',
        name: 'Executive Deluxe',
        base_price: 15000,
      },
    },
  ];

  const mockGuests = [
    {
      _id: 'g-001',
      guest_ref: 'GST-001',
      first_name: 'Tariq',
      last_name: 'Mahmood',
      phone: '03001234567',
      national_id: '35201-1234567-1',
      email: 'tariq@example.com',
      vip_status: true,
    },
    {
      _id: 'g-002',
      guest_ref: 'GST-002',
      first_name: 'Fatima',
      last_name: 'Zahra',
      phone: '03219876543',
      national_id: '37405-7654321-2',
      email: 'fatima@example.com',
      vip_status: false,
    },
  ];

  describe('1. Modal Lifecycle & Accessibility', () => {
    it('renders dialog with proper accessibility attributes when open', () => {
      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('express-checkin-title');
      expect(screen.getByText('Express Check-In')).toBeTruthy();
    });

    it('returns null and does not render DOM elements when closed', () => {
      const { container } = render(
        <ExpressCheckInModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('triggers onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <ExpressCheckInModal isOpen={true} onClose={handleClose} onSuccess={vi.fn()} />
      );

      const closeBtn = screen.getByLabelText('Close Express Check-In');
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Guest Lookup, Masking, and Registration', () => {
    it('finds existing guest by phone or CNIC and masks sensitive identifiers', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        data: { guests: [mockGuests[0]] },
      });

      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const searchInput = screen.getByPlaceholderText(/e\.g\. 03001234567/i);
      fireEvent.change(searchInput, { target: { value: '0300' } });

      await waitFor(() => {
        expect(screen.getByText('Tariq Mahmood')).toBeTruthy();
      });

      // Privacy verification: phone and CNIC are masked!
      expect(screen.getByText(/Phone: 0300\*\*\*\*567/i)).toBeTruthy();
      expect(screen.getByText(/CNIC: 35201-\*\*\*\*\*\*\*-1/i)).toBeTruthy();
      expect(screen.queryByText('03001234567')).toBeNull();
    });

    it('displays multiple search matches and allows operator to explicitly select one', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        data: { guests: mockGuests },
      });
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        data: { reservations: [] },
      });

      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const searchInput = screen.getByPlaceholderText(/e\.g\. 03001234567/i);
      fireEvent.change(searchInput, { target: { value: 'Mah' } });

      await waitFor(() => {
        expect(screen.getByText('Tariq Mahmood')).toBeTruthy();
        expect(screen.getByText('Fatima Zahra')).toBeTruthy();
      });

      // Select Fatima
      const selectButtons = screen.getAllByText('Select');
      fireEvent.click(selectButtons[1]);

      await waitFor(() => {
        expect(screen.getByText(/Selected Guest: Fatima Zahra/i)).toBeTruthy();
      });
    });

    it('displays guidance and create option when no guest matches search', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        data: { guests: [] },
      });

      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const searchInput = screen.getByPlaceholderText(/e\.g\. 03001234567/i);
      fireEvent.change(searchInput, { target: { value: '9999999999' } });

      await waitFor(() => {
        expect(screen.getByText(/No matching guest found for "9999999999"/i)).toBeTruthy();
      });

      const createBtn = screen.getByText(/Create new guest profile/i);
      fireEvent.click(createBtn);

      expect(screen.getByText('New Guest Registration')).toBeTruthy();
    });

    it('validates required fields for new guest registration', async () => {
      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const registerTab = screen.getByText('Register New Guest');
      fireEvent.click(registerTab);

      // Attempt to proceed without entering names
      const continueBtn = screen.getByText(/Continue to Room Selection/i);
      fireEvent.click(continueBtn);

      expect(
        screen.getByText('First Name and Last Name are required to register a guest.')
      ).toBeTruthy();
    });
  });

  describe('3. Room Selection & Cleanliness Gate', () => {
    beforeEach(() => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        data: { guests: [mockGuests[0]] },
      });
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        data: { reservations: [] },
      });
      vi.spyOn(roomService, 'getRooms').mockResolvedValue({
        data: { rooms: mockRooms },
      });
      vi.spyOn(reservationService, 'checkAvailability').mockResolvedValue({
        data: [],
      });
    });

    it('presents rooms with eligibility and rejects occupied and dirty rooms by default', async () => {
      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Select guest
      const searchInput = screen.getByPlaceholderText(/e\.g\. 03001234567/i);
      fireEvent.change(searchInput, { target: { value: '0300' } });

      await waitFor(() => {
        expect(screen.getByText('Tariq Mahmood')).toBeTruthy();
      });
      fireEvent.click(screen.getByText('Select'));

      // Move to Step 2
      const continueBtn = screen.getByText(/Continue to Room Selection/i);
      fireEvent.click(continueBtn);

      // Step 2 Rooms Verification
      await waitFor(() => {
        expect(screen.getByText('Room 101')).toBeTruthy();
        expect(screen.getByText('Room 102')).toBeTruthy();
        expect(screen.getByText('Room 103')).toBeTruthy();
      });

      // Room 101 is CLEAN and AVAILABLE -> eligible
      expect(screen.getByText('Choose')).toBeTruthy();

      // Room 102 is DIRTY -> marked with reason
      expect(screen.getByText('Requires Cleaning (DIRTY)')).toBeTruthy();

      // Room 103 is OCCUPIED -> marked with reason
      expect(screen.getByText('Occupied')).toBeTruthy();
    });

    it('allows manager cleanliness override to authorize dirty room', async () => {
      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Select guest and proceed to Step 2
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. 03001234567/i), {
        target: { value: '0300' },
      });
      await waitFor(() => expect(screen.getByText('Tariq Mahmood')).toBeTruthy());
      fireEvent.click(screen.getByText('Select'));
      fireEvent.click(screen.getByText(/Continue to Room Selection/i));

      await waitFor(() => expect(screen.getByText('Room 102')).toBeTruthy());

      // Click Manager Cleanliness Override checkbox
      const overrideCheckbox = screen.getByRole('checkbox', { name: /Authorize/i });
      fireEvent.click(overrideCheckbox);

      // Room 102 should now become eligible (Choose button becomes available)
      await waitFor(() => {
        expect(screen.queryByText('Requires Cleaning (DIRTY)')).toBeNull();
      });
    });

    it('enforces check-out date must be strictly after check-in date', async () => {
      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Proceed to Step 2
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. 03001234567/i), {
        target: { value: '0300' },
      });
      await waitFor(() => expect(screen.getByText('Tariq Mahmood')).toBeTruthy());
      fireEvent.click(screen.getByText('Select'));
      fireEvent.click(screen.getByText(/Continue to Room Selection/i));

      await waitFor(() => expect(screen.getByText('Room 101')).toBeTruthy());

      // Set invalid dates (checkOut equal to checkIn)
      const inputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
      fireEvent.change(inputs[1], { target: { value: inputs[0].value } });

      const continueToPayBtn = screen.getByText(/Continue to Payment/i);
      fireEvent.click(continueToPayBtn);

      expect(
        screen.getByText('Check-out date must be strictly after Check-in date.')
      ).toBeTruthy();
    });
  });

  describe('4. Cash Shift & Payment Integration', () => {
    beforeEach(() => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        data: { guests: [mockGuests[0]] },
      });
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        data: { reservations: [] },
      });
      vi.spyOn(roomService, 'getRooms').mockResolvedValue({
        data: { rooms: mockRooms },
      });
      vi.spyOn(reservationService, 'checkAvailability').mockResolvedValue({
        data: [],
      });
    });

    it('warns and disables cash check-in if authenticated cashier has no open cash shift', async () => {
      // Mock no active shift
      vi.spyOn(shiftService, 'getActiveShift').mockResolvedValue({
        data: { shift: null },
      });

      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Move to Step 2
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. 03001234567/i), {
        target: { value: '0300' },
      });
      await waitFor(() => expect(screen.getByText('Tariq Mahmood')).toBeTruthy());
      fireEvent.click(screen.getByText('Select'));
      fireEvent.click(screen.getByText(/Continue to Room Selection/i));

      // Select Room 101 and proceed to Step 3
      await waitFor(() => expect(screen.getByText('Room 101')).toBeTruthy());
      fireEvent.click(screen.getByText('Room 101'));
      fireEvent.click(screen.getByText(/Continue to Payment/i));

      // In Step 3, with Cash selected and no active shift
      await waitFor(() => {
        expect(screen.getByText('Active Cash Shift Required')).toBeTruthy();
        expect(screen.getByText(/Go to Shift Handover/i)).toBeTruthy();
      });

      // Final submit button is disabled
      const submitBtn = screen.getByRole('button', { name: /Complete Check-In/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(true);
    });

    it('allows cash check-in when cashier has an active open cash shift', async () => {
      vi.spyOn(shiftService, 'getActiveShift').mockResolvedValue({
        data: {
          shift: {
            _id: 'shift-101',
            status: 'OPEN',
            drawer_name: 'Main Front Desk Drawer',
          },
        },
      });

      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Move to Step 2
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. 03001234567/i), {
        target: { value: '0300' },
      });
      await waitFor(() => expect(screen.getByText('Tariq Mahmood')).toBeTruthy());
      fireEvent.click(screen.getByText('Select'));
      fireEvent.click(screen.getByText(/Continue to Room Selection/i));

      // Select Room 101 and proceed to Step 3
      await waitFor(() => expect(screen.getByText('Room 101')).toBeTruthy());
      fireEvent.click(screen.getByText('Room 101'));
      fireEvent.click(screen.getByText(/Continue to Payment/i));

      await waitFor(() => {
        expect(screen.getByText(/Attributed to open drawer:/i)).toBeTruthy();
        expect(screen.getByText('Main Front Desk Drawer')).toBeTruthy();
      });

      const submitBtn = screen.getByRole('button', { name: /Complete Check-In/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(false);
    });

    it('permits non-cash payment (e.g. Credit Card) without open cash shift requirement', async () => {
      vi.spyOn(shiftService, 'getActiveShift').mockResolvedValue({
        data: { shift: null },
      });

      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Move to Step 2
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. 03001234567/i), {
        target: { value: '0300' },
      });
      await waitFor(() => expect(screen.getByText('Tariq Mahmood')).toBeTruthy());
      fireEvent.click(screen.getByText('Select'));
      fireEvent.click(screen.getByText(/Continue to Room Selection/i));

      // Select Room 101 and proceed to Step 3
      await waitFor(() => expect(screen.getByText('Room 101')).toBeTruthy());
      fireEvent.click(screen.getByText('Room 101'));
      fireEvent.click(screen.getByText(/Continue to Payment/i));

      await waitFor(() => expect(screen.getByText('Credit Card')).toBeTruthy());

      // Switch to Credit Card
      fireEvent.click(screen.getByText('Credit Card'));

      // Warning disappears and button is enabled
      expect(screen.queryByText('Active Cash Shift Required')).toBeNull();
      const submitBtn = screen.getByRole('button', { name: /Complete Check-In/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('5. Full End-to-End Walk-in Submission & Confirmation', () => {
    it('executes full walk-in workflow, records reservation and stay, and renders confirmation screen', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        data: { guests: [mockGuests[0]] },
      });
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        data: { reservations: [] },
      });
      vi.spyOn(roomService, 'getRooms').mockResolvedValue({
        data: { rooms: mockRooms },
      });
      vi.spyOn(reservationService, 'checkAvailability').mockResolvedValue({
        data: [],
      });
      vi.spyOn(shiftService, 'getActiveShift').mockResolvedValue({
        data: { shift: { _id: 's-1', status: 'OPEN', drawer_name: 'Drawer 1' } },
      });

      const spyCreateRes = vi.spyOn(reservationService, 'createReservation').mockResolvedValue({
        data: {
          reservation: {
            _id: 'res-new-999',
            booking_ref: 'RES-NEW-999',
          },
        },
      });

      const spyCheckIn = vi.spyOn(stayService, 'checkIn').mockResolvedValue({
        data: {
          stay: {
            _id: 'stay-new-999',
            stay_ref: 'STY-NEW-999',
            status: 'CHECKED_IN',
          },
        },
      });

      const spyInvoices = vi.spyOn(billingService, 'getInvoices').mockResolvedValue({
        data: {
          invoices: [
            {
              _id: 'inv-999',
              folio_id: 'folio-999',
              total_amount: 15000,
              amount_paid: 0,
              status: 'UNPAID',
            },
          ],
        },
      });

      const spyPayment = vi.spyOn(billingService, 'createPayment').mockResolvedValue({
        data: { payment: { _id: 'pay-999' } },
      });

      const handleSuccess = vi.fn();

      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={handleSuccess} />
      );

      // Step 1: Select Guest
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. 03001234567/i), {
        target: { value: '0300' },
      });
      await waitFor(() => expect(screen.getByText('Tariq Mahmood')).toBeTruthy());
      fireEvent.click(screen.getByText('Select'));
      fireEvent.click(screen.getByText(/Continue to Room Selection/i));

      // Step 2: Select Room
      await waitFor(() => expect(screen.getByText('Room 101')).toBeTruthy());
      fireEvent.click(screen.getByText('Room 101'));
      fireEvent.click(screen.getByText(/Continue to Payment/i));

      // Step 3: Complete Check-In
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Complete Check-In/i })).toBeTruthy();
      });
      fireEvent.click(screen.getByRole('button', { name: /Complete Check-In/i }));

      // Authoritative Confirmation Step
      await waitFor(() => {
        expect(screen.getByText('Express Check-In Successful!')).toBeTruthy();
      });

      expect(screen.getByText('STY-NEW-999')).toBeTruthy();
      expect(screen.getByText('RES-NEW-999')).toBeTruthy();
      expect(screen.getByText(/Room 101 \(Executive Deluxe\)/i)).toBeTruthy();

      expect(spyCreateRes).toHaveBeenCalledTimes(1);
      expect(spyCheckIn).toHaveBeenCalledTimes(1);
      expect(spyPayment).toHaveBeenCalledTimes(1);
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });

    it('handles partial failure safely when reservation created but check-in rejected', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        data: { guests: [mockGuests[0]] },
      });
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        data: { reservations: [] },
      });
      vi.spyOn(roomService, 'getRooms').mockResolvedValue({
        data: { rooms: mockRooms },
      });
      vi.spyOn(reservationService, 'checkAvailability').mockResolvedValue({
        data: [],
      });
      vi.spyOn(shiftService, 'getActiveShift').mockResolvedValue({
        data: { shift: { _id: 's-1', status: 'OPEN', drawer_name: 'Drawer 1' } },
      });

      vi.spyOn(reservationService, 'createReservation').mockResolvedValue({
        data: {
          reservation: {
            _id: 'res-new-888',
            booking_ref: 'RES-NEW-888',
          },
        },
      });

      // Check-in fails concurrently
      vi.spyOn(stayService, 'checkIn').mockRejectedValue(
        new Error('Room 101 status conflict: occupied by another agent')
      );

      render(
        <ExpressCheckInModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      // Navigate to Step 3 and submit
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. 03001234567/i), {
        target: { value: '0300' },
      });
      await waitFor(() => expect(screen.getByText('Tariq Mahmood')).toBeTruthy());
      fireEvent.click(screen.getByText('Select'));
      fireEvent.click(screen.getByText(/Continue to Room Selection/i));
      await waitFor(() => expect(screen.getByText('Room 101')).toBeTruthy());
      fireEvent.click(screen.getByText('Room 101'));
      fireEvent.click(screen.getByText(/Continue to Payment/i));

      await waitFor(() => expect(screen.getByRole('button', { name: /Complete Check-In/i })).toBeTruthy());
      fireEvent.click(screen.getByRole('button', { name: /Complete Check-In/i }));

      // Verify safe partial failure notice
      await waitFor(() => {
        expect(screen.getByText(/Partial Workflow Notice/i)).toBeTruthy();
        expect(screen.getByText('RES-NEW-888')).toBeTruthy();
        expect(screen.getByText(/Room 101 status conflict/i)).toBeTruthy();
      });
    });
  });

  describe('6. Front Desk & Command Palette Integration', () => {
    it('renders Express Walk-In Check-In button on Front Office CheckInOut page', async () => {
      vi.spyOn(stayService, 'getStays').mockResolvedValue({ data: [] });
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({ data: [] });

      render(
        <MemoryRouter>
          <CheckInOut />
        </MemoryRouter>
      );

      const expressBtn = screen.getByRole('button', { name: /Express Walk-In Check-In/i });
      expect(expressBtn).toBeTruthy();

      // Clicking opens the ExpressCheckInModal
      fireEvent.click(expressBtn);
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(screen.getByText('Express Check-In')).toBeTruthy();
    });

    it('navigates to /front-office/check-in-out?express=true from Command Palette', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<CommandPalette isOpen={true} onClose={vi.fn()} />}
            />
            <Route
              path="/front-office/check-in-out"
              element={<div>Front Office Express Target</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      const cmd = screen.getByText('Express Check-In');
      expect(cmd).toBeTruthy();
      fireEvent.click(cmd);

      await waitFor(() => {
        expect(screen.getByText('Front Office Express Target')).toBeTruthy();
      });
    });
  });
});
