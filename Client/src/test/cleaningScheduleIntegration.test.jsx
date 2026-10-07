import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CleaningSchedule from '../features/housekeeping/pages/CleaningSchedule';
import opsService from '../services/opsService';
import roomService from '../services/roomService';
import {
  toScheduleTask,
  toScheduleTaskList,
  toScheduleBackendPayload
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

describe('Cleaning Schedule Backend Integration & Adapter Tests', () => {
  const mockRooms = [
    { _id: 'room_201_id', room_number: '201', floor: '2', housekeeping_status: 'DIRTY' },
    { _id: 'room_202_id', room_number: '202', floor: '2', housekeeping_status: 'CLEAN' }
  ];

  const mockEmployees = [
    { _id: 'emp_2_id', employee_ref: 'EMP-002', first_name: 'Ahmed', last_name: 'Cleaner' }
  ];

  const mockBackendTasks = [
    {
      _id: 'task_sch_1',
      room_id: { _id: 'room_201_id', room_number: '201', floor: '2' },
      assigned_to: { _id: 'emp_2_id', first_name: 'Ahmed', last_name: 'Cleaner', employee_ref: 'EMP-002' },
      task_type: 'CLEANING',
      priority: 'MEDIUM',
      status: 'PENDING',
      notes: 'Morning routine clean',
      scheduled_at: '2026-10-07T09:00:00.000Z',
      scheduled_end_at: '2026-10-07T10:00:00.000Z',
      started_at: null,
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

  describe('Adapter Unit Tests for Scheduling', () => {
    it('toScheduleTask correctly maps backend entity to Cleaning Schedule UI contract', () => {
      const scheduleTask = toScheduleTask(mockBackendTasks[0]);
      expect(scheduleTask.id).toBe('task_sch_1');
      expect(scheduleTask.roomNo).toBe('201');
      expect(scheduleTask.taskType).toBe('Full Clean');
      expect(scheduleTask.assignedStaff).toBe('Ahmed Cleaner');
      expect(scheduleTask.priority).toBe('Medium');
      expect(scheduleTask.status).toBe('Pending');
      expect(scheduleTask.notes).toBe('Morning routine clean');
      expect(typeof scheduleTask.startTime).toBe('string');
      expect(typeof scheduleTask.endTime).toBe('string');
    });

    it('toScheduleBackendPayload maps form input to backend contract with scheduling timestamps', () => {
      const form = {
        roomNo: '201',
        taskType: 'Deep Clean',
        priority: 'High',
        status: 'In Progress',
        assignedStaff: 'Ahmed Cleaner',
        startTime: '11:00',
        endTime: '12:30',
        notes: 'Sanitize bathroom'
      };

      const payload = toScheduleBackendPayload(form, {
        rooms: mockRooms,
        employees: mockEmployees
      });

      expect(payload.room_id).toBe('room_201_id');
      expect(payload.assigned_to).toBe('emp_2_id');
      expect(payload.task_type).toBe('DEEP_CLEANING');
      expect(payload.priority).toBe('HIGH');
      expect(payload.status).toBe('IN_PROGRESS');
      expect(payload.scheduled_at).toBeTruthy();
      expect(payload.scheduled_end_at).toBeTruthy();
      expect(new Date(payload.scheduled_at).toTimeString()).toContain('11:00');
      expect(new Date(payload.scheduled_end_at).toTimeString()).toContain('12:30');
      expect(payload.started_at).toBeTruthy();
      expect(payload.notes).toBe('Sanitize bathroom');
    });
  });

  describe('CleaningSchedule UI Component Integration', () => {
    it('loads tasks from backend and renders summary cards and table', async () => {
      render(<CleaningSchedule />);

      expect(screen.getByText(/Loading cleaning schedule.../i)).toBeTruthy();

      await waitFor(() => {
        expect(screen.getByText(/Room 201/)).toBeTruthy();
        expect(screen.getByText('Full Clean')).toBeTruthy();
        expect(screen.getByText('Ahmed Cleaner')).toBeTruthy();
        expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      // Verify summary counters
      expect(screen.getByText("Today's Cleaning Schedule")).toBeTruthy();
      expect(opsService.getHousekeepingTasks).toHaveBeenCalledTimes(1);
    });

    it('creates a new schedule task via opsService.createHousekeepingTask', async () => {
      const createdBackendTask = {
        _id: 'task_new_sch_2',
        room_id: { _id: 'room_202_id', room_number: '202', floor: '2' },
        assigned_to: { _id: 'emp_2_id', first_name: 'Ahmed', last_name: 'Cleaner' },
        task_type: 'DEEP_CLEANING',
        priority: 'HIGH',
        status: 'PENDING',
        notes: 'Deep scrub',
        scheduled_at: '2026-10-07T14:00:00.000Z',
        scheduled_end_at: '2026-10-07T15:00:00.000Z'
      };

      opsService.createHousekeepingTask.mockResolvedValue({ data: createdBackendTask });

      render(<CleaningSchedule />);

      await waitFor(() => {
        expect(screen.getByText(/Room 201/)).toBeTruthy();
      }, { timeout: 3000 });

      // Click New Record
      fireEvent.click(screen.getByTitle('New Record'));

      // Fill in Form
      fireEvent.change(screen.getByLabelText(/Room No\*/i), { target: { value: '202' } });
      fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'Deep scrub' } });

      // Save
      fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

      await waitFor(() => {
        expect(opsService.createHousekeepingTask).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/Room 202/)).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('updates an existing schedule task via opsService.updateHousekeepingTask', async () => {
      const updatedBackendTask = {
        ...mockBackendTasks[0],
        status: 'COMPLETED',
        notes: 'Cleaned and verified'
      };

      opsService.updateHousekeepingTask.mockResolvedValue({ data: updatedBackendTask });

      render(<CleaningSchedule />);

      await waitFor(() => {
        expect(screen.getByText(/Room 201/)).toBeTruthy();
      }, { timeout: 3000 });

      // Click Edit
      fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));

      // Change Notes
      fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'Cleaned and verified' } });

      // Save
      fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

      await waitFor(() => {
        expect(opsService.updateHousekeepingTask).toHaveBeenCalledWith(
          'task_sch_1',
          expect.objectContaining({
            notes: 'Cleaned and verified'
          })
        );
      }, { timeout: 3000 });
    });

    it('deletes an existing schedule task via opsService.deleteHousekeepingTask', async () => {
      opsService.deleteHousekeepingTask.mockResolvedValue({ success: true });

      render(<CleaningSchedule />);

      await waitFor(() => {
        expect(screen.getByText(/Room 201/)).toBeTruthy();
      }, { timeout: 3000 });

      // Click Delete row action
      const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/i });
      fireEvent.click(deleteButtons[0]);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByText(/Confirm Delete/i)).toBeTruthy();
      }, { timeout: 3000 });

      // Confirm Delete inside modal
      const modalDeleteButtons = screen.getAllByRole('button', { name: /^Delete$/i });
      fireEvent.click(modalDeleteButtons[modalDeleteButtons.length - 1]);

      await waitFor(() => {
        expect(opsService.deleteHousekeepingTask).toHaveBeenCalledWith('task_sch_1');
        expect(screen.queryByText(/Room 201/)).toBeNull();
      }, { timeout: 3000 });
    });

    it('surfaces backend load error with retry button', async () => {
      opsService.getHousekeepingTasks.mockRejectedValueOnce(new Error('Backend offline'));

      render(<CleaningSchedule />);

      await waitFor(() => {
        expect(screen.getByText(/Backend offline/i)).toBeTruthy();
      }, { timeout: 3000 });

      // Retry
      opsService.getHousekeepingTasks.mockResolvedValueOnce({ data: mockBackendTasks });
      fireEvent.click(screen.getByRole('button', { name: /Retry/i }));

      await waitFor(() => {
        expect(screen.getByText(/Room 201/)).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('localStorage hk_rooms is NOT authoritative for Cleaning Schedule', async () => {
      // Set stale data in hk_rooms
      localStorage.setItem('hk_rooms', JSON.stringify([
        { id: '888', roomNo: '888', taskType: 'Full Clean', status: 'Pending' }
      ]));

      render(<CleaningSchedule />);

      await waitFor(() => {
        expect(screen.getByText(/Room 201/)).toBeTruthy();
        expect(screen.queryByText(/Room 888/)).toBeNull();
      }, { timeout: 3000 });
    });
  });
});
