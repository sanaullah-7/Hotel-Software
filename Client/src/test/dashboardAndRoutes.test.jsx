import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PersonAdd } from '@mui/icons-material';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import Dashboard from '../pages/Dashboard/Dashboard';
import CurrentBookingsTable from '../pages/Dashboard/components/CurrentBookingsTable';

describe('Dashboard and Shared UI Components', () => {
  it('renders KPICard with ForwardRef MUI Icon correctly in compact variant', () => {
    const { getByText } = render(
      <KPICard
        title="Reservation Today"
        value={12}
        icon={PersonAdd}
        variant="compact"
      />
    );
    expect(getByText('Reservation Today')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
  });

  it('renders KPICard with badge and horizontal variants', () => {
    const { getByText } = render(
      <div>
        <KPICard
          title="Total Events"
          value={5}
          subtext="2 today"
          icon={PersonAdd}
          variant="badge"
        />
        <KPICard
          title="Total Guests"
          value={45}
          icon={PersonAdd}
          variant="horizontal"
        />
      </div>
    );
    expect(getByText('Total Events')).toBeTruthy();
    expect(getByText('Total Guests')).toBeTruthy();
  });

  it('renders StatusBadge with icon without runtime errors', () => {
    const { getByText } = render(
      <StatusBadge status="Booked" icon={PersonAdd} />
    );
    expect(getByText('Booked')).toBeTruthy();
  });

  it('renders Dashboard without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('allows adding a booking and typing into all form inputs', () => {
    const { getByTitle, getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <CurrentBookingsTable />
      </MemoryRouter>
    );

    // Open Add Booking modal
    const addBtn = getByTitle('Add Booking');
    fireEvent.click(addBtn);

    // Verify modal opened with 'Add New Booking' header and button
    expect(getByText('Add New Booking', { selector: 'h2' })).toBeTruthy();
    expect(getByText('Add New Booking', { selector: 'button' })).toBeTruthy();

    // Type into inputs
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const mobileInput = getByPlaceholderText('123456789');
    const roomInput = getByPlaceholderText('e.g. 101, 102, 201');

    fireEvent.change(firstNameInput, { target: { value: 'Zaid' } });
    fireEvent.change(lastNameInput, { target: { value: 'Khan' } });
    fireEvent.change(mobileInput, { target: { value: '5551234' } });
    fireEvent.change(roomInput, { target: { value: '305' } });

    expect(firstNameInput.value).toBe('Zaid');
    expect(lastNameInput.value).toBe('Khan');
    expect(mobileInput.value).toBe('5551234');
    expect(roomInput.value).toBe('305');

    // Click Add New Booking
    const submitBtn = getByText('Add New Booking', { selector: 'button' });
    fireEvent.click(submitBtn);

    // Verify new booking and Room 305 are rendered in table
    expect(getByText('Zaid Khan')).toBeTruthy();
    expect(getByText('Room 305')).toBeTruthy();
  });

  it('renders Room column in table headers and rows', () => {
    const { getByText, getAllByText } = render(
      <MemoryRouter>
        <CurrentBookingsTable />
      </MemoryRouter>
    );

    expect(getByText('Room', { selector: 'th' })).toBeTruthy();
    expect(getAllByText(/Room \d+/).length).toBeGreaterThan(0);
  });

  it('filters by date buttons correctly', () => {
    const { getByText } = render(
      <MemoryRouter>
        <CurrentBookingsTable />
      </MemoryRouter>
    );

    const weeklyBtn = getByText('Weekly');
    fireEvent.click(weeklyBtn);
    expect(weeklyBtn.className).toContain('text-[#1b7f43]');

    const monthlyBtn = getByText('Monthly');
    fireEvent.click(monthlyBtn);
    expect(monthlyBtn.className).toContain('text-[#1b7f43]');
  });

  it('renders Occupancy with always-visible Clear button and functional clear action', async () => {
    const { default: Occupancy } = await import('../features/occupancy/pages/Occupancy');
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Occupancy />
      </MemoryRouter>
    );

    const searchInput = getByPlaceholderText('Search rooms, guests...');
    fireEvent.change(searchInput, { target: { value: 'Deluxe' } });
    expect(searchInput.value).toBe('Deluxe');

    const clearBtn = getByText('Clear');
    expect(clearBtn).toBeTruthy();
    fireEvent.click(clearBtn);

    expect(searchInput.value).toBe('');
  });

  it('renders CheckInOut table with visible Booking IDs in the Booking ID column', async () => {
    const { default: CheckInOut } = await import('../features/front-office/pages/CheckInOut');
    const { getByText } = render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    // Verify header and booking IDs
    expect(getByText('Booking ID', { selector: 'th' })).toBeTruthy();
    expect(getByText('BK-1001')).toBeTruthy();
    expect(getByText('BK-1002')).toBeTruthy();
  });

  it('renders GuestComplaint with working delete confirmation modal and text truncation', async () => {
    const { default: GuestComplaint } = await import('../features/front-office/pages/GuestComplaint');
    const { getByText, queryByText, getAllByTitle } = render(
      <MemoryRouter>
        <GuestComplaint />
      </MemoryRouter>
    );

    // Verify initial complaint exists
    expect(getByText('John Doe')).toBeTruthy();

    // Click delete icon for first complaint
    const deleteButtons = getAllByTitle('Delete Complaint');
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);

    // Delete confirmation modal should appear
    expect(getByText('Are you sure?')).toBeTruthy();

    // Confirm deletion
    const confirmDeleteBtn = getByText('Delete', { selector: 'button' });
    fireEvent.click(confirmDeleteBtn);

    // Complaint John Doe should now be deleted
    expect(queryByText('John Doe')).toBeNull();
  });

  it('renders AllReservations with no Email column and no column selection filter', async () => {
    const { default: AllReservations } = await import('../features/reservations/pages/AllReservations');
    const { getByText, queryByText, queryByTitle, container } = render(
      <MemoryRouter>
        <AllReservations />
      </MemoryRouter>
    );

    // Verify expected columns exist
    expect(getByText('Name', { selector: 'th' })).toBeTruthy();
    expect(getByText('Package', { selector: 'th' })).toBeTruthy();
    expect(getByText('Room Type', { selector: 'th' })).toBeTruthy();
    expect(getByText('Status', { selector: 'th' })).toBeTruthy();
    expect(getByText('Check In', { selector: 'th' })).toBeTruthy();
    expect(getByText('Check Out', { selector: 'th' })).toBeTruthy();
    expect(getByText('Payment', { selector: 'th' })).toBeTruthy();
    expect(getByText('Dues', { selector: 'th' })).toBeTruthy();
    expect(getByText('Mobile', { selector: 'th' })).toBeTruthy();
    expect(getByText('Actions', { selector: 'th' })).toBeTruthy();

    // Verify Email column does NOT exist in table headers
    expect(queryByText('Email', { selector: 'th' })).toBeNull();

    // Verify Email text does not appear in table body cells
    expect(queryByText('test@email.com')).toBeNull();

    // Verify Filter / Show/Hide Column button is not in the toolbar
    expect(queryByTitle('Filter')).toBeNull();
    expect(queryByText('Show/Hide Column')).toBeNull();

    // Verify other toolbar buttons remain intact
    expect(queryByTitle('Add New Booking')).toBeTruthy();
    expect(queryByTitle('Refresh')).toBeTruthy();
    expect(queryByTitle('Export CSV')).toBeTruthy();
    expect(queryByTitle('Export PDF')).toBeTruthy();
  });

  it('renders ReservationHistory with working date filters, Dues column, and Export CSV', async () => {
    const { default: ReservationHistory } = await import('../features/reservations/pages/ReservationHistory');
    const { getByText, queryByText, getByTitle } = render(
      <MemoryRouter>
        <ReservationHistory />
      </MemoryRouter>
    );

    // 1. Verify Dues column exists and Remaining does NOT exist
    expect(getByText('Dues', { selector: 'th' })).toBeTruthy();
    expect(queryByText('Remaining', { selector: 'th' })).toBeNull();

    // 2. Verify all other required headers are present
    expect(getByText('Res ID', { selector: 'th' })).toBeTruthy();
    expect(getByText('Guest Name', { selector: 'th' })).toBeTruthy();
    expect(getByText('Mobile No', { selector: 'th' })).toBeTruthy();
    expect(getByText('Room / Type', { selector: 'th' })).toBeTruthy();
    expect(getByText('Reservation Date', { selector: 'th' })).toBeTruthy();
    expect(getByText('Check-In', { selector: 'th' })).toBeTruthy();
    expect(getByText('Check-Out', { selector: 'th' })).toBeTruthy();
    expect(getByText('Inventory', { selector: 'th' })).toBeTruthy();
    expect(getByText('Total Price', { selector: 'th' })).toBeTruthy();
    expect(getByText('Payment', { selector: 'th' })).toBeTruthy();
    expect(getByText('Action', { selector: 'th' })).toBeTruthy();

    // 3. Test Daily filter (default active)
    expect(getByText('Sarah Smith')).toBeTruthy();

    // 4. Test Monthly filter
    const monthlyBtn = getByText('Monthly', { selector: 'button' });
    fireEvent.click(monthlyBtn);
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Sarah Smith')).toBeTruthy();

    // 5. Test Yearly filter
    const yearlyBtn = getByText('Yearly', { selector: 'button' });
    fireEvent.click(yearlyBtn);
    expect(getByText('Ahsan Khan')).toBeTruthy();
    expect(getByText('Maria Garcia')).toBeTruthy();

    // 6. Test Export CSV button exists and is clickable
    const exportBtn = getByTitle('Export CSV');
    expect(exportBtn).toBeTruthy();
    fireEvent.click(exportBtn);
  });
});


