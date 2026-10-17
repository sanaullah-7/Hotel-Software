import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import AllEvents from '../features/events/pages/AllEvents';
import AddEvent from '../features/events/pages/AddEvent';
import BanquetManager from '../features/events/pages/BanquetManager';
import eventService from '../services/eventService';

// Single mock object shared by both named and default exports
const mockService = vi.hoisted(() => ({
  getEvents: vi.fn(),
  getEventById: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  bulkDeleteEvents: vi.fn(),
  getEventMetrics: vi.fn(),
  getBeos: vi.fn(),
  getBeoById: vi.fn(),
  createBeo: vi.fn(),
  updateBeo: vi.fn(),
  deleteBeo: vi.fn(),
  getBeoMetrics: vi.fn(),
}));

vi.mock('../services/eventService', () => ({
  default: mockService,
  eventService: mockService,
}));

const mockRawEvents = [
  {
    event_ref: 'EVT31232CFL',
    name: 'Tech Horizon Summit 2026',
    event_type: 'Conference',
    client_name: 'David Vance',
    contact_email: 'david.vance@techhorizon.io',
    contact_phone: '+1 (555) 382-9102',
    start_date: '2026-10-14',
    start_time: '09:00',
    end_time: '17:00',
    venue: 'Grand Crystal Ballroom',
    expected_attendees: 350,
    total_amount: 14500,
    advance_amount: 5000,
    balance_amount: 9500,
    catering: 'Full Day Package',
    status: 'Confirmed',
  },
  {
    event_ref: 'EVT88301ABX',
    name: 'Harrison Wedding Reception',
    event_type: 'Wedding',
    client_name: 'Claire Harrison',
    contact_email: 'claire.harrison@email.com',
    contact_phone: '+1 (555) 774-2910',
    start_date: '2026-10-18',
    start_time: '16:00',
    end_time: '23:30',
    venue: 'Royal Palm Terrace',
    expected_attendees: 220,
    total_amount: 22800,
    advance_amount: 15000,
    balance_amount: 7800,
    catering: 'Plated Dinner',
    status: 'Confirmed',
  },
];

const mockRawBeos = [
  {
    beo_ref: 'BEO-401',
    title: 'Apex Global Financial Forum',
    client: 'Apex Capital Partners',
    venue: 'Executive Boardroom & Salon A',
    catering: 'Executive Continental Breakfast & Working Luncheon',
    av_setup: 'Dual Laser Projection, 6 Wireless Lavaliers',
    attendance: '65 Guests',
    total_price: '$4,850',
    deposit_paid: '$2,500',
    coordinator: 'Marcella Dubois',
    status: 'Confirmed & Deposit Paid',
    status_type: 'confirmed',
  },
];

