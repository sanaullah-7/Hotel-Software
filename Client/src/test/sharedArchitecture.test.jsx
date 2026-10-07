import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PersonAdd } from '@mui/icons-material';
import { MemoryRouter } from 'react-router-dom';
import EventSummaryCards from '../features/events/components/EventSummaryCards';
import PaginationControls from '../components/common/PaginationControls';
import EventToolbar from '../features/events/components/EventToolbar';
import BookingsGridTable from '../pages/Dashboard/components/BookingsGridTable';
import ReservationTable from '../features/reservations/components/ReservationTable';
import ModalShell from '../components/common/ModalShell';
import ReservationFormModal from '../features/reservations/components/ReservationFormModal';
import ReservationDeleteModal from '../features/reservations/components/ReservationDeleteModal';
import Rooms from '../features/rooms/pages/Rooms';

describe('shared KPI and pagination UI', () => {
  it('renders event summary cards through the shared KPI badge variant', () => {
    render(
      <EventSummaryCards
        cards={[
          {
            id: 'total-events',
            title: 'Total Events',
            value: 8,
            subtext: '2 today',
            icon: PersonAdd,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600'
          }
        ]}
      />
    );

    expect(screen.getByText('Total Events')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('2 today')).toBeTruthy();
  });

  it('renders numbered pagination and forwards page selection while preserving record labels', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <PaginationControls
        currentPage={1}
        totalPages={3}
        totalRecords={25}
        rowsPerPage={10}
        onPageChange={onPageChange}
        recordLabel="charges"
        variant="numbered"
      />
    );

    expect(container.textContent.replace(/\s+/g, ' ')).toContain('Showing 1 to 10 of 25 charges');
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(5);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[4].disabled).toBe(false);

    fireEvent.click(buttons[2]);
    expect(onPageChange).toHaveBeenCalledWith(2);
    fireEvent.click(buttons[4]);
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it('provides accessible names for icon-only action buttons in toolbars and tables', () => {
    render(
      <EventToolbar
        searchQuery=""
        onSearchChange={() => {}}
        isFilterOpen={false}
        onToggleFilter={() => {}}
        viewMode="table"
        onViewModeChange={() => {}}
        onRefresh={() => {}}
        onExportPDF={() => {}}
        onExportExcel={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Filter events' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Table view' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Grid view' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export PDF' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export Excel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeTruthy();

    render(
      <BookingsGridTable
        filteredBookings={[{
          id: 'test-1',
          bookingId: 'BK-1',
          name: 'Jane Doe',
          avatar: '',
          room: '101',
          roomType: 'Deluxe',
          checkIn: '2026-09-28',
          checkOut: '2026-09-30',
          inventory: [],
          amount: '200',
          paid: '200',
          dues: '0',
          status: 'Booked',
          payment: 'Paid',
          mobile: '1234567890'
        }]}
        handleRowClick={() => {}}
        activeMenuId={null}
        toggleMenu={() => {}}
        setActiveMenuId={() => {}}
        openViewModal={() => {}}
        openEditModal={() => {}}
        confirmDelete={() => {}}
        handleCheckout={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'More actions' })).toBeTruthy();
  });
});

