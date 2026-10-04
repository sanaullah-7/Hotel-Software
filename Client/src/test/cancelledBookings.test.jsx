import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CancelledBookings from '../features/reservations/pages/CancelledBookings';
import { saveReservations, getReservations } from '../features/reservations/state/reservationStore';

describe('CancelledBookings Canonical Alignment (Phase 7 Job 9)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders canonical cancelled records correctly', () => {
    saveReservations([
      {
        id: 101,
        name: 'Carlos Santana',
        package: 'All inclusive',
        roomType: 'Deluxe Room',
        status: 'Cancelled',
        checkIn: '2026-10-01',
        payment: 'Paid',
        email: 'carlos@example.com',
        mobile: '123456789'
      }
    ]);

    render(
      <MemoryRouter>
        <CancelledBookings />
      </MemoryRouter>
    );

    expect(screen.getByText('Carlos Santana')).toBeTruthy();
    expect(screen.getByText('Deluxe Room')).toBeTruthy();
    expect(screen.getAllByText('Cancelled').length).toBeGreaterThan(0);
  });

  it('filters out non-cancelled records (Pending, Booked, Checked In, Checked Out)', () => {
    saveReservations([
      { id: 1, name: 'Active Guest', status: 'Booked', email: 'active@test.com' },
      { id: 2, name: 'Pending Guest', status: 'Pending', email: 'pending@test.com' },
      { id: 3, name: 'CheckedIn Guest', status: 'Checked In', email: 'in@test.com' },
      { id: 4, name: 'CheckedOut Guest', status: 'Checked Out', email: 'out@test.com' },
      { id: 5, name: 'Cancelled Guest', status: 'Cancelled', email: 'cancelled@test.com' }
    ]);

    render(
      <MemoryRouter>
        <CancelledBookings />
      </MemoryRouter>
    );

    expect(screen.getByText('Cancelled Guest')).toBeTruthy();
    expect(screen.queryByText('Active Guest')).toBeNull();
    expect(screen.queryByText('Pending Guest')).toBeNull();
    expect(screen.queryByText('CheckedIn Guest')).toBeNull();
    expect(screen.queryByText('CheckedOut Guest')).toBeNull();
  });

  it('handles empty canonical state without re-seeding mock records', () => {
    saveReservations([]);

    render(
      <MemoryRouter>
        <CancelledBookings />
      </MemoryRouter>
    );

    expect(screen.getByText('No cancelled bookings found.')).toBeTruthy();
    expect(screen.queryByText('John Doe')).toBeNull();
    expect(screen.queryByText('Jane Smith')).toBeNull();
  });

  it('synchronizes dynamically when a reservation becomes cancelled elsewhere', () => {
    saveReservations([
      { id: 1, name: 'Evolving Guest', status: 'Booked', email: 'evolving@test.com' }
    ]);

    render(
      <MemoryRouter>
        <CancelledBookings />
      </MemoryRouter>
    );

    expect(screen.queryByText('Evolving Guest')).toBeNull();

    act(() => {
      saveReservations([
        { id: 1, name: 'Evolving Guest', status: 'Cancelled', email: 'evolving@test.com' }
      ]);
    });

    expect(screen.getByText('Evolving Guest')).toBeTruthy();
  });

  it('filters canonical records via search query', () => {
    saveReservations([
      { id: 1, name: 'Alice Walker', status: 'Cancelled', email: 'alice@wonder.com', mobile: '111222' },
      { id: 2, name: 'Bob Dylan', status: 'Cancelled', email: 'bob@music.com', mobile: '333444' }
    ]);

    render(
      <MemoryRouter>
        <CancelledBookings />
      </MemoryRouter>
    );

    expect(screen.getByText('Alice Walker')).toBeTruthy();
    expect(screen.getByText('Bob Dylan')).toBeTruthy();

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Dylan' } });

    expect(screen.queryByText('Alice Walker')).toBeNull();
    expect(screen.getByText('Bob Dylan')).toBeTruthy();
  });

  it('re-reads canonical reservation data on refresh/remount instead of resetting to demo data', () => {
    saveReservations([
      { id: 50, name: 'Persistent Cancelled Guest', status: 'Cancelled', email: 'persist@test.com' }
    ]);

    const { unmount } = render(
      <MemoryRouter>
        <CancelledBookings />
      </MemoryRouter>
    );

    expect(screen.getByText('Persistent Cancelled Guest')).toBeTruthy();

    // Click refresh button
    const refreshBtn = screen.getByTitle('Refresh');
    fireEvent.click(refreshBtn);
    expect(screen.getByText('Persistent Cancelled Guest')).toBeTruthy();

    unmount();

    // Remount
    render(
      <MemoryRouter>
        <CancelledBookings />
      </MemoryRouter>
    );

    expect(screen.getByText('Persistent Cancelled Guest')).toBeTruthy();
    expect(screen.queryByText('John Doe')).toBeNull();
  });
});
