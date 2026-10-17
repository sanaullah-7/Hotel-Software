import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import LuxuriaAssistant from '../features/assistant/pages/LuxuriaAssistant';
import { assistantService } from '../services/assistantService';

vi.mock('../services/assistantService', () => ({
  assistantService: {
    askAssistant: vi.fn(),
    getAssistantSummary: vi.fn(),
    getAssistantSuggestions: vi.fn(),
  },
}));

describe('AI Executive Assistant Frontend Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    assistantService.getAssistantSummary.mockResolvedValue({
      success: true,
      data: {
        totalRooms: 20,
        availableRooms: 12,
        occupiedRooms: 6,
        occupancyRate: 30,
        activeReservations: 15,
        totalRevenue: 350000,
        pendingTasks: 3,
      },
    });

    assistantService.getAssistantSuggestions.mockResolvedValue({
      success: true,
      data: [
        { id: 'rooms', label: 'Room Occupancy Forecast', query: 'What is our room occupancy forecast?' },
        { id: 'revenue', label: 'Revenue & Financials', query: 'Show me revenue trends and expenses.' },
        { id: 'arrivals', label: 'VIP Arrivals & Bookings', query: 'Summarize VIP arrivals today.' },
        { id: 'housekeeping', label: '4 Dirty Rooms Pending', query: 'Are there any rooms dirty or under maintenance?' },
      ],
    });

    assistantService.askAssistant.mockImplementation(async ({ message }) => {
      if (message.toLowerCase().includes('pakistan')) {
        return {
          success: true,
          data: {
            reply: 'I am specialized strictly in hotel management and operations. Your question is outside my operational domain.',
            domain: 'out_of_domain',
            isLive: false,
          },
        };
      }
      return {
        success: true,
        data: {
          reply: 'Live Room Inventory: 12 rooms are available, 6 are occupied, and 2 are under maintenance.',
          domain: 'rooms',
          isLive: true,
        },
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Initial Render & Live Connection', () => {
    it('should render header with Live DB Connected indicator and initial greeting', async () => {
      render(
        <BrowserRouter>
          <LuxuriaAssistant />
        </BrowserRouter>
      );

      expect(screen.getByText('Luxuria Executive Assistant')).toBeInTheDocument();
      expect(screen.getByText('Live DB Connected')).toBeInTheDocument();
      expect(
        screen.getByText(/Hello! I am Luxuria AI, your intelligent hotel management assistant/i)
      ).toBeInTheDocument();
    });

    it('should load dynamic suggestion chips from backend service', async () => {
      render(
        <BrowserRouter>
          <LuxuriaAssistant />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('4 Dirty Rooms Pending')).toBeInTheDocument();
        expect(screen.getByText('Room Occupancy Forecast')).toBeInTheDocument();
      });
    });
  });

  describe('2. Suggestion Chip Interaction', () => {
    it('should populate input field when suggestion chip is clicked', async () => {
      render(
        <BrowserRouter>
          <LuxuriaAssistant />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('4 Dirty Rooms Pending')).toBeInTheDocument();
      });

      const dirtyRoomsChip = screen.getByText('4 Dirty Rooms Pending');
      fireEvent.click(dirtyRoomsChip);

      const input = screen.getByPlaceholderText(/Ask a question about rooms/i);
      expect(input.value).toBe('Are there any rooms dirty or under maintenance?');
    });
  });

  describe('3. Chat Submission & Live Database Query Flow', () => {
    it('should send query to backend and display AI response with Live DB tag', async () => {
      render(
        <BrowserRouter>
          <LuxuriaAssistant />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText(/Ask a question about rooms/i);
      fireEvent.change(input, { target: { value: 'How many rooms are available?' } });

      const form = input.closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('How many rooms are available?')).toBeInTheDocument();
      });

      expect(assistantService.askAssistant).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'How many rooms are available?',
        })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Live Room Inventory: 12 rooms are available/i)
        ).toBeInTheDocument();
        expect(screen.getAllByText('Live DB').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display Domain Guardrail badge for out-of-domain questions', async () => {
      render(
        <BrowserRouter>
          <LuxuriaAssistant />
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText(/Ask a question about rooms/i);
      fireEvent.change(input, { target: { value: 'What do you think about Pakistan?' } });

      const form = input.closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(
          screen.getByText(/I am specialized strictly in hotel management and operations/i)
        ).toBeInTheDocument();
        expect(screen.getByText('Domain Guardrail')).toBeInTheDocument();
      });
    });
  });

  describe('4. Clear Chat Management', () => {
    it('should reset conversation when clear chat button is clicked', async () => {
      render(
        <BrowserRouter>
          <LuxuriaAssistant />
        </BrowserRouter>
      );

      const clearBtn = screen.getByTitle('Clear Chat');
      fireEvent.click(clearBtn);

      expect(screen.getByText('Chat history cleared. How can I assist you with hotel operations right now?')).toBeInTheDocument();
    });
  });
});