describe('accessible table action menus', () => {
  it('manages ARIA semantics, focus, and keyboard navigation in BookingsGridTable action menus', () => {
    const setActiveMenuId = vi.fn();
    const toggleMenu = vi.fn();
    const booking = {
      id: 'bk-1',
      bookingId: 'BK-1',
      name: 'John Doe',
      avatar: '',
      room: '101',
      roomType: 'Deluxe',
      checkIn: '2026-09-28',
      checkOut: '2026-09-30',
      status: 'Booked',
      payment: 'Paid',
      mobile: '1234567890'
    };

    // 1. Closed state
    const { rerender } = render(
      <BookingsGridTable
        filteredBookings={[booking]}
        handleRowClick={() => {}}
        activeMenuId={null}
        toggleMenu={toggleMenu}
        setActiveMenuId={setActiveMenuId}
        openViewModal={() => {}}
        openEditModal={() => {}}
        confirmDelete={() => {}}
        handleCheckout={() => {}}
        confirmCancel={() => {}}
      />
    );

    const trigger = screen.getByRole('button', { name: 'More actions' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBeNull();
    expect(trigger.id).toBe('booking-actions-trigger-bk-1');
    expect(screen.queryByRole('menu')).toBeNull();

    // 2. Open state
    rerender(
      <BookingsGridTable
        filteredBookings={[booking]}
        handleRowClick={() => {}}
        activeMenuId="bk-1"
        toggleMenu={toggleMenu}
        setActiveMenuId={setActiveMenuId}
        openViewModal={() => {}}
        openEditModal={() => {}}
        confirmDelete={() => {}}
        handleCheckout={() => {}}
        confirmCancel={() => {}}
      />
    );

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe('booking-actions-menu-bk-1');

    const menu = screen.getByRole('menu');
    expect(menu.id).toBe('booking-actions-menu-bk-1');
    expect(menu.getAttribute('aria-labelledby')).toBe('booking-actions-trigger-bk-1');

    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(5);
    items.forEach((item) => {
      expect(item.getAttribute('tabindex')).toBe('-1');
    });

    // Focus automatically moves to the first menu item when opened
    expect(document.activeElement).toBe(items[0]);
    expect(items[0].textContent).toContain('View Details');

    // ArrowDown moves to next item
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);
    expect(items[1].textContent).toContain('Edit Booking');

    // ArrowUp moves back to previous item
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[0]);

    // ArrowUp from first item wraps to last item
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[4]);
    expect(items[4].textContent).toContain('Cancel Booking');

    // ArrowDown from last item wraps back to first item
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[0]);

    // Escape closes menu and returns focus to the trigger
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(setActiveMenuId).toHaveBeenCalledWith(null);
    expect(document.activeElement).toBe(trigger);

    // Tab closes menu without trapping focus
    fireEvent.keyDown(menu, { key: 'Tab' });
    expect(setActiveMenuId).toHaveBeenLastCalledWith(null);
  });

  it('handles multi-row independence and skips disabled items in ReservationTable action menus', () => {
    const onToggleMenu = vi.fn();
    const onCloseMenu = vi.fn();
    const bookings = [
      {
        id: 'res-1',
        name: 'Alice Smith',
        status: 'Checked In', // When Checked In: Delete is disabled, Checkout is enabled, Cancel is disabled
        roomType: 'Suite',
        package: 'All inclusive',
        checkIn: '2026-09-28',
        checkOut: '2026-10-02',
        payment: 'Paid',
        mobile: '1112223333'
      },
      {
        id: 'res-2',
        name: 'Bob Jones',
        status: 'Booked',
        roomType: 'Deluxe',
        package: 'Bed & Breakfast',
        checkIn: '2026-10-01',
        checkOut: '2026-10-05',
        payment: 'Paid',
        mobile: '4445556666'
      }
    ];

    render(
      <MemoryRouter>
        <ReservationTable
          bookings={bookings}
          activeMenuId="res-1"
          onToggleMenu={onToggleMenu}
          onCloseMenu={onCloseMenu}
          onRowClick={() => {}}
          onOpenViewModal={() => {}}
          onOpenEditModal={() => {}}
          onConfirmDelete={() => {}}
          onConfirmCancel={() => {}}
          onCheckout={() => {}}
        />
      </MemoryRouter>
    );

    const triggers = screen.getAllByRole('button', { name: 'More actions' });
    expect(triggers).toHaveLength(2);

    // Row 1 trigger is expanded, row 2 is not
    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(triggers[0].getAttribute('aria-controls')).toBe('reservation-actions-menu-res-1');
    expect(triggers[0].id).toBe('reservation-actions-trigger-res-1');

    expect(triggers[1].getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1].getAttribute('aria-controls')).toBeNull();
    expect(triggers[1].id).toBe('reservation-actions-trigger-res-2');

    const menu = screen.getByRole('menu');
    expect(menu.id).toBe('reservation-actions-menu-res-1');
    expect(menu.getAttribute('aria-labelledby')).toBe('reservation-actions-trigger-res-1');

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(4);

    // Row 1 status is "Checked In": Cancel Booking (item 3) is disabled
    expect(menuItems[3].disabled).toBe(true);

    // First enabled item receives focus
    expect(document.activeElement).toBe(menuItems[0]); // View Booking

    // ArrowDown moves to Edit Booking (item 1)
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItems[1]); // Edit Booking

    // Next ArrowDown moves to Check Out (item 2)
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItems[2]); // Check Out

    // Next ArrowDown should SKIP disabled Cancel Booking (item 3) and WRAP to View Booking (item 0)
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItems[0]); // View Booking

    // Escape closes menu and returns focus to Row 1 trigger
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(onCloseMenu).toHaveBeenCalled();
    expect(document.activeElement).toBe(triggers[0]);
  });
});

