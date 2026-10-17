import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Inspection from '../features/housekeeping/pages/Inspection';
import opsService from '../services/opsService';
import roomService from '../services/roomService';
import inspectionService from '../services/inspectionService';

vi.mock('../services/opsService', () => ({
  default: {
    getHousekeepingTasks: vi.fn(),
    createHousekeepingTask: vi.fn(),
    updateHousekeepingTask: vi.fn(),
    deleteHousekeepingTask: vi.fn(),
    getEmployees: vi.fn()
  }
}));

vi.mock('../services/roomService', () => ({
  default: {
    getRooms: vi.fn()
  }
}));

vi.mock('../services/inspectionService', () => ({
  default: {
    getInspections: vi.fn(),
    createInspection: vi.fn(),
    updateInspection: vi.fn(),
    deleteInspection: vi.fn()
  }
}));

describe('Housekeeping Inspection Backend Integration Tests', () => {
  const mockRooms = [
    { _id: '507f1f77bcf86cd799439011', room_number: '301', room_type: 'Suite', housekeeping_status: 'CLEAN' },
    { _id: '507f1f77bcf86cd799439012', room_number: '302', room_type: 'Deluxe', housekeeping_status: 'INSPECTED' }
  ];

  const mockEmployees = [
    { _id: '507f1f77bcf86cd799439021', employee_ref: 'EMP-001', first_name: 'John', last_name: 'Supervisor', role: 'Supervisor' },
    { _id: '507f1f77bcf86cd799439022', employee_ref: 'EMP-002', first_name: 'Mary', last_name: 'Housekeeper', role: 'Housekeeper' }
  ];

  const mockTasks = [
    {
      _id: '507f1f77bcf86cd799439031',
      room_id: { _id: '507f1f77bcf86cd799439011', room_number: '301' },
      assigned_to: { _id: '507f1f77bcf86cd799439022', first_name: 'Mary', last_name: 'Housekeeper', employee_ref: 'EMP-002' },
      task_type: 'CLEANING',
      priority: 'HIGH',
      status: 'COMPLETED',
      notes: '[Guest: Alice Wonderland] Routine checkout cleaning',
      completed_at: '2026-10-07T11:30:00.000Z'
    }
  ];

  const mockInspections = [
    {
      _id: '507f1f77bcf86cd799439041',
      room_id: { _id: '507f1f77bcf86cd799439012', room_number: '302' },
      task_id: null,
      inspector_id: { _id: '507f1f77bcf86cd799439021', first_name: 'John', last_name: 'Supervisor' },
      status: 'PENDING',
      passed: false,
      score: 0,
      comments: 'Awaiting inspection'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    roomService.getRooms.mockResolvedValue({ data: mockRooms });
    opsService.getEmployees.mockResolvedValue({ data: mockEmployees });
    opsService.getHousekeepingTasks.mockResolvedValue({ data: mockTasks });
    inspectionService.getInspections.mockResolvedValue({ data: mockInspections });
  });

  it('Flow 1: Loads inspections and completed tasks from backend and renders canonical data', async () => {
    render(
      <MemoryRouter>
        <Inspection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading inspections/i)).not.toBeInTheDocument();
    });

    // Check room numbers from backend
    expect(screen.getByText('301')).toBeInTheDocument();
    expect(screen.getByText('302')).toBeInTheDocument();

    // Check housekeeper and guest from backend task
    expect(screen.getByText('Mary Housekeeper')).toBeInTheDocument();
    expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
  });

  it('Flow 2: Empty state integrity — renders empty message when backend returns 200 []', async () => {
    inspectionService.getInspections.mockResolvedValue({ data: [] });
    opsService.getHousekeepingTasks.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Inspection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No records found.')).toBeInTheDocument();
    });

    // Verify no mock data is shown
    expect(screen.queryByText('101')).not.toBeInTheDocument();
  });

  it('Flow 3: Failure state integrity — surfaces error banner when backend call fails', async () => {
    inspectionService.getInspections.mockRejectedValue(new Error('Network error 500'));

    render(
      <MemoryRouter>
        <Inspection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Network error 500/i)).toBeInTheDocument();
    });

    // Ensure it does not pretend success or inject mock rows
    expect(screen.queryByText('101')).not.toBeInTheDocument();
  });

  it('Flow 4: Approves inspection via inspectionService.createInspection with canonical IDs', async () => {
    inspectionService.createInspection.mockResolvedValue({
      data: {
        _id: 'new_insp_id_99',
        status: 'PASSED',
        passed: true,
        score: 100
      }
    });

    render(
      <MemoryRouter>
        <Inspection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('301')).toBeInTheDocument();
    });

    // Open action menu for room 301
    const actionBtn = screen.getByLabelText('actions-301');
    fireEvent.click(actionBtn);

    // Click "Inspect Room"
    const inspectMenuItem = await screen.findByText(/Inspect Room/i);
    fireEvent.click(inspectMenuItem);

    // Dialog is now open
    expect(screen.getByText(/Room 301 Inspection/i)).toBeInTheDocument();

    // Click Approve Room
    const approveBtn = screen.getByText(/Approve Room/i);
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(inspectionService.createInspection).toHaveBeenCalledWith(
        expect.objectContaining({
          room_id: '507f1f77bcf86cd799439011',
          room_number: '301',
          task_id: '507f1f77bcf86cd799439031',
          status: 'PASSED',
          passed: true,
          score: 100
        })
      );
    });
  });

  it('Flow 5: Fails inspection via inspectionService.createInspection with canonical IDs', async () => {
    inspectionService.createInspection.mockResolvedValue({
      data: {
        _id: 'failed_insp_id',
        status: 'FAILED',
        passed: false,
        score: 0
      }
    });

    render(
      <MemoryRouter>
        <Inspection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('301')).toBeInTheDocument();
    });

    const actionBtn = screen.getByLabelText('actions-301');
    fireEvent.click(actionBtn);

    const inspectMenuItem = await screen.findByText(/Inspect Room/i);
    fireEvent.click(inspectMenuItem);

    const failBtn = screen.getByText(/Fail & Reassign/i);
    fireEvent.click(failBtn);

    await waitFor(() => {
      expect(inspectionService.createInspection).toHaveBeenCalledWith(
        expect.objectContaining({
          room_id: '507f1f77bcf86cd799439011',
          status: 'FAILED',
          passed: false,
          score: 0
        })
      );
    });
  });
});
