import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { getRooms as getHousekeepingRooms, saveRooms as saveHousekeepingRooms } from '../features/housekeeping/pages/hkStore';
import { saveRooms as saveInventoryRooms } from '../features/rooms/state/roomStore';
import RoomsAndCleaning from '../features/housekeeping/pages/RoomsAndCleaning';
import opsService from '../services/opsService';
import roomService from '../services/roomService';

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

describe('Housekeeping Canonical State Alignment & Migration Bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    roomService.getRooms.mockResolvedValue({
      data: [{ _id: 'INV-101', room_number: '101', floor: '1' }]
    });
    opsService.getEmployees.mockResolvedValue({ data: [] });
    opsService.getHousekeepingTasks.mockResolvedValue({
      data: [
        {
          _id: 'task_101',
          room_id: { _id: 'INV-101', room_number: '101', floor: '1' },
          assigned_to: { _id: 'emp_1', first_name: 'Bob', last_name: 'Builder' },
          task_type: 'CLEANING',
          priority: 'HIGH',
          status: 'PENDING',
          notes: '[Guest: Alice Wonderland] Clean please'
        }
      ]
    });
  });

  it('active RoomsAndCleaning UI reads records from backend API and syncs compatibility bridge', async () => {
    render(<RoomsAndCleaning />);

    await waitFor(() => {
      expect(screen.getByText('101')).toBeTruthy();
      expect(screen.getByText('Alice Wonderland')).toBeTruthy();
      expect(screen.getByText('Bob Builder')).toBeTruthy();
    });

    // Check that downstream bridge was synchronized for Cleaning Schedule
    const bridgeRooms = getHousekeepingRooms();
    expect(bridgeRooms.some(r => String(r.roomNo) === '101' || String(r.id) === '101')).toBe(true);
  });

  it('updates made in RoomsAndCleaning call backend and update downstream bridge', async () => {
    opsService.updateHousekeepingTask.mockResolvedValue({
      data: {
        _id: 'task_101',
        room_id: { _id: 'INV-101', room_number: '101', floor: '1' },
        assigned_to: { _id: 'emp_1', first_name: 'Carol', last_name: 'Staff' },
        task_type: 'CLEANING',
        priority: 'MEDIUM',
        status: 'PENDING',
        notes: '[Guest: Alice Wonderland] Extra towels placed'
      }
    });

    render(<RoomsAndCleaning />);

    await waitFor(() => {
      expect(screen.getByText('101')).toBeTruthy();
    });

    // Click edit on the record
    const editBtn = screen.getByTitle('Edit');
    fireEvent.click(editBtn);

    // Edit notes
    const notesInput = screen.getByLabelText(/Notes/i);
    fireEvent.change(notesInput, { target: { value: 'Extra towels placed' } });

    // Submit the form
    const saveBtn = screen.getByRole('button', { name: /^Save$/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(opsService.updateHousekeepingTask).toHaveBeenCalledWith(
        'task_101',
        expect.objectContaining({
          notes: expect.stringContaining('Extra towels placed')
        })
      );
    });

    // Verify compatibility bridge sync
    const canonicalRooms = getHousekeepingRooms();
    const room101 = canonicalRooms.find((r) => r.id === '101' || r.roomNo === '101');
    expect(room101).toBeDefined();
    expect(room101.notes).toContain('Extra towels placed');
  });

  it('preserves Room.id -> Housekeeping.roomId relationship on save', () => {
    saveInventoryRooms([{ id: 'R-INV-202', roomNo: '202' }]);

    saveHousekeepingRooms([
      {
        id: '202',
        roomNo: '202',
        status: 'Dirty',
        cleaningType: 'Deep Clean'
      }
    ]);

    const rooms = getHousekeepingRooms();
    expect(rooms.find((r) => r.id === '202').roomId).toBe('R-INV-202');
  });
});
