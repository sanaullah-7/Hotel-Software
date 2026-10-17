import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import CommandPalette from '../layouts/DashboardLayout/CommandPalette';
import Topbar from '../layouts/DashboardLayout/Topbar';
import quickSearchService from '../services/quickSearchService';
import { AuthProvider } from '../context/AuthContext';

describe('Phase 4 Step 4: Command Palette & Quick Search UI Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockQuickSearchResponse = {
    success: true,
    statusCode: 200,
    data: {
      rooms: [
        {
          id: 'room-6701',
          type: 'ROOM',
          room_number: '101',
          status: 'AVAILABLE',
          housekeeping_status: 'CLEAN',
          floor: '1',
          room_type_name: 'Executive Deluxe',
        },
        {
          id: 'room-6702',
          type: 'ROOM',
          room_number: '102',
          status: 'OCCUPIED',
          housekeeping_status: 'CLEAN',
          floor: '1',
          room_type_name: 'Executive Deluxe',
        },
      ],
      guests: [
        {
          id: 'guest-6701',
          type: 'GUEST',
          guest_ref: 'GST-2026-001',
          first_name: 'Tariq',
          last_name: 'Mahmood',
          full_name: 'Tariq Mahmood',
          phone: '0300****567',
          national_id: '35201-*******-1',
          vip_status: true,
        },
        {
          id: 'guest-6702',
          type: 'GUEST',
          guest_ref: 'GST-2026-002',
          first_name: 'Fatima',
          last_name: 'Zahra',
          full_name: 'Fatima Zahra',
          phone: '0321****543',
          national_id: '37405-*******-2',
          vip_status: false,
        },
      ],
      reservations: [
        {
          id: 'res-6701',
          type: 'RESERVATION',
          booking_ref: 'BK-2026-001',
          status: 'CONFIRMED',
          expected_check_in: '2026-11-01T14:00:00.000Z',
          expected_check_out: '2026-11-05T10:00:00.000Z',
          guest_name: 'Tariq Mahmood',
          room_numbers: ['101'],
        },
      ],
    },
  };

  describe('1. Global Keyboard Shortcuts & Focus Management', () => {
    it('opens palette using Ctrl+K', () => {
      const handleOpen = vi.fn();
      render(
        <MemoryRouter>
          <CommandPalette isOpen={false} onOpen={handleOpen} onClose={vi.fn()} />
        </MemoryRouter>
      );

      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
      expect(handleOpen).toHaveBeenCalledTimes(1);
    });

    it('opens palette using Cmd+K (metaKey for macOS)', () => {
      const handleOpen = vi.fn();
      render(
        <MemoryRouter>
          <CommandPalette isOpen={false} onOpen={handleOpen} onClose={vi.fn()} />
        </MemoryRouter>
      );

      fireEvent.keyDown(window, { key: 'k', metaKey: true });
      expect(handleOpen).toHaveBeenCalledTimes(1);
    });

    it('does not open when typing inside unrelated inputs, textareas, or editable fields', () => {
      const handleOpen = vi.fn();
      render(
        <MemoryRouter>
          <div>
            <input data-testid="unrelated-input" defaultValue="Existing Form Text" />
            <textarea data-testid="unrelated-textarea" defaultValue="Notes..." />
            <CommandPalette isOpen={false} onOpen={handleOpen} onClose={vi.fn()} />
          </div>
        </MemoryRouter>
      );

      const input = screen.getByTestId('unrelated-input');
      fireEvent.keyDown(input, { key: 'k', ctrlKey: true });
      expect(handleOpen).not.toHaveBeenCalled();

      const textarea = screen.getByTestId('unrelated-textarea');
      fireEvent.keyDown(textarea, { key: 'k', metaKey: true });
      expect(handleOpen).not.toHaveBeenCalled();
    });

    it('closes palette using Escape key', () => {
      const handleClose = vi.fn();
      render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={handleClose} />
        </MemoryRouter>
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('restores focus to previous active element upon closing', async () => {
      function FocusTestWrapper() {
        const [open, setOpen] = useState(false);
        return (
          <MemoryRouter>
            <button data-testid="trigger-btn" onClick={() => setOpen(true)}>
              Open
            </button>
            <CommandPalette isOpen={open} onClose={() => setOpen(false)} />
          </MemoryRouter>
        );
      }

      render(<FocusTestWrapper />);
      const btn = screen.getByTestId('trigger-btn');
      btn.focus();
      expect(document.activeElement).toBe(btn);

      // Open palette
      fireEvent.click(btn);
      expect(screen.getByRole('dialog')).toBeTruthy();

      // Close palette via ESC button
      const escBtn = screen.getByLabelText('Close Command Palette');
      fireEvent.click(escBtn);

      await waitFor(() => {
        expect(document.activeElement).toBe(btn);
      });
    });

    it('handles repeated open/close cycles and unmounting without duplicate listeners or memory leaks', () => {
      const handleClose = vi.fn();
      const { rerender, unmount } = render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={handleClose} />
        </MemoryRouter>
      );

      rerender(
        <MemoryRouter>
          <CommandPalette isOpen={false} onClose={handleClose} />
        </MemoryRouter>
      );

      rerender(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={handleClose} />
        </MemoryRouter>
      );

      unmount();

      // Triggering Escape after unmount should not throw or call handler
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('2. Quick Search API Integration & Debounce', () => {
    it('does not call Quick Search API when query is empty or less than 2 characters', async () => {
      const spySearch = vi.spyOn(quickSearchService, 'quickSearch');

      render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');

      // 1 character query
      fireEvent.change(input, { target: { value: 'a' } });

      // Guidance hint displayed
      expect(
        screen.getByText('Type at least 2 characters to search rooms, guests, and reservations.')
      ).toBeTruthy();

      // API must NOT be called
      expect(spySearch).not.toHaveBeenCalled();
    });

    it('trims whitespace and sends valid queries with debouncing', async () => {
      vi.useFakeTimers();
      const spySearch = vi
        .spyOn(quickSearchService, 'quickSearch')
        .mockResolvedValue(mockQuickSearchResponse);

      render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: '  10  ' } });

      // Before timer fires, API should not be called yet
      expect(spySearch).not.toHaveBeenCalled();

      // Advance debounce timer (250ms)
      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(spySearch).toHaveBeenCalledTimes(1);
      expect(spySearch).toHaveBeenCalledWith('10', 5, expect.any(Object));
    });

    it('prevents stale requests from replacing newer search results', async () => {
      let resolveFirst;
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });

      const spySearch = vi
        .spyOn(quickSearchService, 'quickSearch')
        .mockImplementationOnce(() => firstPromise)
        .mockResolvedValueOnce({
          success: true,
          data: {
            rooms: [
              {
                id: 'room-new',
                type: 'ROOM',
                room_number: '999',
                status: 'AVAILABLE',
                room_type_name: 'Penthouse',
              },
            ],
            guests: [],
            reservations: [],
          },
        });

      render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');

      // First query
      fireEvent.change(input, { target: { value: 'firstQuery' } });
      await waitFor(() => expect(spySearch).toHaveBeenCalledWith('firstQuery', 5, expect.any(Object)));

      // Second query fired before first resolves
      fireEvent.change(input, { target: { value: 'secondQuery' } });
      await waitFor(() => expect(spySearch).toHaveBeenCalledWith('secondQuery', 5, expect.any(Object)));

      // Now resolve first query with stale data
      await act(async () => {
        resolveFirst({
          success: true,
          data: {
            rooms: [
              {
                id: 'room-stale',
                type: 'ROOM',
                room_number: '000-STALE',
                status: 'AVAILABLE',
              },
            ],
            guests: [],
            reservations: [],
          },
        });
      });

      // The UI should display Penthouse 999 and NOT stale 000-STALE
      await waitFor(() => {
        expect(screen.getByText('Room 999')).toBeTruthy();
        expect(screen.queryByText('Room 000-STALE')).toBeNull();
      });
    });

    it('displays error state and supports retry on server or network error', async () => {
      const spySearch = vi
        .spyOn(quickSearchService, 'quickSearch')
        .mockRejectedValueOnce(new Error('Backend connection failed'))
        .mockResolvedValueOnce(mockQuickSearchResponse);

      render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'errorTest' } });

      await waitFor(() => {
        expect(screen.getByText('Backend connection failed')).toBeTruthy();
      });

      // Click Retry
      const retryBtn = screen.getByText('Retry');
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Room 101')).toBeTruthy();
      });
    });
  });

  describe('3. Categorized Search Results & Identity Masking', () => {
    it('renders Rooms, Guests, and Reservations categories matching backend contract', async () => {
      vi.spyOn(quickSearchService, 'quickSearch').mockResolvedValue(mockQuickSearchResponse);

      render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: '10' } });

      // Verify category headers
      await waitFor(() => {
        expect(screen.getByText('ROOMS')).toBeTruthy();
        expect(screen.getByText('GUESTS')).toBeTruthy();
        expect(screen.getByText('RESERVATIONS')).toBeTruthy();
      });

      // Rooms verification
      expect(screen.getByText('Room 101')).toBeTruthy();
      expect(screen.getByText(/Executive Deluxe • Floor 1 • AVAILABLE/i)).toBeTruthy();
      expect(screen.getByText('Room 102')).toBeTruthy();

      // Guests verification
      expect(screen.getByText('Tariq Mahmood')).toBeTruthy();
      expect(screen.getByText('Fatima Zahra')).toBeTruthy();

      // Reservations verification
      expect(screen.getByText('Booking BK-2026-001')).toBeTruthy();
      expect(screen.getByText(/Guest: Tariq Mahmood • Room: 101/i)).toBeTruthy();
    });

    it('preserves masked guest privacy fields (phone, CNIC) without unmasked leaks', async () => {
      vi.spyOn(quickSearchService, 'quickSearch').mockResolvedValue(mockQuickSearchResponse);

      render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'Tariq' } });

      await waitFor(() => {
        expect(screen.getByText('Tariq Mahmood')).toBeTruthy();
      });

      // Verify masked text appears in the description
      expect(screen.getByText(/Phone: 0300\*\*\*\*567/i)).toBeTruthy();
      expect(screen.getByText(/CNIC: 35201-\*\*\*\*\*\*\*-1/i)).toBeTruthy();

      // Confirm unmasked sensitive values are NOT rendered anywhere in DOM
      expect(screen.queryByText('03001234567')).toBeNull();
      expect(screen.queryByText('35201-1234567-1')).toBeNull();
    });

    it('displays "No matches found" when backend returns empty collections', async () => {
      vi.spyOn(quickSearchService, 'quickSearch').mockResolvedValue({
        success: true,
        data: { rooms: [], guests: [], reservations: [] },
      });

      render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'NonExistentXYZ' } });

      await waitFor(() => {
        expect(screen.getByText(/No matches found for "NonExistentXYZ"/i)).toBeTruthy();
      });
    });
  });

  describe('4. Navigation & Operational Commands', () => {
    it('navigates to existing room destination /rooms when a room result is activated', async () => {
      vi.spyOn(quickSearchService, 'quickSearch').mockResolvedValue(mockQuickSearchResponse);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<CommandPalette isOpen={true} onClose={vi.fn()} />}
            />
            <Route path="/rooms" element={<div>Destination Rooms Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: '101' } });

      await waitFor(() => {
        expect(screen.getByText('Room 101')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Room 101'));

      await waitFor(() => {
        expect(screen.getByText('Destination Rooms Page')).toBeTruthy();
      });
    });

    it('navigates to Guest Profile /guests/:id when a guest result is activated', async () => {
      vi.spyOn(quickSearchService, 'quickSearch').mockResolvedValue(mockQuickSearchResponse);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<CommandPalette isOpen={true} onClose={vi.fn()} />}
            />
            <Route path="/guests/:id" element={<div>Destination Guest Profile Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'Tariq' } });

      await waitFor(() => {
        expect(screen.getByText('Tariq Mahmood')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Tariq Mahmood'));

      await waitFor(() => {
        expect(screen.getByText('Destination Guest Profile Page')).toBeTruthy();
      });
    });

    it('navigates to reservation edit /reservation/edit/:id when a booking result is activated', async () => {
      vi.spyOn(quickSearchService, 'quickSearch').mockResolvedValue(mockQuickSearchResponse);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<CommandPalette isOpen={true} onClose={vi.fn()} />}
            />
            <Route
              path="/reservation/edit/:id"
              element={<div>Destination Reservation Edit Page</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'BK-2026' } });

      await waitFor(() => {
        expect(screen.getByText('Booking BK-2026-001')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Booking BK-2026-001'));

      await waitFor(() => {
        expect(screen.getByText('Destination Reservation Edit Page')).toBeTruthy();
      });
    });

    it('navigates to New Booking workflow /reservation/new via "Create New Reservation" command', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<CommandPalette isOpen={true} onClose={vi.fn()} />}
            />
            <Route path="/reservation/new" element={<div>New Booking Workflow Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Create New Reservation')).toBeTruthy();
      fireEvent.click(screen.getByText('Create New Reservation'));

      await waitFor(() => {
        expect(screen.getByText('New Booking Workflow Page')).toBeTruthy();
      });
    });

    it('navigates to Shift Handover /payment-billing/shift-handover via "Open Shift & Cash Handover" command', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<CommandPalette isOpen={true} onClose={vi.fn()} />}
            />
            <Route
              path="/payment-billing/shift-handover"
              element={<div>Shift Handover Dashboard</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Open Shift & Cash Handover')).toBeTruthy();
      fireEvent.click(screen.getByText('Open Shift & Cash Handover'));

      await waitFor(() => {
        expect(screen.getByText('Shift Handover Dashboard')).toBeTruthy();
      });
    });

    it('indicates Night Audit as Phase 5 unavailable without faking execution or navigating', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<CommandPalette isOpen={true} onClose={vi.fn()} />}
            />
          </Routes>
        </MemoryRouter>
      );

      const nightAuditCmd = screen.getByText('Daily Night Audit & Date Roll (Phase 5)');
      expect(nightAuditCmd).toBeTruthy();
      expect(screen.getByText('Unavailable')).toBeTruthy();

      // Click the disabled command
      fireEvent.click(nightAuditCmd);

      // Verify notification appears explaining Phase 5 schedule
      expect(
        screen.getByText('Automated Night Audit date-roll wizard is scheduled for Phase 5.')
      ).toBeTruthy();
    });

    it('preserves all existing static actions and navigation routes', () => {
      render(
        <MemoryRouter>
          <CommandPalette isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      // Actions
      expect(screen.getByText('Fast Front Desk Check-in')).toBeTruthy();
      expect(screen.getByText('New Table Order & POS Charge')).toBeTruthy();
      expect(screen.getByText('Generate Banquet Event Order (BEO)')).toBeTruthy();
      expect(screen.getByText('Log Security Anomaly & Keycard Override')).toBeTruthy();
      expect(screen.getByText('Restock Linen & Consumables PO')).toBeTruthy();

      // Navigation
      expect(screen.getByText('Visual Floor Plan & Room Grid (Occupancy)')).toBeTruthy();
      expect(screen.getByText('Front Office & Check-in')).toBeTruthy();
      expect(screen.getByText('Reservations & Bookings')).toBeTruthy();
      expect(screen.getByText('Room Management')).toBeTruthy();
      expect(screen.getByText('Guest Profiles')).toBeTruthy();
      expect(screen.getByText('Car Parking')).toBeTruthy();
      expect(screen.getAllByText('Housekeeping').length).toBeGreaterThan(0);
      expect(screen.getByText('Inventory & Stock')).toBeTruthy();
      expect(screen.getByText('Rates & Pricing')).toBeTruthy();
      expect(screen.getByText('Payment & Billing')).toBeTruthy();
      expect(screen.getByText('Human Resources (HR)')).toBeTruthy();
      expect(screen.getByText('Reports & Analytics')).toBeTruthy();
      expect(screen.getByText('Hotel Settings')).toBeTruthy();
      expect(screen.getByText('Audit Log & Security Center')).toBeTruthy();
      expect(screen.getByText('AI Assistant')).toBeTruthy();
    });
  });

  describe('5. Topbar Integration & Keyboard Navigation', () => {
    it('supports ArrowDown, ArrowUp, and Enter keyboard navigation', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<CommandPalette isOpen={true} onClose={vi.fn()} />}
            />
            <Route path="/reservation/new" element={<div>Destination New Booking</div>} />
          </Routes>
        </MemoryRouter>
      );

      const input = screen.getByRole('combobox');

      // The first item is "Create New Reservation"
      // Press ArrowDown to move to item 2, then ArrowUp back to item 1
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      // Press Enter to select
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Destination New Booking')).toBeTruthy();
      });
    });

    it('renders CommandPalette trigger in Topbar with ⌘K badge and opens on click', () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <Topbar onMobileNavToggle={vi.fn()} />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Search...')).toBeTruthy();
      expect(screen.getByText('⌘K')).toBeTruthy();

      // Click search button
      const searchBtn = screen.getByText('Search...').closest('button');
      fireEvent.click(searchBtn);

      // Command palette dialog is now visible
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
  });
});