describe('Events & Banquets Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('All Events Sub-tab', () => {
    it('loads and renders event records from backend eventService', async () => {
      mockService.getEvents.mockResolvedValue({
        data: {
          events: mockRawEvents,
          total: 2,
          page: 1,
          pages: 1,
        },
      });
      mockService.getEventMetrics.mockResolvedValue({
        data: { total: 2, confirmed: 2, pending: 0, revenue: 37300 },
      });

      render(
        <BrowserRouter>
          <AllEvents />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockService.getEvents).toHaveBeenCalled();
      });

      expect(await screen.findByText('Tech Horizon Summit 2026')).toBeInTheDocument();
      expect(screen.getByText('Harrison Wedding Reception')).toBeInTheDocument();
    });

    it('renders genuine empty state when backend returns 0 events without falling back to mock data', async () => {
      mockService.getEvents.mockResolvedValue({
        data: {
          events: [],
          total: 0,
        },
      });

      render(
        <BrowserRouter>
          <AllEvents />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockService.getEvents).toHaveBeenCalled();
      });

      // No mock data should be rendered
      expect(screen.queryByText('Johnson Wedding')).not.toBeInTheDocument();
      expect(screen.getByText(/No events found matching your search or filters/i)).toBeInTheDocument();
    });

    it('renders error banner and retry option on backend failure without falling back to mock data', async () => {
      mockService.getEvents.mockRejectedValue(new Error('Network connection timeout'));

      render(
        <BrowserRouter>
          <AllEvents />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockService.getEvents).toHaveBeenCalled();
      });

      // Should display error UI
      expect(await screen.findByText(/Network connection timeout/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
      // Should NOT render fallback mock events
      expect(screen.queryByText('Johnson Wedding')).not.toBeInTheDocument();
    });

    it('handles event deletion via backend eventService.deleteEvent', async () => {
      mockService.getEvents.mockResolvedValue({
        data: {
          events: mockRawEvents,
          total: 2,
          page: 1,
          pages: 1,
        },
      });
      mockService.deleteEvent.mockResolvedValue({ data: { message: 'Deleted' } });

      render(
        <BrowserRouter>
          <AllEvents />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Tech Horizon Summit 2026')).toBeInTheDocument();
      });

      // Find delete buttons in table
      const deleteButtons = screen.getAllByTitle('Delete Event');
      expect(deleteButtons.length).toBeGreaterThan(0);
      fireEvent.click(deleteButtons[0]);

      // Confirm delete in modal
      const confirmBtn = await screen.findByRole('button', { name: /^Delete$/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockService.deleteEvent).toHaveBeenCalledWith('EVT31232CFL');
      });
    });
  });

  describe('Add Event Sub-tab', () => {
    it('validates and submits a new event to backend eventService.createEvent', async () => {
      mockService.createEvent.mockResolvedValue({
        data: {
          event_ref: 'EVT99999XYZ',
          name: 'International AI Symposium',
          status: 'Confirmed',
        },
      });

      render(
        <BrowserRouter>
          <AddEvent />
        </BrowserRouter>
      );

      // Fill in required fields
      const eventNameInput = screen.getByPlaceholderText(/Vance & Sterling Royal Gala/i);
      const clientNameInput = screen.getByPlaceholderText(/Baroness Evelyn Vance/i);
      const emailInput = screen.getByPlaceholderText(/client@luxuryevents\.com/i);
      const phoneInput = screen.getByPlaceholderText(/\+1 \(555\) 000-0000/i);

      fireEvent.change(eventNameInput, { target: { value: 'International AI Symposium' } });
      fireEvent.change(clientNameInput, { target: { value: 'Dr. Jane Foster' } });
      fireEvent.change(emailInput, { target: { value: 'jane@foster.org' } });
      fireEvent.change(phoneInput, { target: { value: '+1 555 888 9999' } });

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockService.createEvent).toHaveBeenCalled();
      });

      const calledArg = mockService.createEvent.mock.calls[0][0];
      expect(calledArg.name).toBe('International AI Symposium');
      expect(calledArg.client_name).toBe('Dr. Jane Foster');
      expect(await screen.findByText(/Event Added Successfully!/i)).toBeInTheDocument();
    });

    it('rejects client submission when advance amount exceeds total amount', async () => {
      render(
        <BrowserRouter>
          <AddEvent />
        </BrowserRouter>
      );

      const eventNameInput = screen.getByPlaceholderText(/Vance & Sterling Royal Gala/i);
      const clientNameInput = screen.getByPlaceholderText(/Baroness Evelyn Vance/i);
      const emailInput = screen.getByPlaceholderText(/client@luxuryevents\.com/i);
      const phoneInput = screen.getByPlaceholderText(/\+1 \(555\) 000-0000/i);

      fireEvent.change(eventNameInput, { target: { value: 'Conference 2026' } });
      fireEvent.change(clientNameInput, { target: { value: 'Tech Inc' } });
      fireEvent.change(emailInput, { target: { value: 'tech@inc.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1 555 123 4567' } });

      // Change total to 5000 and advance to 10000
      const totalInput = screen.getByDisplayValue('12000');
      fireEvent.change(totalInput, { target: { value: '5000' } });
      const advanceInput = screen.getByDisplayValue('4000');
      fireEvent.change(advanceInput, { target: { value: '10000' } });


      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);

      // Should show client validation error without calling backend
      expect(await screen.findByText(/Advance amount cannot exceed total amount/i)).toBeInTheDocument();
      expect(mockService.createEvent).not.toHaveBeenCalled();
    });
  });

  describe('Banquet Manager Sub-tab', () => {
    it('fetches and displays BEO list from backend', async () => {
      mockService.getBeos.mockResolvedValue({ data: mockRawBeos });
      mockService.getBeoMetrics.mockResolvedValue({ data: { totalBeos: 1, confirmed: 1 } });

      render(
        <BrowserRouter>
          <BanquetManager />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockService.getBeos).toHaveBeenCalled();
      });

      expect(await screen.findByText('Apex Global Financial Forum')).toBeInTheDocument();
      expect(screen.getByText('BEO-401')).toBeInTheDocument();

      // Verify KPI cards reflect live BEO data and NOT old prototype numbers ($184,500, 14, 88%)
      expect(screen.getAllByText('$4,850').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('$184,500')).not.toBeInTheDocument();
    });

    it('renders clean empty state when backend returns 0 BEOs without falling back to mock data', async () => {
      mockService.getBeos.mockResolvedValue({ data: [] });


      render(
        <BrowserRouter>
          <BanquetManager />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockService.getBeos).toHaveBeenCalled();
      });

      expect(screen.getByText(/No Banquet Event Orders recorded yet/i)).toBeInTheDocument();
      expect(screen.queryByText('Apex Global Financial Forum')).not.toBeInTheDocument();
      expect(screen.getAllByText('$0').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('$184,500')).not.toBeInTheDocument();
    });



    it('renders error banner and retry option on backend failure without falling back to mock data', async () => {
      mockService.getBeos.mockRejectedValue(new Error('Database cluster unavailable'));

      render(
        <BrowserRouter>
          <BanquetManager />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockService.getBeos).toHaveBeenCalled();
      });

      expect(await screen.findByText(/Database cluster unavailable/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
      expect(screen.queryByText('Apex Global Financial Forum')).not.toBeInTheDocument();
    });

    it('creates a new BEO order via backend eventService.createBeo', async () => {
      mockService.getBeos.mockResolvedValue({ data: mockRawBeos });
      mockService.createBeo.mockResolvedValue({
        data: {
          beo_ref: 'BEO-502',
          title: 'Cambridge Tech Gala',
          client: 'Starlight Inc',
        },
      });

      render(
        <BrowserRouter>
          <BanquetManager />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockService.getBeos).toHaveBeenCalled();
      });

      // Click "Generate New BEO"
      const generateBtn = screen.getByRole('button', { name: /Generate New BEO/i });
      fireEvent.click(generateBtn);

      // Modal appears
      expect(screen.getByText(/Generate New Banquet Event Order/i)).toBeInTheDocument();

      // Fill in required fields
      const titleInput = screen.getByPlaceholderText(/Cambridge Tech Gala/i);
      const clientInput = screen.getByPlaceholderText(/Lady Clara Sterling/i);

      fireEvent.change(titleInput, { target: { value: 'Cambridge Tech Gala' } });
      fireEvent.change(clientInput, { target: { value: 'Starlight Inc' } });

      // Submit modal
      const commitBtn = screen.getByRole('button', { name: /Generate BEO/i });
      fireEvent.click(commitBtn);

      await waitFor(() => {
        expect(mockService.createBeo).toHaveBeenCalled();
      });
    });
  });
});
