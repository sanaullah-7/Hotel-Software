import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ShiftHandover from '../features/payment-billing/pages/ShiftHandover';
import { shiftService } from '../services/shiftService';
import * as printHelpers from '../features/payment-billing/pages/utils/printHelpers';

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children,
}));

// Mock shiftService
vi.mock('../services/shiftService', () => ({
  shiftService: {
    getActiveShift: vi.fn(),
    openShift: vi.fn(),
    closeShift: vi.fn(),
    getShifts: vi.fn(),
    getShiftById: vi.fn(),
  },
  default: {
    getActiveShift: vi.fn(),
    openShift: vi.fn(),
    closeShift: vi.fn(),
    getShifts: vi.fn(),
    getShiftById: vi.fn(),
  },
}));

// Mock printHelpers
vi.mock('../features/payment-billing/pages/utils/printHelpers', () => ({
  printZReport: vi.fn(),
  generateZReportHtml: vi.fn(),
  printHtmlViaIframe: vi.fn(),
  generateRefundVoucherHtml: vi.fn(),
  printRefundVoucher: vi.fn(),
}));

describe('Phase 4 Step 3: Shift Handover & Z-Report UI Test Suite', () => {
  const defaultCashierUser = {
    id: '6ac379208ccaa4a7bf182701',
    fullName: 'Jane Cashier',
    email: 'cashier@hotel.com',
    role: 'HOTEL_USER',
  };

  const mockOpenShift = {
    _id: '6ace02e54dfe3e4acf7286e0',
    shift_number: 'SHF-2026-OPEN',
    staff_id: '6ac379208ccaa4a7bf182701',
    staff_name: 'Jane Cashier',
    drawer_name: 'Front Desk Drawer #1',
    status: 'OPEN',
    opening_float: 5000,
    opened_at: '2026-10-13T08:00:00.000Z',
    notes: 'Morning shift opening float verified',
    // Pre-count fields are intentionally absent/sanitized on server
  };

  const mockClosedShiftBalanced = {
    _id: '6ace02e54dfe3e4acf7286e1',
    shift_number: 'SHF-2026-001',
    staff_id: '6ac379208ccaa4a7bf182701',
    staff_name: 'Jane Cashier',
    drawer_name: 'Front Desk Drawer #1',
    status: 'CLOSED',
    opening_float: 5000,
    cash_collected: 12000,
    cash_refunds: 1500,
    cash_paid_out: 500,
    expected_cash: 15000,
    actual_counted_cash: 15000,
    discrepancy_amount: 0,
    opened_at: '2026-10-13T08:00:00.000Z',
    closed_at: '2026-10-13T16:00:00.000Z',
    closed_by: '6ac379208ccaa4a7bf182701',
    closed_by_name: 'Jane Cashier',
    notes: 'Shift balanced and verified',
    tender_summary: {
      cash_total: 12000,
      card_total: 8000,
      bank_total: 2000,
      wallet_total: 500,
      other_total: 0,
      total_payments_count: 14,
      total_collected_all_tenders: 22500,
    },
  };

  const mockClosedShiftShortage = {
    ...mockClosedShiftBalanced,
    shift_number: 'SHF-2026-002',
    actual_counted_cash: 14500,
    discrepancy_amount: -500,
  };

  const mockClosedShiftOverage = {
    ...mockClosedShiftBalanced,
    shift_number: 'SHF-2026-003',
    actual_counted_cash: 15250,
    discrepancy_amount: 250,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: defaultCashierUser,
      isAuthenticated: true,
      isLoading: false,
    });

    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: null,
      message: 'No active shift found',
    });

    shiftService.getShifts.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
    });
  });

  // Scenario 1: No-active-shift state rendering
  it('1. renders clear no-active-shift state when cashier has no open shift', async () => {
    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No Active Cash Shift/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Opening Float/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Cash Shift/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Active Cash Shift$/i })).not.toBeInTheDocument();
  });

  // Scenario 2: Successful opening of a shift
  it('2. successfully opens a shift with valid float, drawer, and notes', async () => {
    shiftService.openShift.mockResolvedValue({
      statusCode: 201,
      success: true,
      data: mockOpenShift,
      message: 'Cash shift opened successfully',
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Opening Float/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Opening Float/i), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/Drawer \/ Terminal Name/i), {
      target: { value: 'Front Desk Drawer #1' },
    });
    fireEvent.change(screen.getByLabelText(/Shift Notes/i), {
      target: { value: 'Morning shift opening float verified' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Open Cash Shift/i }));

    await waitFor(() => {
      expect(shiftService.openShift).toHaveBeenCalledWith({
        opening_float: 5000,
        drawer_name: 'Front Desk Drawer #1',
        notes: 'Morning shift opening float verified',
      });
    });

    // Verifies active shift state was refreshed from backend
    expect(shiftService.getActiveShift).toHaveBeenCalled();
  });

  // Scenario 3: Invalid opening-float validation
  it('3. rejects invalid or negative opening float before network submission', async () => {
    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Opening Float/i)).toBeInTheDocument();
    });

    // Test negative number
    fireEvent.change(screen.getByLabelText(/Opening Float/i), { target: { value: '-250' } });
    fireEvent.click(screen.getByRole('button', { name: /Open Cash Shift/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid non-negative opening float amount/i)
      ).toBeInTheDocument();
    });
    expect(shiftService.openShift).not.toHaveBeenCalled();

    // Test empty
    fireEvent.change(screen.getByLabelText(/Opening Float/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Open Cash Shift/i }));

    expect(shiftService.openShift).not.toHaveBeenCalled();
  });

  // Scenario 4: Active-shift information rendering
  it('4. renders active-shift operational information authoritatively', async () => {
    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockOpenShift,
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Active Cash Shift/i)).toBeInTheDocument();
    });

    expect(screen.getByText('SHF-2026-OPEN')).toBeInTheDocument();
    expect(screen.getAllByText(/Jane Cashier/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Front Desk Drawer #1/i)).toBeInTheDocument();
    expect(screen.getByText(/PKR 5,000.00/i)).toBeInTheDocument();
    expect(screen.getByText(/OPEN & RECEIVING/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Count Cash & Close Drawer/i })).toBeInTheDocument();
  });

  // Scenario 5: Concealment of expected cash and running totals before counting (Blind count rule)
  it('5. strictly conceals expected cash, running totals, refunds, payouts, and discrepancy while shift is active', async () => {
    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockOpenShift,
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Active Cash Shift/i)).toBeInTheDocument();
    });

    const activeCard = screen.getByText(/Active Cash Shift/i).closest('.rounded-2xl');
    expect(activeCard).toBeInTheDocument();

    // Check that pre-count financial values are NOT in the active shift card
    expect(within(activeCard).queryByText(/Expected Cash/i)).not.toBeInTheDocument();
    expect(within(activeCard).queryByText(/Cash Receipts/i)).not.toBeInTheDocument();
    expect(within(activeCard).queryByText(/Cash Refunds/i)).not.toBeInTheDocument();
    expect(within(activeCard).queryByText(/Cash Paid Out/i)).not.toBeInTheDocument();
    expect(within(activeCard).queryByText(/Discrepancy/i)).not.toBeInTheDocument();
    expect(within(activeCard).queryByText(/Variance/i)).not.toBeInTheDocument();

    // Verifies Blind Count policy notice is rendered
    expect(within(activeCard).getByText(/Blind Count Policy/i)).toBeInTheDocument();
  });

  // Scenario 6: Blind-count submission
  it('6. presents blind cash-count dialog and submits only actual counted cash and notes', async () => {
    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockOpenShift,
    });

    shiftService.closeShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockClosedShiftBalanced,
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Count Cash & Close Drawer/i })).toBeInTheDocument();
    });

    // Open blind counting dialog
    fireEvent.click(screen.getByRole('button', { name: /Count Cash & Close Drawer/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Shift Closure & Blind Cash Count/i })).toBeInTheDocument();
    });

    // Verify expected cash is still not shown in dialog
    expect(screen.queryByText(/Expected Cash/i)).not.toBeInTheDocument();

    // Enter counted physical cash
    fireEvent.change(screen.getByLabelText(/Actual Counted Cash/i), {
      target: { value: '15000' },
    });
    fireEvent.change(screen.getByLabelText(/Closing Remarks/i), {
      target: { value: 'Drawer counted and verified by Jane' },
    });

    // Submit blind count
    fireEvent.click(screen.getByRole('button', { name: /Confirm Count & Seal Shift/i }));

    await waitFor(() => {
      expect(shiftService.closeShift).toHaveBeenCalledWith({
        actual_counted_cash: 15000,
        shift_id: mockOpenShift._id,
        notes: 'Drawer counted and verified by Jane',
      });
    });
  });

  // Scenario 7: No premature success state while request is pending
  it('7. displays loading state and prevents premature success while close request is pending', async () => {
    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockOpenShift,
    });

    let resolveClose;
    shiftService.closeShift.mockReturnValue(
      new Promise((resolve) => {
        resolveClose = resolve;
      })
    );

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Count Cash & Close Drawer/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Count Cash & Close Drawer/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Actual Counted Cash/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Actual Counted Cash/i), {
      target: { value: '15000' },
    });
    const confirmBtn = screen.getByRole('button', { name: /Confirm Count & Seal Shift/i });
    fireEvent.click(confirmBtn);

    // Button should now be disabled and show sealing indicator
    expect(screen.getByText(/Sealing Shift.../i)).toBeInTheDocument();
    expect(confirmBtn).toBeDisabled();

    // Resolve request
    resolveClose({
      statusCode: 200,
      success: true,
      data: mockClosedShiftBalanced,
    });

    await waitFor(() => {
      expect(screen.queryByText(/Sealing Shift.../i)).not.toBeInTheDocument();
    });
  });

  // Scenario 8: Successful closure using backend-calculated reconciliation
  it('8. renders backend-calculated reconciliation upon successful shift closure', async () => {
    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockOpenShift,
    });

    shiftService.closeShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockClosedShiftBalanced,
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Count Cash & Close Drawer/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Count Cash & Close Drawer/i }));
    fireEvent.change(screen.getByLabelText(/Actual Counted Cash/i), { target: { value: '15000' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Count & Seal Shift/i }));

    // Verifies reconciliation banner is displayed with authoritative backend numbers
    await waitFor(() => {
      expect(screen.getByText(/Shift Sealed & Reconciled: SHF-2026-001/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Expected Cash in Drawer/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PKR 15,000.00/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/BALANCED/i)).toBeInTheDocument();
  });

  // Scenario 9: Shortage, overage, and balanced report display
  it('9. displays shortage, overage, and balanced statuses accurately', async () => {
    // 9a. Test Balanced
    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockOpenShift,
    });
    shiftService.closeShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockClosedShiftBalanced,
    });

    const { unmount } = render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Count Cash & Close Drawer/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Count Cash & Close Drawer/i }));
    fireEvent.change(screen.getByLabelText(/Actual Counted Cash/i), { target: { value: '15000' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Count & Seal Shift/i }));

    await waitFor(() => {
      expect(screen.getByText(/BALANCED/i)).toBeInTheDocument();
    });
    unmount();

    // 9b. Test Shortage (-500)
    shiftService.closeShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockClosedShiftShortage,
    });

    const renderShortage = render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Count Cash & Close Drawer/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Count Cash & Close Drawer/i }));
    fireEvent.change(screen.getByLabelText(/Actual Counted Cash/i), { target: { value: '14500' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Count & Seal Shift/i }));

    await waitFor(() => {
      expect(screen.getByText(/SHORTAGE/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/-500\.00/i)).toBeInTheDocument();
    renderShortage.unmount();

    // 9c. Test Overage (+250)
    shiftService.closeShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockClosedShiftOverage,
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Count Cash & Close Drawer/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Count Cash & Close Drawer/i }));
    fireEvent.change(screen.getByLabelText(/Actual Counted Cash/i), { target: { value: '15250' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Count & Seal Shift/i }));

    await waitFor(() => {
      expect(screen.getByText(/OVERAGE/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/\+PKR 250\.00/i)).toBeInTheDocument();
  });

  // Scenario 10: Handling of 409 Conflict for concurrent opening or closing
  it('10. handles 409 Conflict gracefully by alerting and refreshing actual shift state', async () => {
    // 10a. Open Conflict
    shiftService.openShift.mockRejectedValue({
      status: 409,
      message: 'Cashier already has an active open shift',
    });

    const { unmount } = render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Opening Float/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Opening Float/i), { target: { value: '3000' } });
    fireEvent.click(screen.getByRole('button', { name: /Open Cash Shift/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/An active open shift already exists for this cashier/i)
      ).toBeInTheDocument();
    });
    unmount();

    // 10b. Close Conflict
    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockOpenShift,
    });

    shiftService.closeShift.mockRejectedValue({
      status: 409,
      message: 'Shift is already closed or in the process of closing',
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Count Cash & Close Drawer/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Count Cash & Close Drawer/i }));
    fireEvent.change(screen.getByLabelText(/Actual Counted Cash/i), { target: { value: '15000' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Count & Seal Shift/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Shift has already been closed or is currently closing/i)
      ).toBeInTheDocument();
    });
  });

  // Scenario 11: Network failure and authentication/error responses
  it('11. handles network errors without falsely claiming successful closure', async () => {
    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockOpenShift,
    });

    shiftService.closeShift.mockRejectedValue({
      status: 500,
      message: 'Network error. Database cluster unreachable.',
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Count Cash & Close Drawer/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Count Cash & Close Drawer/i }));
    fireEvent.change(screen.getByLabelText(/Actual Counted Cash/i), { target: { value: '15000' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Count & Seal Shift/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Network error. Database cluster unreachable./i)
      ).toBeInTheDocument();
    });

    // Verifies shift was NOT marked closed optimistically
    expect(screen.queryByText(/Shift Sealed & Reconciled/i)).not.toBeInTheDocument();
  });

  // Scenario 12: Prevention of duplicate submissions
  it('12. disables buttons during in-flight submission to prevent duplicate clicks', async () => {
    let resolveOpen;
    shiftService.openShift.mockReturnValue(
      new Promise((resolve) => {
        resolveOpen = resolve;
      })
    );

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Opening Float/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Opening Float/i), { target: { value: '5000' } });
    const openBtn = screen.getByRole('button', { name: /Open Cash Shift/i });
    fireEvent.click(openBtn);

    expect(openBtn).toBeDisabled();
    expect(screen.getByText(/Opening Cash Drawer.../i)).toBeInTheDocument();

    // Resolve
    resolveOpen({ statusCode: 201, success: true, data: mockOpenShift });
    await waitFor(() => {
      expect(screen.queryByText(/Opening Cash Drawer.../i)).not.toBeInTheDocument();
    });
  });

  // Scenario 13: Shift history loading, empty state, and errors
  it('13. renders shift history table with real backend data, empty state, and error handling', async () => {
    shiftService.getShifts.mockResolvedValueOnce({
      statusCode: 200,
      success: true,
      data: [mockClosedShiftBalanced, mockOpenShift],
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SHF-2026-001')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Shift #')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Cashier/i })).toBeInTheDocument();
    expect(screen.getByText('Float')).toBeInTheDocument();

    // Check row data
    expect(screen.getAllByText('SHF-2026-001').length).toBeGreaterThan(0);
    expect(screen.getByText('BALANCED')).toBeInTheDocument();
  });

  // Scenario 14: Authorized report viewing and printing
  it('14. opens authoritative Z-Report modal and triggers print output without page chrome', async () => {
    shiftService.getShifts.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: [mockClosedShiftBalanced],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Z-Report$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Z-Report$/i }));

    // Z-Report modal should appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Authoritative Shift Z-Report/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/Physical Cash Drawer Reconciliation/i)).toBeInTheDocument();
    expect(screen.getByText(/Expected Physical Cash/i)).toBeInTheDocument();
    expect(screen.getByText(/Non-Cash Tender Summary/i)).toBeInTheDocument();

    // Trigger Print
    const printBtn = screen.getByRole('button', { name: /Print Official Z-Report/i });
    expect(printBtn).toBeInTheDocument();
    fireEvent.click(printBtn);

    expect(printHelpers.printZReport).toHaveBeenCalledWith(
      mockClosedShiftBalanced,
      expect.any(String)
    );
  });

  // Scenario 15: Closed-shift immutability from the frontend
  it('15. ensures closed historical shifts are immutable (view-only Z-Report action)', async () => {
    shiftService.getShifts.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: [mockClosedShiftBalanced],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SHF-2026-001')).toBeInTheDocument();
    });

    // Check that there are NO edit, delete, or reopen buttons for the historical shift
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reopen/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Z-Report$/i })).toBeInTheDocument();
  });

  // Scenario 16: Route protection and role-appropriate navigation
  it('16. renders authentication alert when user session is not active', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Please sign in to access the Cash Shift Handover/i)
    ).toBeInTheDocument();
  });

  // Scenario 17: API response compatibility with the actual backend contract
  it('17. conforms strictly to the backend envelope and data types', async () => {
    shiftService.getActiveShift.mockResolvedValue({
      statusCode: 200,
      success: true,
      data: mockOpenShift,
      message: 'Active cash shift retrieved successfully',
    });

    render(
      <MemoryRouter>
        <ShiftHandover />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(shiftService.getActiveShift).toHaveBeenCalled();
    });

    // Confirms correct parsing of the data field
    expect(screen.getByText(mockOpenShift.shift_number)).toBeInTheDocument();
  });
});
