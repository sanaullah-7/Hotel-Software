import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReservationHistory from '../features/reservations/pages/ReservationHistory';
import { saveReservations, RESERVATIONS_UPDATED_EVENT } from '../features/reservations/state/reservationStore';

describe('Reservation History Canonical Data Migration (Phase 7 Job 11)', () => {
  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const dayOneStr = `${yyyy}-${mm}-01`;
  const earlierMonthStr = `${yyyy}-01-15`;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Test 1 & 2 — Checked Out and Cancelled records render in Reservation History', () => {
    const canonical = [
      { id: 'RES-101', name: 'CheckedOut Guest', room: '101 - Standard', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr, mobile: '1111111111' },
      { id: 'RES-102', name: 'Cancelled Guest', room: '102 - Deluxe', status: 'Cancelled', checkIn: todayStr, checkOut: todayStr, mobile: '2222222222' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));

    const { getByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(getByText('CheckedOut Guest')).toBeTruthy();
    expect(getByText('Cancelled Guest')).toBeTruthy();
    expect(getByText('RES-101')).toBeTruthy();
    expect(getByText('RES-102')).toBeTruthy();
  });

  it('Test 3 — Active bookings (Pending, Booked, Checked In) are excluded from Reservation History', () => {
    const canonical = [
      { id: 'RES-201', name: 'Pending Guest', room: '201', status: 'Pending', checkIn: todayStr, checkOut: todayStr },
      { id: 'RES-202', name: 'Booked Guest', room: '202', status: 'Booked', checkIn: todayStr, checkOut: todayStr },
      { id: 'RES-203', name: 'CheckedIn Guest', room: '203', status: 'Checked In', checkIn: todayStr, checkOut: todayStr },
      { id: 'RES-204', name: 'Historical Guest', room: '204', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr },
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(getByText('Historical Guest')).toBeTruthy();
    expect(queryByText('Pending Guest')).toBeNull();
    expect(queryByText('Booked Guest')).toBeNull();
    expect(queryByText('CheckedIn Guest')).toBeNull();
  });

  it('Test 4 — Empty canonical state does not recreate mock data and displays empty message', () => {
    localStorage.setItem('hotel_reservations', JSON.stringify([]));

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(getByText('No reservations found.')).toBeTruthy();
    expect(queryByText('Sarah Smith')).toBeNull();
    expect(queryByText('John Doe')).toBeNull();
    expect(queryByText('Ahsan Khan')).toBeNull();
  });

  it('Test 5 — Date filters (Daily, Monthly, Yearly, Custom) operate on canonical dates', () => {
    const canonical = [
      { id: 'RES-D', name: 'Daily Guest', room: '101', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr },
      { id: 'RES-M', name: 'Month Guest', room: '102', status: 'Checked Out', checkIn: dayOneStr, checkOut: dayOneStr },
      { id: 'RES-Y', name: 'Year Guest', room: '103', status: 'Checked Out', checkIn: earlierMonthStr, checkOut: earlierMonthStr },
      { id: 'RES-C', name: 'Custom Guest', room: '104', status: 'Checked Out', checkIn: '2024-05-10', checkOut: '2024-05-15' },
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    // Default Daily
    expect(getByText('Daily Guest')).toBeTruthy();
    expect(queryByText('Year Guest')).toBeNull();

    // Monthly
    fireEvent.click(getByText('Monthly', { selector: 'button' }));
    expect(getByText('Daily Guest')).toBeTruthy();
    expect(getByText('Month Guest')).toBeTruthy();
    expect(queryByText('Custom Guest')).toBeNull();

    // Yearly
    fireEvent.click(getByText('Yearly', { selector: 'button' }));
    expect(getByText('Daily Guest')).toBeTruthy();
    expect(getByText('Month Guest')).toBeTruthy();
    expect(getByText('Year Guest')).toBeTruthy();
    expect(queryByText('Custom Guest')).toBeNull();

    // Custom
    fireEvent.click(getByText('Custom', { selector: 'button' }));
    const inputs = document.querySelectorAll('input[type="date"]');
    if (inputs.length >= 2) {
      fireEvent.change(inputs[0], { target: { value: '2024-05-01' } });
      fireEvent.change(inputs[1], { target: { value: '2024-05-20' } });
      expect(getByText('Custom Guest')).toBeTruthy();
      expect(queryByText('Daily Guest')).toBeNull();
    }
  });

  it('Test 6 — Search filters canonical records by name, ID, room, and mobile', () => {
    const canonical = [
      { id: 'RES-AAA', name: 'Alice Wonder', room: '501 - Presidential', mobile: '9998887777', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr },
      { id: 'RES-BBB', name: 'Bob Builder', room: '502 - Deluxe', mobile: '1112223333', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr },
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));

    const { getByText, queryByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    const searchInput = getByPlaceholderText('Search history...');

    // Search by Name
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    expect(getByText('Alice Wonder')).toBeTruthy();
    expect(queryByText('Bob Builder')).toBeNull();

    // Search by ID
    fireEvent.change(searchInput, { target: { value: 'RES-BBB' } });
    expect(getByText('Bob Builder')).toBeTruthy();
    expect(queryByText('Alice Wonder')).toBeNull();

    // Search by Room
    fireEvent.change(searchInput, { target: { value: '501' } });
    expect(getByText('Alice Wonder')).toBeTruthy();
    expect(queryByText('Bob Builder')).toBeNull();

    // Search by Mobile
    fireEvent.change(searchInput, { target: { value: '111222' } });
    expect(getByText('Bob Builder')).toBeTruthy();
    expect(queryByText('Alice Wonder')).toBeNull();
  });

  it('Test 7 — Dues display Unverified when unlinked and does not fabricate dues', () => {
    const canonical = [
      { id: 'RES-NO-INV', name: 'No Invoice Guest', room: '101', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));

    const { getByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(getByText('Unverified')).toBeTruthy();
  });

  it('Test 8 — Persistence across remount reads from canonical storage', () => {
    const canonical = [
      { id: 'RES-PERSIST', name: 'Persist Guest', room: '105', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));

    const { unmount, getByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );
    expect(getByText('Persist Guest')).toBeTruthy();
    unmount();

    const remount = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );
    expect(remount.getByText('Persist Guest')).toBeTruthy();
  });

  it('Test 9 — Reacts to RESERVATIONS_UPDATED_EVENT when canonical reservations change', async () => {
    const initial = [
      { id: 'RES-BEFORE', name: 'Before Event', room: '101', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(initial));

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );
    expect(getByText('Before Event')).toBeTruthy();

    const updated = [
      { id: 'RES-AFTER', name: 'After Event', room: '102', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr }
    ];
    act(() => {
      saveReservations(updated);
    });

    await waitFor(() => {
      expect(getByText('After Event')).toBeTruthy();
      expect(queryByText('Before Event')).toBeNull();
    });
  });

  it('Test A — Invoice total overrides stale booking total', () => {
    const canonical = [
      { id: 'RES-A', name: 'Alice Over', room: '101', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr, totalPrice: 500 }
    ];
    const invoices = [
      { id: 'INV-A', invoiceNumber: 'INV-A', bookingId: 'RES-A', totalAmount: 750, status: 'Paid' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));
    localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(getByText('$750')).toBeTruthy();
    expect(queryByText('$500')).toBeNull();
  });

  it('Test B — Legacy booking total only works without invoice', () => {
    const canonical = [
      { id: 'RES-B', name: 'Bob Legacy', room: '102', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr, totalPrice: 500 }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));
    localStorage.setItem('hm_invoices_v2', JSON.stringify([]));

    const { getByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(getByText('$500')).toBeTruthy();
  });

  it('Test C — Remaining price is never used as total', () => {
    const canonical = [
      { id: 'RES-C', name: 'Charlie Rem', room: '103', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr, remainingPrice: 200 }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));
    localStorage.setItem('hm_invoices_v2', JSON.stringify([]));

    const { queryByText, getAllByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(queryByText('$200')).toBeNull();
    const dashes = getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('Test D — Invoice payment status overrides stale booking status', () => {
    const canonical = [
      { id: 'RES-D', name: 'David Stale', room: '104', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr, paymentStatus: 'Paid' }
    ];
    const invoices = [
      { id: 'INV-D', invoiceNumber: 'INV-D', bookingId: 'RES-D', totalAmount: 400, status: 'Unpaid' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));
    localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(getByText('Unpaid')).toBeTruthy();
    expect(queryByText('Paid')).toBeNull();
  });

  it('Test E — Legacy payment status works only without invoice', () => {
    const canonical = [
      { id: 'RES-E', name: 'Eve LegacyPay', room: '105', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr, paymentStatus: 'Paid' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));
    localStorage.setItem('hm_invoices_v2', JSON.stringify([]));

    const { getByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(getByText('Paid')).toBeTruthy();
  });

  it('Test F — Dues remain canonical and do not read from reservation snapshots', () => {
    const canonical = [
      { id: 'RES-F', name: 'Frank Dues', room: '106', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr, dues: 999, remainingPrice: 999 }
    ];
    const invoices = [
      { id: 'INV-F', invoiceNumber: 'INV-F', bookingId: 'RES-F', totalAmount: 500, paidAmount: 300, balanceDue: 200, status: 'Partially Paid' }
    ];
    const payments = [
      { id: 'PAY-F', paymentId: 'PAY-F', invoiceId: 'INV-F', amount: 300, status: 'Completed' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));
    localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
    localStorage.setItem('hm_payments_v2', JSON.stringify(payments));

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    expect(getByText('$200')).toBeTruthy();
    expect(queryByText('$999')).toBeNull();
  });

  it('Test G — Room-number charge leakage is impossible across different guests/stays', () => {
    const canonical = [
      { id: 'RES-G1', name: 'Ali Khan', room: '105', status: 'Checked Out', checkIn: `${yyyy}-01-10`, checkOut: `${yyyy}-01-15` },
      { id: 'RES-G2', name: 'Ahmed Raza', room: '105', status: 'Checked Out', checkIn: `${yyyy}-03-10`, checkOut: `${yyyy}-03-15` }
    ];
    const charges = [
      { id: 'GC-105', guestName: 'Ahmed Raza', roomNumber: '105', itemName: 'Minibar Snacks', amount: 25, date: `${yyyy}-03-12` }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));
    localStorage.setItem('hotel_guest_charges_v2', JSON.stringify(charges));
    localStorage.setItem('hm_invoices_v2', JSON.stringify([]));

    const { getByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    fireEvent.click(getByText('Yearly', { selector: 'button' }));

    const aliRow = getByText('Ali Khan').closest('tr');
    const ahmedRow = getByText('Ahmed Raza').closest('tr');

    expect(aliRow.textContent).toContain('—');
    expect(aliRow.textContent).not.toContain('1 Item');
    expect(ahmedRow.textContent).toContain('1 Item');
  });

  it('Test H — Ambiguous charges are not displayed and render dash', () => {
    const canonical = [
      { id: 'RES-H', name: 'Sarah Connor', room: '202', status: 'Checked Out', checkIn: todayStr, checkOut: todayStr }
    ];
    const charges = [
      { id: 'GC-AMB1', roomNumber: '202', amount: 15 },
      { id: 'GC-AMB2', guestName: 'Sarah Connor', roomNumber: '999', amount: 20, date: todayStr },
      { id: 'GC-AMB3', guestName: 'Sarah Connor', roomNumber: '202', amount: 30, date: '2019-01-01' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));
    localStorage.setItem('hotel_guest_charges_v2', JSON.stringify(charges));
    localStorage.setItem('hm_invoices_v2', JSON.stringify([]));

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    const sarahRow = getByText('Sarah Connor').closest('tr');
    expect(sarahRow.textContent).toContain('—');
    expect(queryByText('1 Item')).toBeNull();
    expect(queryByText('3 Items')).toBeNull();
  });

  it('Test I — Legacy booking.inventory does not become the source of truth', () => {
    const canonical = [
      {
        id: 'RES-I',
        name: 'Mock Inv Guest',
        room: '303',
        status: 'Checked Out',
        checkIn: todayStr,
        checkOut: todayStr,
        inventory: [{ name: 'Fabricated Wine', price: 99, date: todayStr }]
      }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(canonical));
    localStorage.setItem('hotel_guest_charges_v2', JSON.stringify([]));
    localStorage.setItem('hm_invoices_v2', JSON.stringify([]));

    const { getByText, queryByText } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    const mockRow = getByText('Mock Inv Guest').closest('tr');
    expect(queryByText('Fabricated Wine')).toBeNull();
    expect(queryByText('1 Item')).toBeNull();
    expect(mockRow.textContent).toContain('—');
  });
});

