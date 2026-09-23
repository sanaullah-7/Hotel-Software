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

    // Verify modal opened with 'Add Booking' header and button
    expect(getByText('Add Booking', { selector: 'h2' })).toBeTruthy();
    expect(getByText('Add Booking', { selector: 'button' })).toBeTruthy();

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

    // Click Add Booking
    const submitBtn = getByText('Add Booking', { selector: 'button' });
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
});
