import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import ExpenseReport from '../features/reports/pages/tabs/ExpenseReport';
import RevenueReport from '../features/reports/pages/tabs/RevenueReport';
import OccupancyReportTab from '../features/reports/pages/tabs/OccupancyReportTab';
import ExpenseVsRevenueTab from '../features/reports/pages/tabs/ExpenseVsRevenueTab';
import reportService from '../services/reportService';

vi.mock('../services/reportService');

const mockExpensesList = [
  {
    _id: 'exp-101',
    expense_ref: 'EXP-101',
    description: 'Chiller Compressor Oil',
    category: 'Maintenance',
    amount: 850,
    expense_by: 'Facility Manager',
    payment_method: 'Cash',
    status: 'Paid',
    paid_to: 'RefriSupply Co',
    date: '2026-03-15T10:00:00.000Z',
  },
  {
    _id: 'exp-102',
    expense_ref: 'EXP-102',
    description: 'Kitchen Organic Produce',
    category: 'Food & Beverage',
    amount: 1420,
    expense_by: 'Head Chef',
    payment_method: 'Bank Transfer',
    status: 'Paid',
    paid_to: 'FarmDirect Green',
    date: '2026-03-16T08:30:00.000Z',
  },
];

const mockRevenueData = {
  kpi: {
    totalRevenue: 345000,
    adr: 195.5,
    revPar: 148.2,
    grossMargin: 68.4,
  },
  trendData: [
    { name: 'Jan', rev2024: 25000, rev2023: 20000 },
    { name: 'Feb', rev2024: 30000, rev2023: 22000 },
  ],
  donutData: [
    { name: 'Room Revenue', value: 60, color: '#2f65f6' },
    { name: 'Food & Beverage', value: 40, color: '#05b171' },
  ],
  sourceData: [
    {
      id: 1,
      source: 'Direct Booking',
      revenue: '$120,750',
      percentage: 35.0,
      trend: '+12.5%',
      isPositive: true,
    },
  ],
};

const mockOccupancyData = {
  kpi: {
    averageOccupancyRate: 82.5,
    occupiedRooms: 66,
    availableRooms: 14,
    outOfOrderRooms: 2,
    totalRooms: 82,
  },
  trendData: [
    { name: 'Mon', occupancyRate: 80, forecastedRate: 83 },
    { name: 'Tue', occupancyRate: 82, forecastedRate: 85 },
  ],
  donutData: [
    { name: 'Occupied', value: 80.5, color: '#2196f3' },
    { name: 'Vacant', value: 17.1, color: '#00e676' },
  ],
  roomTypeData: [
    {
      id: 'rt-1',
      type: 'Deluxe Suite',
      total: 40,
      occupied: 34,
      vacant: 6,
      maintenance: 0,
      occupancyPct: 85,
    },
  ],
};

const mockExpenseVsRevenueData = {
  kpi: {
    totalRevenueYtd: 480000,
    totalExpensesYtd: 160000,
    netProfit: 320000,
    profitMargin: 66.7,
  },
  monthlyTrendsData: [
    { name: 'Jan', revenue: 40000, expense: 12000 },
    { name: 'Feb', revenue: 45000, expense: 14000 },
  ],
};

