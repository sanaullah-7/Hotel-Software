import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StaffAssignment from '../features/housekeeping/pages/StaffAssignment';
import opsService from '../services/opsService';
import roomService from '../services/roomService';

vi.mock('../services/opsService', () => ({
  default: {
    getEmployees: vi.fn(),
    getHousekeepingTasks: vi.fn(),
    createHousekeepingTask: vi.fn(),
    updateHousekeepingTask: vi.fn(),
    deleteHousekeepingTask: vi.fn()
  }
}));

vi.mock('../services/roomService', () => ({
  default: {
    getRooms: vi.fn()
  }
}));

describe('Staff Assignment Backend Integration Tests', () => {
  const mockRooms = [
    { _id: '507f1f77bcf86cd799439011', room_number: '101', room_type: 'Deluxe', housekeeping_status: 'DIRTY' },
    { _id: '507f1f77bcf86cd799439012', room_number: '102', room_type: 'Suite', housekeeping_status: 'CLEAN' }
  ];

  const mockEmployees = [
    { 
      _id: '507f1f77bcf86cd799439021', 
      employee_ref: 'EMP-101', 
      first_name: 'Bilal', 
      last_name: 'Khan', 
      department: { name: 'Housekeeping' },
      role: 'Housekeeper',
      status: 'ACTIVE'
    },
    { 
      _id: '507f1f77bcf86cd799439022', 
      employee_ref: 'EMP-102', 
      first_name: 'Sara', 
      last_name: 'Connor', 
      department: { name: 'Housekeeping' },
      role: 'Housekeeper',
      status: 'ACTIVE'
    }
  ];

  const mockTasks = [
    {
      _id: '507f1f77bcf86cd799439031',
      room_id: '507f1f77bcf86cd799439011',
      assigned_to: '507f1f77bcf86cd799439021',
      task_type: 'CLEANING',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      notes: 'Clean floor thoroughly'
    },
    {
      _id: '507f1f77bcf86cd799439032',
      room_id: '507f1f77bcf86cd799439012',
      assigned_to: '507f1f77bcf86cd799439021',
      task_type: 'CLEANING',
      priority: 'MEDIUM',
      status: 'VERIFIED',
      notes: 'Completed inspect'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    roomService.getRooms.mockResolvedValue({ data: mockRooms });
    opsService.getEmployees.mockResolvedValue({ data: mockEmployees });
    opsService.getHousekeepingTasks.mockResolvedValue({ data: mockTasks });
  });

  it('Flow 1: Loads staff members and dynamically computes workload statistics from backend tasks', async () => {
    render(
      <MemoryRouter>
        <StaffAssignment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading staff workload/i)).not.toBeInTheDocument();
    });

    // Check staff names and IDs
    expect(screen.getByText('Bilal Khan')).toBeInTheDocument();
    expect(screen.getByText('Sara Connor')).toBeInTheDocument();
    expect(screen.getByText('EMP-101')).toBeInTheDocument();
    expect(screen.getByText('EMP-102')).toBeInTheDocument();

    // Check computed task stats: Bilal has 2 assigned tasks (1 cleaning in-progress, 1 completed verified)
    expect(screen.getByText('2')).toBeInTheDocument(); // Assigned rooms count for Bilal
  });

  it('Flow 2: Empty state integrity — displays clean empty message when employees list is empty', async () => {
    opsService.getEmployees.mockResolvedValue({ data: [] });
    opsService.getHousekeepingTasks.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <StaffAssignment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No staff found.')).toBeInTheDocument();
    });
  });

  it('Flow 3: Failure state integrity — surfaces error alert when API call fails', async () => {
    opsService.getHousekeepingTasks.mockRejectedValue(new Error('Housekeeping API Unavailable'));

    render(
      <MemoryRouter>
        <StaffAssignment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Housekeeping API Unavailable/i)).toBeInTheDocument();
    });
  });

  it('Flow 4: Assigns room to staff member via backend task creation with canonical IDs', async () => {
    opsService.createHousekeepingTask.mockResolvedValue({
      data: {
        _id: 'new_task_999',
        room_id: '507f1f77bcf86cd799439011',
        assigned_to: '507f1f77bcf86cd799439022',
        status: 'PENDING'
      }
    });

    render(
      <MemoryRouter>
        <StaffAssignment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bilal Khan')).toBeInTheDocument();
    });

    // Click "Assign Work" button in the header
    const assignWorkButtons = screen.getAllByText(/Assign Work/i);
    fireEvent.click(assignWorkButtons[0]);

    // Dialog opens
    expect(screen.getByRole('heading', { name: /Assign Room/i })).toBeInTheDocument();

    // Select Sara Connor as Housekeeper
    const housekeeperCombobox = screen.getByRole('combobox', { name: /Housekeeper/i });
    fireEvent.mouseDown(housekeeperCombobox);
    const saraOption = await screen.findByRole('option', { name: /Sara Connor/i });
    fireEvent.click(saraOption);

    // Select Room Number
    const roomCombobox = screen.getByRole('combobox', { name: /Room Number/i });
    fireEvent.mouseDown(roomCombobox);
    const room101Option = await screen.findByRole('option', { name: /Room 101/i });
    fireEvent.click(room101Option);

    // Submit assignment
    const assignSubmitBtn = screen.getByRole('button', { name: /^Assign$/i });
    expect(assignSubmitBtn).not.toBeDisabled();
    fireEvent.click(assignSubmitBtn);

    await waitFor(() => {
      // Room 101 has an active task in mockTasks for Bilal, so it updates/reassigns to Sara Connor
      expect(opsService.updateHousekeepingTask).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439031',
        expect.objectContaining({
          assigned_to: '507f1f77bcf86cd799439022'
        })
      );
    });
  });

  it('Flow 5: Unassigns all active tasks from an employee via opsService.updateHousekeepingTask with null', async () => {
    opsService.updateHousekeepingTask.mockResolvedValue({
      data: { _id: '507f1f77bcf86cd799439031', assigned_to: null }
    });

    render(
      <MemoryRouter>
        <StaffAssignment />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bilal Khan')).toBeInTheDocument();
    });

    // Click more options for Bilal
    const actionButtons = screen.getAllByRole('button');
    const menuButtons = actionButtons.filter(btn => btn.querySelector('svg[data-testid="MoreVertIcon"]'));
    expect(menuButtons.length).toBeGreaterThan(0);
    fireEvent.click(menuButtons[0]);

    // Click "Unassign All Tasks"
    const unassignMenuItem = await screen.findByText(/Unassign All Tasks/i);
    fireEvent.click(unassignMenuItem);

    await waitFor(() => {
      expect(opsService.updateHousekeepingTask).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439031',
        { assigned_to: null }
      );
    });
  });
});
