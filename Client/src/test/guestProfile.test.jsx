import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GuestProfile from '../features/guests/pages/GuestProfile';
import { saveGuests } from '../features/guests/state/guestStore';
import { saveReservations } from '../features/reservations/state/reservationStore';
import { saveInvoices, savePayments, saveRefunds } from '../features/payment-billing/pages/paymentBillingStore';
import { saveGuestCharges } from '../features/inventory/pages/inventoryStore';

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

  it('fulfills the accessibility contract for tablist, tab, tabpanel, and keyboard navigation', () => {
    renderProfile();

    // 1. Tab container has role="tablist"
    const tablist = screen.getByRole('tablist', { name: 'Guest profile tabs' });
    expect(tablist).toBeTruthy();

    // 2. All 7 tabs have role="tab"
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(7);

    // 3. Exactly one active tab has aria-selected="true" initially
    const activeTabs = tabs.filter((t) => t.getAttribute('aria-selected') === 'true');
    expect(activeTabs).toHaveLength(1);
    expect(activeTabs[0]).toHaveProperty('id', 'guest-profile-tab-overview');
    expect(activeTabs[0].getAttribute('tabindex')).toBe('0');

    // 4. Inactive tabs expose aria-selected="false" and tabindex="-1"
    const inactiveTabs = tabs.filter((t) => t.getAttribute('aria-selected') === 'false');
    expect(inactiveTabs).toHaveLength(6);
    inactiveTabs.forEach((tab) => {
      expect(tab.getAttribute('tabindex')).toBe('-1');
    });

    // 5. Every tab has a unique ID and valid aria-controls
    const tabIds = tabs.map((t) => t.id);
    expect(new Set(tabIds).size).toBe(7);
    tabs.forEach((tab) => {
      const controlsId = tab.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      expect(controlsId).toBe(`guest-profile-panel-${tab.id.replace('guest-profile-tab-', '')}`);
    });

    // 6. Rendered active panel has role="tabpanel" and aria-labelledby pointing to its tab
    const initialPanel = screen.getByRole('tabpanel');
    expect(initialPanel).toBeTruthy();
    expect(initialPanel.id).toBe('guest-profile-panel-overview');
    expect(initialPanel.getAttribute('aria-labelledby')).toBe('guest-profile-tab-overview');

    // 7. Clicking a tab changes the active panel and selection
    const resTab = screen.getByRole('tab', { name: /Reservations & Stays/i });
    fireEvent.click(resTab);

    expect(resTab.getAttribute('aria-selected')).toBe('true');
    expect(resTab.getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('tab', { name: /Overview/i }).getAttribute('aria-selected')).toBe('false');

    const updatedPanel = screen.getByRole('tabpanel');
    expect(updatedPanel.id).toBe('guest-profile-panel-reservations');
    expect(updatedPanel.getAttribute('aria-labelledby')).toBe('guest-profile-tab-reservations');

    // 8. Keyboard navigation: ArrowRight moves to next tab
    resTab.focus();
    fireEvent.keyDown(resTab, { key: 'ArrowRight' });
    const chargesTab = screen.getByRole('tab', { name: /Charges & Payments/i });
    expect(chargesTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(chargesTab);

    // 9. Keyboard navigation: ArrowLeft moves to previous tab
    fireEvent.keyDown(chargesTab, { key: 'ArrowLeft' });
    expect(resTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(resTab);

    // 10. Keyboard navigation: Home moves to first tab
    fireEvent.keyDown(resTab, { key: 'Home' });
    const overviewTab = screen.getByRole('tab', { name: /Overview/i });
    expect(overviewTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(overviewTab);

    // 11. Keyboard navigation: End moves to last tab
    fireEvent.keyDown(overviewTab, { key: 'End' });
    const activityTab = screen.getByRole('tab', { name: /Activity Log/i });
    expect(activityTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(activityTab);

    // 12. Keyboard navigation: Wrap-around from last to first on ArrowRight
    fireEvent.keyDown(activityTab, { key: 'ArrowRight' });
    expect(overviewTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(overviewTab);

    // 13. Keyboard navigation: Wrap-around from first to last on ArrowLeft
    fireEvent.keyDown(overviewTab, { key: 'ArrowLeft' });
    expect(activityTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(activityTab);

    // 14. No duplicate IDs across tabs and panels
    const allIds = [
      ...Array.from(document.querySelectorAll('[role="tab"]')).map((el) => el.id),
      ...Array.from(document.querySelectorAll('[role="tabpanel"]')).map((el) => el.id)
    ];
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('strictly isolates financial, charge, complaint, and invoice data between different guest profiles even with matching rooms', () => {
    const guestYounas = {
      id: 'GST-YOUNAS-1',
      name: 'Younas Khan',
      email: 'younas@example.com',
      phone: '+923001234567',
      city: 'Lahore',
      totalStays: 1,
      status: 'Active'
    };
    const guestAli = {
      id: 'GST-ALI-2',
      name: 'Ali Raza',
      email: 'ali@example.com',
      phone: '+923007654321',
      city: 'Karachi',
      totalStays: 1,
      status: 'Active'
    };
    saveGuests([guestYounas, guestAli]);

    // Both guests stayed in Room 101 in different bookings
    const reservations = [
      {
        id: 'RES-YOUNAS',
        bookingId: 'BK-YOUNAS',
        guestId: guestYounas.id,
        name: guestYounas.name,
        email: guestYounas.email,
        roomNumber: '101',
        roomType: 'Deluxe',
        checkIn: '2026-05-10',
        checkOut: '2026-05-12',
        status: 'Booked',
        payment: 'Paid'
      },
      {
        id: 'RES-ALI',
        bookingId: 'BK-ALI',
        guestId: guestAli.id,
        name: guestAli.name,
        email: guestAli.email,
        roomNumber: '101',
        roomType: 'Deluxe',
        checkIn: '2026-05-15',
        checkOut: '2026-05-17',
        status: 'Booked',
        payment: 'Pending'
      }
    ];
    saveReservations(reservations);

    // Invoices: Younas has paid invoice INV-YOUNAS-01
    const invoices = [
      {
        id: 'INV-YOUNAS-01',
        invoiceNumber: 'INV-YOUNAS-01',
        bookingId: 'RES-YOUNAS',
        guestId: guestYounas.id,
        guestName: guestYounas.name,
        guestEmail: guestYounas.email,
        roomNumber: '101',
        totalAmount: 1500.00,
        paidAmount: 1500.00,
        balanceDue: 0.00,
        status: 'Paid',
        items: []
      },
      {
        id: 'INV-ALI-01',
        invoiceNumber: 'INV-ALI-01',
        bookingId: 'RES-ALI',
        guestId: guestAli.id,
        guestName: guestAli.name,
        guestEmail: guestAli.email,
        roomNumber: '101',
        totalAmount: 300.00,
        paidAmount: 0.00,
        balanceDue: 300.00,
        status: 'Unpaid',
        items: []
      }
    ];
    saveInvoices(invoices);

    // Payments: Younas has payment PAY-YOUNAS-01
    savePayments([
      {
        id: 'PAY-YOUNAS-01',
        paymentId: 'PAY-YOUNAS-01',
        invoiceId: 'INV-YOUNAS-01',
        bookingId: 'RES-YOUNAS',
        guestId: guestYounas.id,
        amount: 1500.00,
        paymentMethod: 'Credit Card',
        status: 'Completed'
      }
    ]);

    // Folio Charges: Younas has a Spa charge on Room 101
    saveGuestCharges([
      {
        id: 'GC-YOUNAS',
        bookingId: 'RES-YOUNAS',
        guestId: guestYounas.id,
        guestName: guestYounas.name,
        roomNumber: '101',
        itemName: 'VIP Spa Package',
        amount: 500,
        status: 'Added to Folio'
      }
    ]);

    // 1. Render Younas profile and verify his data is present
    const { unmount: unmountYounas } = renderProfile(`/guests/${guestYounas.id}`);
    expect(screen.getAllByText('Younas Khan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$1500.00').length).toBeGreaterThan(0);
    unmountYounas();

    // 2. Render Ali's profile and verify Younas's data does NOT leak into Ali's profile
    const { unmount: unmountAli } = renderProfile(`/guests/${guestAli.id}`);
    expect(screen.getAllByText('Ali Raza').length).toBeGreaterThan(0);
    expect(screen.queryByText('Younas Khan')).toBeNull();
    expect(screen.queryByText('INV-YOUNAS-01')).toBeNull();
    expect(screen.queryByText('$1500.00')).toBeNull();
    expect(screen.queryByText('VIP Spa Package')).toBeNull();

    // Ali's own invoice ($300.00) should be visible on Invoices / Overview tab
    expect(screen.getAllByText('$300.00').length).toBeGreaterThan(0);
    unmountAli();
  });
});