describe('accessible modal and dialog management', () => {
  it('manages dialog semantics, focus-on-open, Tab trapping, Escape, and focus restoration in ModalShell', () => {
    const onClose = vi.fn();
    const TriggerWrapper = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div>
          <button id="open-btn" onClick={() => setIsOpen(true)}>
            Open Dialog
          </button>
          <ModalShell open={isOpen} onClose={() => { setIsOpen(false); onClose(); }} title="Guest History">
            <button id="modal-action-1">Action 1</button>
            <button id="modal-action-2">Action 2</button>
          </ModalShell>
        </div>
      );
    };

    render(<TriggerWrapper />);

    const openBtn = screen.getByRole('button', { name: 'Open Dialog' });
    openBtn.focus();
    expect(document.activeElement).toBe(openBtn);

    // Open the modal
    fireEvent.click(openBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(screen.getByText('Guest History').id).toBe(dialog.getAttribute('aria-labelledby'));

    // Focus automatically enters the dialog (first interactive control, which is the close button or first interactive child)
    const closeBtn = screen.getByRole('button', { name: 'Close dialog' });
    const action2 = screen.getByRole('button', { name: 'Action 2' });

    // Focus entered dialog
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Tab wraps around inside modal
    action2.focus();
    expect(document.activeElement).toBe(action2);
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);

    // Shift+Tab from first element wraps to last element
    closeBtn.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(action2);

    // Escape closes modal and returns focus to the trigger
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(openBtn);
  });

  it('provides dialog semantics, initial form field focus, Escape dismissal, and form handling in ReservationFormModal', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    const FormTriggerWrapper = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div>
          <button id="open-res-form" onClick={() => setIsOpen(true)}>
            Add Booking
          </button>
          <ReservationFormModal
            open={isOpen}
            onClose={() => { setIsOpen(false); onClose(); }}
            onSave={onSave}
            form={{ firstName: 'Test', lastName: 'Guest' }}
          />
        </div>
      );
    };

    render(<FormTriggerWrapper />);

    const openBtn = screen.getByRole('button', { name: 'Add Booking' });
    openBtn.focus();
    fireEvent.click(openBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Add New Booking' }).id).toBe(dialog.getAttribute('aria-labelledby'));

    // Focus enters dialog
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Escape closes the dialog and restores focus
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(openBtn);
  });

  it('exposes dialog semantics, Escape dismissal, and focus restoration in ReservationDeleteModal', () => {
    const onClose = vi.fn();
    const onDelete = vi.fn();

    const DeleteTriggerWrapper = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div>
          <button id="open-del-modal" onClick={() => setIsOpen(true)}>
            Delete Booking
          </button>
          <ReservationDeleteModal
            open={isOpen}
            booking={{ name: 'Jane Doe', email: 'jane@example.com', mobile: '555-1234' }}
            onClose={() => { setIsOpen(false); onClose(); }}
            onDelete={onDelete}
          />
        </div>
      );
    };

    render(<DeleteTriggerWrapper />);

    const openBtn = screen.getByRole('button', { name: 'Delete Booking' });
    openBtn.focus();
    fireEvent.click(openBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(screen.getByText('Are you sure?').id).toBe(dialog.getAttribute('aria-labelledby'));

    expect(dialog.contains(document.activeElement)).toBe(true);

    // Press Escape to cancel delete
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(openBtn);
  });

  it('provides programmatic label associations for all form controls in ReservationFormModal', () => {
    render(
      <ReservationFormModal
        open={true}
        onClose={() => {}}
        form={{}}
        onFormChange={() => {}}
        onSave={() => {}}
      />
    );

    // Standard text, email, number, date inputs
    expect(screen.getByLabelText(/First Name \*/i)).toHaveProperty('id', 'res-first-name');
    expect(screen.getByLabelText(/^Last Name$/i)).toHaveProperty('id', 'res-last-name');
    expect(screen.getByLabelText(/Email Address/i)).toHaveProperty('id', 'res-email');
    expect(screen.getByLabelText(/^Mobile$/i)).toHaveProperty('id', 'res-mobile');
    expect(screen.getByLabelText(/^City$/i)).toHaveProperty('id', 'res-city');
    expect(screen.getByLabelText(/ID\/Passport Number/i)).toHaveProperty('id', 'res-passport');
    expect(screen.getByLabelText(/^Nationality$/i)).toHaveProperty('id', 'res-nationality');
    expect(screen.getByLabelText(/Check In Date/i)).toHaveProperty('id', 'res-check-in');
    expect(screen.getByLabelText(/Check Out Date/i)).toHaveProperty('id', 'res-check-out');
    expect(screen.getByLabelText(/Total Person \*/i)).toHaveProperty('id', 'res-total-person');
    expect(screen.getByLabelText(/Number of Rooms/i)).toHaveProperty('id', 'res-num-rooms');
    expect(screen.getByLabelText(/Room \/ Room No\./i)).toHaveProperty('id', 'res-room-no');
    expect(screen.getByLabelText(/Discount Code/i)).toHaveProperty('id', 'res-discount-code');
    expect(screen.getByLabelText(/Booking Reference/i)).toHaveProperty('id', 'res-booking-ref');
    expect(screen.getByLabelText(/Emergency Contact Name/i)).toHaveProperty('id', 'res-emergency-name');
    expect(screen.getByLabelText(/Emergency Contact Phone/i)).toHaveProperty('id', 'res-emergency-phone');
    expect(screen.getByLabelText(/^Address$/i)).toHaveProperty('id', 'res-address');
    expect(screen.getByLabelText(/Special Requests/i)).toHaveProperty('id', 'res-special-requests');
    expect(screen.getByLabelText(/Upload Guest Image \/ Photo/i)).toHaveProperty('id', 'res-guest-image');
    expect(screen.getByLabelText(/^Note$/i)).toHaveProperty('id', 'res-note');

    // Select dropdowns
    expect(screen.getByLabelText(/^Gender$/i)).toHaveProperty('id', 'res-gender');
    expect(screen.getByLabelText(/Select Package Type/i)).toHaveProperty('id', 'res-package');
    expect(screen.getByLabelText(/Select Room Type/i)).toHaveProperty('id', 'res-room-type');
    expect(screen.getByLabelText(/Arrival Time/i)).toHaveProperty('id', 'res-arrival-time');
    expect(screen.getByLabelText(/Purpose of Stay/i)).toHaveProperty('id', 'res-purpose');
    expect(screen.getByLabelText(/Payment Method/i)).toHaveProperty('id', 'res-payment-method');

    // Clicking visible label focuses input
    const firstNameLabel = screen.getByText('First Name *');
    fireEvent.click(firstNameLabel);
    expect(document.activeElement).toBe(screen.getByLabelText(/First Name \*/i));
  });

  it('provides programmatic label associations for inline Add/Edit room form fields in Rooms', () => {
    render(
      <MemoryRouter>
        <Rooms />
      </MemoryRouter>
    );

    // Open Add Room modal
    const addBtn = screen.getByRole('button', { name: 'Add room' });
    fireEvent.click(addBtn);

    // TextFields with labels
    expect(screen.getByLabelText(/Room No/i)).toHaveProperty('id', 'room-form-room-no');
    expect(screen.getByLabelText(/^Capacity$/i)).toHaveProperty('id', 'room-form-capacity');
    expect(screen.getByLabelText(/^Rent/i)).toHaveProperty('id', 'room-form-rent');
    expect(screen.getByLabelText(/Mobile/i)).toHaveProperty('id', 'room-form-mobile');

    // MUI Selects with labels
    expect(screen.getByRole('combobox', { name: /Select Room Type\*/i })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: /AC\/Non AC\*/i })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: /Select Meal\*/i })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: /Status\*/i })).toBeTruthy();
  });
});
