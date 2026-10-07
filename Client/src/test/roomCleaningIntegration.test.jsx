import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomsAndCleaning from '../features/housekeeping/pages/RoomsAndCleaning';
import opsService from '../services/opsService';
import roomService from '../services/roomService';
import {
  toFrontendTask,
  toFrontendTaskList,
  toBackendTaskPayload
} from '../features/housekeeping/adapters/housekeepingAdapter';

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

describe('Room Cleaning Backend Integration & Adapter Tests', () => {
  const mockRooms = [
    { _id: 'room_101_id', room_number: '101', floor: '1', housekeeping_status: 'DIRTY' },
    { _id: 'room_102_id', room_number: '102', floor: '1', housekeeping_status: 'CLEAN' }
  ];

  const mockEmployees = [
    { _id: 'emp_1_id', employee_ref: 'EMP-001', first_name: 'John', last_name: 'Cleaner' }
  ];

  const mockBackendTasks = [
    {
      _id: 'task_1',
      room_id: { _id: 'room_101_id', room_number: '101', floor: '1' },
      assigned_to: { _id: 'emp_1_id', first_name: 'John', last_name: 'Cleaner', employee_ref: 'EMP-001' },
      task_type: 'CLEANING',
      priority: 'HIGH',
      status: 'ASSIGNED',
      notes: '[Guest: Alice Wonderland] Vacuum and change sheets',
      started_at: '2026-10-06T09:00:00.000Z',
      completed_at: null
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    roomService.getRooms.mockResolvedValue({ data: mockRooms });
    opsService.getEmployees.mockResolvedValue({ data: mockEmployees });
    opsService.getHousekeepingTasks.mockResolvedValue({ data: mockBackendTasks });
  });

  describe('Housekeeping Adapter Unit Tests', () => {
    it('toFrontendTask correctly maps backend entity to UI contract', () => {
      const frontend = toFrontendTask(mockBackendTasks[0]);
      expect(frontend.id).toBe('task_1');
      expect(frontend.roomNo).toBe('101');
      expect(frontend.guestName).toBe('Alice Wonderland');
      expect(frontend.cleaningType).toBe('Full Clean');
      expect(frontend.priority).toBe('High');
      expect(frontend.cleaningStatus).toBe('Scheduled');
      expect(frontend.assignedStaff).toBe('John Cleaner');
      expect(frontend.notes).toBe('Vacuum and change sheets');
      expect(typeof frontend.scheduledTime).toBe('string');
      expect(frontend.scheduledTime.length).toBe(5);
    });

    it('toBackendTaskPayload correctly maps form input to backend contract', () => {
      const form = {
        roomNo: '101',
        guestName: 'Bob Builder',
        cleaningType: 'Deep Clean',
        priority: 'Urgent',
        cleaningStatus: 'Completed',
        assignedStaff: 'John Cleaner',
        scheduledDate: '2026-10-06',
        scheduledTime: '10:00',
        completionTime: '11:30',
        notes: 'Sanitized'
      };

      const payload = toBackendTaskPayload(form, {
        rooms: mockRooms,
        employees: mockEmployees
      });

      expect(payload.room_id).toBe('room_101_id');
      expect(payload.assigned_to).toBe('emp_1_id');
      expect(payload.task_type).toBe('DEEP_CLEANING');
      expect(payload.priority).toBe('URGENT');
      expect(payload.status).toBe('COMPLETED');
      expect(payload.notes).toContain('[Guest: Bob Builder] Sanitized');
      expect(payload.scheduled_at).toContain('2026-10-06');
      expect(payload.completed_at).toContain('2026-10-06');
    });

    it('toBackendTaskPayload throws an error when room does not exist', () => {
      const form = { roomNo: '999' };
      expect(() => {
        toBackendTaskPayload(form, { rooms: mockRooms, employees: [] });
      }).toThrow(/Room "999" not found/);
    });
  });

  describe('RoomsAndCleaning UI Component Integration', () => {
    it('loads tasks from backend and renders them in the table', async () => {
      render(<RoomsAndCleaning />);

      expect(screen.getByText(/Loading housekeeping tasks.../i)).toBeTruthy();

      await waitFor(() => {
        expect(screen.getByText('101')).toBeTruthy();
        expect(screen.getByText('Alice Wonderland')).toBeTruthy();
        expect(screen.getByText('John Cleaner')).toBeTruthy();
        expect(screen.getByText('Full Clean')).toBeTruthy();
      });

      expect(opsService.getHousekeepingTasks).toHaveBeenCalledTimes(1);
    });

    it('creates a new task via opsService.createHousekeepingTask', async () => {
      const createdBackendTask = {
        _id: 'task_new_2',
        room_id: { _id: 'room_102_id', room_number: '102', floor: '1' },
        assigned_to: { _id: 'emp_1_id', first_name: 'John', last_name: 'Cleaner' },
        task_type: 'CLEANING',
        priority: 'MEDIUM',
        status: 'PENDING',
        notes: '[Guest: New Guest] Clean desk',
        started_at: '2026-10-06T10:00:00.000Z'
      };

      opsService.createHousekeepingTask.mockResolvedValue({ data: createdBackendTask });

      render(<RoomsAndCleaning />);

      await waitFor(() => {
        expect(screen.getByText('101')).toBeTruthy();
      });

      // Open New Record Modal
      fireEvent.click(screen.getByTitle('New Record'));

      // Fill in Form
      fireEvent.change(screen.getByLabelText(/Room No\*/i), { target: { value: '102' } });
      fireEvent.change(screen.getByLabelText(/Guest Name\*/i), { target: { value: 'New Guest' } });
      fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'Clean desk' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

      await waitFor(() => {
        expect(opsService.createHousekeepingTask).toHaveBeenCalledTimes(1);
        expect(screen.getByText('102')).toBeTruthy();
        expect(screen.getByText('New Guest')).toBeTruthy();
      });
    });

    it('updates a task via opsService.updateHousekeepingTask', async () => {
      const updatedBackendTask = {
        ...mockBackendTasks[0],
        notes: '[Guest: Alice Wonderland] Updated instructions'
      };

      opsService.updateHousekeepingTask.mockResolvedValue({ data: updatedBackendTask });

      render(<RoomsAndCleaning />);

      await waitFor(() => {
        expect(screen.getByText('101')).toBeTruthy();
      });

      // Click Edit
      fireEvent.click(screen.getByTitle('Edit'));

      // Change Notes
      fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'Updated instructions' } });

      // Save
      fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

      await waitFor(() => {
        expect(opsService.updateHousekeepingTask).toHaveBeenCalledWith(
          'task_1',
          expect.objectContaining({
            room_id: 'room_101_id',
            notes: '[Guest: Alice Wonderland] Updated instructions'
          })
        );
      });
    });

    it('deletes a task via opsService.deleteHousekeepingTask', async () => {
      opsService.deleteHousekeepingTask.mockResolvedValue({ success: true });

      render(<RoomsAndCleaning />);

      await waitFor(() => {
        expect(screen.getByText('101')).toBeTruthy();
      });

      // Click Delete row action
      fireEvent.click(screen.getByTitle('Delete'));

      // Confirm Delete inside modal
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      const confirmDeleteBtn = deleteButtons[deleteButtons.length - 1];
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(opsService.deleteHousekeepingTask).toHaveBeenCalledWith('task_1');
        expect(screen.queryByText('Alice Wonderland')).toBeNull();
      });
    });

    it('surfaces backend load errors with retry button', async () => {
      opsService.getHousekeepingTasks.mockRejectedValueOnce(new Error('Network error loading tasks'));

      render(<RoomsAndCleaning />);

      await waitFor(() => {
        expect(screen.getByText(/Network error loading tasks/i)).toBeTruthy();
      });

      // Clicking Retry calls loadData again
      opsService.getHousekeepingTasks.mockResolvedValueOnce({ data: mockBackendTasks });
      fireEvent.click(screen.getByRole('button', { name: /Retry/i }));

      await waitFor(() => {
        expect(screen.getByText('101')).toBeTruthy();
      });
    });

    it('localStorage is NOT the authority for Room Cleaning records', async () => {
      // Put arbitrary stale data in hk_rooms
      localStorage.setItem('hk_rooms', JSON.stringify([
        { id: '999', roomNo: '999', guest: 'Stale Local Guest', status: 'Dirty' }
      ]));

      render(<RoomsAndCleaning />);

      await waitFor(() => {
        // UI renders backend data (101), NOT localStorage (999)
        expect(screen.getByText('101')).toBeTruthy();
        expect(screen.queryByText('999')).toBeNull();
        expect(screen.queryByText('Stale Local Guest')).toBeNull();
      });
    });
  });
});
