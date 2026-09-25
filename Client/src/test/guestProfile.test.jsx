import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GuestProfile from '../features/guests/pages/GuestProfile';
import { saveGuests } from '../features/guests/state/guestStore';
import { saveReservations } from '../features/reservations/state/reservationStore';
import { saveInvoices, savePayments, saveRefunds } from '../features/payment-billing/pages/paymentBillingStore';

describe('Guest Profile 360 Workspace & 7-Tab Redesign', () => {
  beforeEach(() => {
    localStorage.clear();

    const mockGuest = {
      id: 'GST64188',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      city: 'New York',
      totalStays: 5,
      status: 'Active',
      avatar: 'https://i.pravatar.cc/150?u=1'
    };
    saveGuests([mockGuest]);

    const mockRes = [
      {
        id: '1001',
        bookingId: 'BK-1001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        mobile: '+1234567890',
        roomNumber: '101',
        roomType: 'Deluxe',
        package: 'All Inclusive',
        checkIn: '2026-05-20',
        checkOut: '2026-05-22',
        status: 'Booked',
        payment: 'Paid',
        totalPrice: 870
      }
    ];
    saveReservations(mockRes);

    const mockInv = [
      {
        id: 'INV-2026-009',
        invoiceNumber: 'INV-2026-009',
        guestName: 'John Smith',
        guestEmail: 'john.smith@example.com',
        bookingId: 'BK-1001',
        roomNumber: '101',
        roomType: 'Deluxe',
        issueDate: '2026-05-20',
        dueDate: '2026-05-22',
        totalAmount: 870.00,
        paidAmount: 870.00,
        balanceDue: 0.00,
        status: 'Paid',
        items: []
      }
    ];
    saveInvoices(mockInv);
  });

  const renderProfile = (initialUrl = '/guests/GST64188') => {
    return render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route path="/guests/:id" element={<GuestProfile />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders persistent guest header with correct guest information across all views', () => {
    renderProfile();

    expect(screen.getAllByText('John Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText('GST64188').length).toBeGreaterThan(0);
    expect(screen.getByText('john.smith@example.com')).toBeTruthy();
    expect(screen.getAllByText('+1234567890').length).toBeGreaterThan(0);
    expect(screen.getAllByText('New York').length).toBeGreaterThan(0);
    expect(screen.getByText('Edit Profile')).toBeTruthy();
  });

  it('renders all 7 required horizontal tabs with accurate labels', () => {
    renderProfile();

    expect(screen.getByText('Overview')).toBeTruthy();
    expect(screen.getByText('Reservations & Stays')).toBeTruthy();
    expect(screen.getByText('Charges & Payments')).toBeTruthy();
    expect(screen.getAllByText('Invoices').length).toBeGreaterThan(0);
    expect(screen.getByText('Requests & Complaints')).toBeTruthy();
    expect(screen.getAllByText('Documents').length).toBeGreaterThan(0);
    expect(screen.getByText('Activity Log')).toBeTruthy();
  });

  it('switches to Reservations & Stays tab and displays reservation records', () => {
    renderProfile();

    const resTab = screen.getByText('Reservations & Stays');
    fireEvent.click(resTab);

    expect(screen.getByText('BK-1001')).toBeTruthy();
    expect(screen.getByText('All Inclusive')).toBeTruthy();
    expect(screen.getAllByText(/Room 101/i).length).toBeGreaterThan(0);
  });

  it('switches to dedicated Invoices tab and displays formal billing invoices', () => {
    renderProfile();

    const tabButtons = screen.getAllByText('Invoices');
    fireEvent.click(tabButtons[0]);

    expect(screen.getByText('INV-2026-009')).toBeTruthy();
    expect(screen.getAllByText('$870.00').length).toBeGreaterThan(0);
    expect(screen.getByText('Formal Billing Invoices')).toBeTruthy();
  });

  it('switches to Requests & Complaints tab and shows tickets and new ticket action', () => {
    renderProfile();

    const compTab = screen.getByText('Requests & Complaints');
    fireEvent.click(compTab);

    expect(screen.getByText('Guest Requests & Operational Tickets')).toBeTruthy();
    expect(screen.getByText('New Ticket')).toBeTruthy();
  });

  it('switches to Documents tab and shows identity/registration documents', () => {
    renderProfile();

    const docTabs = screen.getAllByText('Documents');
    fireEvent.click(docTabs[0]);

    expect(screen.getByText('Guest Identity & Registration Documents')).toBeTruthy();
    expect(screen.getByText('Attach Document')).toBeTruthy();
  });

  it('switches to Activity Log tab and displays audited event timeline', () => {
    renderProfile();

    const actTab = screen.getByText('Activity Log');
    fireEvent.click(actTab);

    expect(screen.getByText('Guest Interaction & Audit History')).toBeTruthy();
    expect(screen.getByText('Guest Profile Registered')).toBeTruthy();
  });

  it('opens Edit Guest modal and allows updating guest information', () => {
    renderProfile();

    const editBtn = screen.getByText('Edit Profile');
    fireEvent.click(editBtn);

    expect(screen.getByText('Edit Guest Profile')).toBeTruthy();
    expect(screen.getByLabelText('Full Name *')).toBeTruthy();
  });

  it('saves updated guest information, displays immediately, persists across tabs, and preserves other guests', () => {
    // Add second guest to verify Guest A doesn't modify Guest B
    const guestB = {
      id: 'GST6419F',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1234567893',
      city: 'London',
      totalStays: 28,
      status: 'Active',
      avatar: 'https://i.pravatar.cc/150?u=2'
    };
    saveGuests([
      {
        id: 'GST64188',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1234567890',
        city: 'New York',
        totalStays: 5,
        status: 'Active',
        avatar: 'https://i.pravatar.cc/150?u=1'
      },
      guestB
    ]);

    const { unmount } = renderProfile('/guests/GST64188');

    // 1. Open Edit Modal
    fireEvent.click(screen.getByText('Edit Profile'));

    // 2. Modify name, city, and phone
    const nameInput = screen.getByLabelText('Full Name *');
    const cityInput = screen.getByLabelText('City / Country');
    const phoneInput = screen.getByLabelText('Phone Number');

    fireEvent.change(nameInput, { target: { value: 'Jonathan Vance' } });
    fireEvent.change(cityInput, { target: { value: 'San Francisco' } });
    fireEvent.change(phoneInput, { target: { value: '+1999888777' } });

    // 3. Save Changes
    fireEvent.click(screen.getByText('Save Changes'));

    // 4. Confirm immediate update on profile header
    expect(screen.getAllByText('Jonathan Vance').length).toBeGreaterThan(0);
    expect(screen.getAllByText('San Francisco').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+1999888777').length).toBeGreaterThan(0);

    // 5. Navigate between tabs
    fireEvent.click(screen.getByText('Reservations & Stays'));
    expect(screen.getAllByText('Jonathan Vance').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Documents'));
    expect(screen.getAllByText('Jonathan Vance').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Overview'));
    expect(screen.getAllByText('Jonathan Vance').length).toBeGreaterThan(0);
    expect(screen.getAllByText('San Francisco').length).toBeGreaterThan(0);

    unmount();

    // 6. Verify Guest B was not modified
    const { unmount: unmountB } = renderProfile('/guests/GST6419F');
    expect(screen.getAllByText('Sarah Johnson').length).toBeGreaterThan(0);
    expect(screen.getAllByText('London').length).toBeGreaterThan(0);
    unmountB();
  });
});