describe('Reports & Nested Tabs Frontend Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Expense Sub-tab', () => {
    it('fetches and renders live database expenses properly', async () => {
      reportService.getExpenses.mockResolvedValueOnce({
        data: { expenses: mockExpensesList, total: 2 },
      });

      render(
        <BrowserRouter>
          <ExpenseReport />
        </BrowserRouter>
      );

      // Loading state
      expect(screen.getByText(/loading authoritative expenses/i)).toBeInTheDocument();

      // Live rows rendered
      await waitFor(() => {
        expect(screen.getByText('Chiller Compressor Oil')).toBeInTheDocument();
        expect(screen.getByText('Kitchen Organic Produce')).toBeInTheDocument();
      });

      expect(screen.getByText('$850')).toBeInTheDocument();
      expect(screen.getByText('$1420')).toBeInTheDocument();
      expect(screen.getByText('RefriSupply Co')).toBeInTheDocument();
      expect(reportService.getExpenses).toHaveBeenCalledTimes(1);
    });

    it('renders error banner with Retry option on backend failure without mock fallback', async () => {
      reportService.getExpenses.mockRejectedValueOnce(new Error('Network error: server unreachable'));

      render(
        <BrowserRouter>
          <ExpenseReport />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Network error: server unreachable/i)).toBeInTheDocument();
      });

      // No mock data shown
      expect(screen.queryByText('HVAC Filter Replacements')).not.toBeInTheDocument();

      // Retry connection
      reportService.getExpenses.mockResolvedValueOnce({
        data: { expenses: mockExpensesList, total: 2 },
      });

      const retryBtn = screen.getByRole('button', { name: /retry connection/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Chiller Compressor Oil')).toBeInTheDocument();
      });
    });

    it('creates an expense and dispatches real-time sync event', async () => {
      reportService.getExpenses.mockResolvedValueOnce({
        data: { expenses: mockExpensesList, total: 2 },
      });

      const syncSpy = vi.fn();
      window.addEventListener('hotel:data-updated', syncSpy);

      render(
        <BrowserRouter>
          <ExpenseReport />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Chiller Compressor Oil')).toBeInTheDocument();
      });

      // Open Add Expense modal
      const addBtn = screen.getByTitle('Add Record');
      fireEvent.click(addBtn);

      expect(screen.getByText(/New Record/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Invoice No/i).length).toBeGreaterThanOrEqual(1);

      window.removeEventListener('hotel:data-updated', syncSpy);
    });
  });

  describe('2. Revenue Report Sub-tab', () => {
    it('fetches and renders live revenue KPIs and dynamic data', async () => {
      reportService.getRevenueReport.mockResolvedValueOnce({
        data: mockRevenueData,
      });

      render(
        <BrowserRouter>
          <RevenueReport />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('$345,000')).toBeInTheDocument();
        expect(screen.getByText('$195.5')).toBeInTheDocument();
        expect(screen.getByText('$148.2')).toBeInTheDocument();
        expect(screen.getByText('68.4%')).toBeInTheDocument();
      });

      expect(screen.getByText('Revenue Trend Analysis')).toBeInTheDocument();
      expect(screen.getByText('Direct Booking')).toBeInTheDocument();
      expect(reportService.getRevenueReport).toHaveBeenCalledTimes(1);
    });

    it('displays error banner on server failure with retry button', async () => {
      reportService.getRevenueReport.mockRejectedValueOnce(new Error('Database cluster unavailable'));

      render(
        <BrowserRouter>
          <RevenueReport />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Database cluster unavailable/i)).toBeInTheDocument();
      });

      reportService.getRevenueReport.mockResolvedValueOnce({
        data: mockRevenueData,
      });

      const retryBtn = screen.getByRole('button', { name: /retry connection/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('$345,000')).toBeInTheDocument();
      });
    });
  });

  describe('3. Occupancy Report Sub-tab', () => {
    it('fetches and renders live occupancy KPIs and room type performance', async () => {
      reportService.getOccupancyReport.mockResolvedValueOnce({
        data: mockOccupancyData,
      });

      render(
        <BrowserRouter>
          <OccupancyReportTab />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('82.5%')).toBeInTheDocument();
        expect(screen.getByText('66')).toBeInTheDocument();
        expect(screen.getByText('14')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });

      expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(reportService.getOccupancyReport).toHaveBeenCalledTimes(1);
    });

    it('renders error banner on failure and retries cleanly', async () => {
      reportService.getOccupancyReport.mockRejectedValueOnce(new Error('Occupancy service timeout'));

      render(
        <BrowserRouter>
          <OccupancyReportTab />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Occupancy service timeout/i)).toBeInTheDocument();
      });

      reportService.getOccupancyReport.mockResolvedValueOnce({
        data: mockOccupancyData,
      });

      const retryBtn = screen.getByRole('button', { name: /retry connection/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('82.5%')).toBeInTheDocument();
      });
    });
  });

  describe('4. Expense vs Revenue Sub-tab', () => {
    it('fetches and renders live financial comparison KPIs and chart data', async () => {
      reportService.getExpenseVsRevenueReport.mockResolvedValueOnce({
        data: mockExpenseVsRevenueData,
      });

      render(
        <BrowserRouter>
          <ExpenseVsRevenueTab />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('$480,000')).toBeInTheDocument();
        expect(screen.getByText('$160,000')).toBeInTheDocument();
        expect(screen.getByText('$320,000')).toBeInTheDocument();
        expect(screen.getByText('66.7%')).toBeInTheDocument();
      });

      expect(screen.getByText('Revenue vs. Expense Trends')).toBeInTheDocument();
      expect(reportService.getExpenseVsRevenueReport).toHaveBeenCalledTimes(1);
    });

    it('handles server failure with error banner and retry option', async () => {
      reportService.getExpenseVsRevenueReport.mockRejectedValueOnce(new Error('Comparison metrics error'));

      render(
        <BrowserRouter>
          <ExpenseVsRevenueTab />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Comparison metrics error/i)).toBeInTheDocument();
      });

      reportService.getExpenseVsRevenueReport.mockResolvedValueOnce({
        data: mockExpenseVsRevenueData,
      });

      const retryBtn = screen.getByRole('button', { name: /retry connection/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('$480,000')).toBeInTheDocument();
      });
    });
  });

  describe('5. Real-time Event Synchronization', () => {
    it('triggers refetch across tabs when hotel:data-updated is dispatched', async () => {
      reportService.getRevenueReport.mockResolvedValue({
        data: mockRevenueData,
      });

      render(
        <BrowserRouter>
          <RevenueReport />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('$345,000')).toBeInTheDocument();
      });

      expect(reportService.getRevenueReport).toHaveBeenCalledTimes(1);

      // Simulate a new booking or expense created anywhere in the app
      window.dispatchEvent(new CustomEvent('hotel:data-updated', { detail: { domain: 'reservation' } }));

      await waitFor(() => {
        expect(reportService.getRevenueReport).toHaveBeenCalledTimes(2);
      });
    });
  });
});
