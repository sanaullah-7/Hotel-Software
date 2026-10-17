import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import {
  addGuestCharge,
  getGuestCharges,
  updateGuestCharge,
  getInventoryItems
} from '../features/inventory/pages/inventoryStore';
import AddGuestChargeModal from '../features/inventory/pages/components/AddGuestChargeModal';

describe('Canonical Guest Charge Booking Linkage (Phase 7 Job 15)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Test A — Valid active booking stores bookingId and guestId', () => {
    const reservations = [
      { id: 'RES-ACTIVE-1', guestId: 'G-100', name: 'John Active', roomNo: '205', status: 'Checked In' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    const charge = addGuestCharge({
      bookingId: 'RES-ACTIVE-1',
      itemName: 'Minibar Cola',
      unitPrice: 50,
      quantity: 2
    });

    expect(charge.bookingId).toBe('RES-ACTIVE-1');
    expect(charge.guestId).toBe('G-100');
    expect(charge.guestName).toBe('John Active');
    expect(charge.roomNumber).toBe('205');
    expect(charge.amount).toBe(100);

    const saved = getGuestCharges();
    const stored = saved.find((c) => c.id === charge.id);
    expect(stored).toBeTruthy();
    expect(stored.bookingId).toBe('RES-ACTIVE-1');
    expect(stored.guestId).toBe('G-100');
  });

  it('Test B — Non-active booking rejected (Pending, Booked, Checked Out, Cancelled)', () => {
    const reservations = [
      { id: 'RES-PEND', guestId: 'G-1', status: 'Pending' },
      { id: 'RES-BOOK', guestId: 'G-2', status: 'Booked' },
      { id: 'RES-OUT', guestId: 'G-3', status: 'Checked Out' },
      { id: 'RES-CANC', guestId: 'G-4', status: 'Cancelled' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    expect(() => {
      addGuestCharge({ bookingId: 'RES-PEND', itemName: 'Snack' });
    }).toThrow(/Checked In/);

    expect(() => {
      addGuestCharge({ bookingId: 'RES-BOOK', itemName: 'Snack' });
    }).toThrow(/Checked In/);

    expect(() => {
      addGuestCharge({ bookingId: 'RES-OUT', itemName: 'Snack' });
    }).toThrow(/Checked In/);

    expect(() => {
      addGuestCharge({ bookingId: 'RES-CANC', itemName: 'Snack' });
    }).toThrow(/Checked In/);
  });

  it('Test C — Invalid booking rejected', () => {
    localStorage.setItem('hotel_reservations', JSON.stringify([]));

    expect(() => {
      addGuestCharge({ bookingId: 'UNKNOWN-ID', itemName: 'Water' });
    }).toThrow(/Reservation with ID "UNKNOWN-ID" was not found/);
  });

  it('Test D — Guest mismatch rejected', () => {
    const reservations = [
      { id: 'RES-ACTIVE-D', guestId: 'G-ALICE', name: 'Alice', status: 'Checked In' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    expect(() => {
      addGuestCharge({
        bookingId: 'RES-ACTIVE-D',
        guestId: 'G-BOB',
        itemName: 'Juice'
      });
    }).toThrow(/Guest ID mismatch/);
  });

  it('Test E — Legacy charges still load and default bookingId/guestId to null', () => {
    const legacy = [
      { id: 'GC-LEGACY-1', itemName: 'Old Wine', amount: 45, guestName: 'Legacy Guest', roomNumber: '101' }
    ];
    localStorage.setItem('hotel_guest_charges_v2', JSON.stringify(legacy));

    const charges = getGuestCharges();
    expect(charges.length).toBe(1);
    expect(charges[0].id).toBe('GC-LEGACY-1');
    expect(charges[0].bookingId).toBeNull();
    expect(charges[0].guestId).toBeNull();
  });

  it('Test F — Room comes from booking and cannot be overridden by manually entered room', () => {
    const reservations = [
      { id: 'RES-ACTIVE-F', guestId: 'G-FRANK', name: 'Frank', roomNo: '205', status: 'Checked In' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    const charge = addGuestCharge({
      bookingId: 'RES-ACTIVE-F',
      roomNumber: '999',
      itemName: 'Coffee',
      unitPrice: 10
    });

    expect(charge.roomNumber).toBe('205');
  });

  it('Test G — Guest Profile with one active booking preselects automatically', () => {
    const reservations = [
      { id: 'RES-GUEST-1', guestId: 'G-ONE', name: 'Single Stay Guest', roomNo: '101', status: 'Checked In' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    const { getByText, queryByText } = render(
      <AddGuestChargeModal
        open={true}
        onClose={() => {}}
        prefilledData={{ guestId: 'G-ONE' }}
      />
    );

    expect(getByText(/Single Stay Guest — Room 101/)).toBeTruthy();
    expect(queryByText(/No active "Checked In" reservation/)).toBeNull();
  });

  it('Test H — Guest Profile with multiple active bookings requires explicit selection', () => {
    const reservations = [
      { id: 'RES-MULTI-1', guestId: 'G-MULTI', name: 'Multi Stay Guest', roomNo: '102', status: 'Checked In' },
      { id: 'RES-MULTI-2', guestId: 'G-MULTI', name: 'Multi Stay Guest', roomNo: '103', status: 'Checked In' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    const { getByText } = render(
      <AddGuestChargeModal
        open={true}
        onClose={() => {}}
        prefilledData={{ guestId: 'G-MULTI' }}
      />
    );

    expect(getByText(/This guest has multiple active stays\. Please select the specific stay\./)).toBeTruthy();
    const submitBtn = getByText('Save & Add to Guest Folio');
    expect(submitBtn.hasAttribute('disabled')).toBe(true);
  });

  it('Test I — Guest Profile with no active booking prevents stay charge creation', () => {
    const reservations = [
      { id: 'RES-PAST', guestId: 'G-NOACT', name: 'Past Guest', roomNo: '104', status: 'Checked Out' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    const { getByText } = render(
      <AddGuestChargeModal
        open={true}
        onClose={() => {}}
        prefilledData={{ guestId: 'G-NOACT' }}
      />
    );

    expect(getByText(/This guest has no active "Checked In" reservation\./)).toBeTruthy();
    const submitBtn = getByText('Save & Add to Guest Folio');
    expect(submitBtn.hasAttribute('disabled')).toBe(true);
  });

  it('Test J — Missing Inventory ambiguity does not silently attach to an arbitrary booking', () => {
    const reservations = [
      { id: 'RES-ROOM-A', guestId: 'G-A', name: 'Guest A', roomNo: '301', status: 'Checked In' },
      { id: 'RES-ROOM-B', guestId: 'G-B', name: 'Guest B', roomNo: '301', status: 'Checked In' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    const { getByText } = render(
      <AddGuestChargeModal
        open={true}
        onClose={() => {}}
        prefilledData={{ roomNumber: '301', chargeType: 'Damage', itemName: 'Broken Lamp' }}
      />
    );

    expect(getByText(/Multiple active reservations found for Room 301\. Please select the stay explicitly\./)).toBeTruthy();
    const submitBtn = getByText('Save & Add to Guest Folio');
    expect(submitBtn.hasAttribute('disabled')).toBe(true);
  });

  it('Test K — Booking linkage is immutable when editing charge', () => {
    const reservations = [
      { id: 'RES-ACTIVE-K', guestId: 'G-K', name: 'Imm Guest', roomNo: '201', status: 'Checked In' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    const charge = addGuestCharge({
      bookingId: 'RES-ACTIVE-K',
      itemName: 'Original Water',
      unitPrice: 5
    });

    updateGuestCharge(charge.id, {
      bookingId: 'RES-ATTEMPT-TAMPER',
      guestId: 'G-ATTEMPT-TAMPER',
      itemName: 'Updated Sparkling Water'
    });

    const stored = getGuestCharges().find((c) => c.id === charge.id);
    expect(stored.bookingId).toBe('RES-ACTIVE-K');
    expect(stored.guestId).toBe('G-K');
    expect(stored.itemName).toBe('Updated Sparkling Water');
  });

  it('Test L — Existing charge behavior (stock deduction and amount calculation) preserved', () => {
    const reservations = [
      { id: 'RES-ACTIVE-L', guestId: 'G-L', name: 'L Guest', roomNo: '202', status: 'Checked In' }
    ];
    const items = [
      { id: 'INV-SNACK-1', itemName: 'Chips', quantity: 10, unitPrice: 20, minimumStock: 2, status: 'Available' }
    ];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));
    localStorage.setItem('hotel_inventory_items_v2', JSON.stringify(items));

    const charge = addGuestCharge({
      bookingId: 'RES-ACTIVE-L',
      chargeType: 'Consumption',
      inventoryItemId: 'INV-SNACK-1',
      quantity: 3,
      unitPrice: 20
    });

    expect(charge.amount).toBe(60);
    const updatedItems = getInventoryItems();
    const item = updatedItems.find((i) => i.id === 'INV-SNACK-1');
    expect(item.quantity).toBe(7);
  });
});
