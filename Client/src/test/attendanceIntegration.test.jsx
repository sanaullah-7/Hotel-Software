import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodaysAttendance from '../pages/HR/Attendance/TodaysAttendance';
import AttendanceSheet from '../pages/HR/Attendance/AttendanceSheet';
import attendanceService from '../features/staff/services/attendanceService';
import staffService from '../features/staff/services/staffService';
import attendanceAdapter from '../features/staff/adapters/attendanceAdapter';

vi.mock('../features/staff/services/attendanceService', () => ({
  default: {
    getAttendance: vi.fn(),
    getAttendanceById: vi.fn(),
    createAttendance: vi.fn(),
    updateAttendance: vi.fn(),
    deleteAttendance: vi.fn(),
  },
  attendanceService: {
    getAttendance: vi.fn(),
    getAttendanceById: vi.fn(),
    createAttendance: vi.fn(),
    updateAttendance: vi.fn(),
    deleteAttendance: vi.fn(),
  },
}));

vi.mock('../features/staff/services/staffService', () => ({
  default: {
    getEmployees: vi.fn(),
    getEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    getDepartments: vi.fn(),
    getAttendance: vi.fn(),
    createAttendance: vi.fn(),
    updateAttendance: vi.fn(),
    deleteAttendance: vi.fn(),
  },
  staffService: {
    getEmployees: vi.fn(),
    getEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    getDepartments: vi.fn(),
    getAttendance: vi.fn(),
    createAttendance: vi.fn(),
    updateAttendance: vi.fn(),
    deleteAttendance: vi.fn(),
  },
}));

describe('Phase 8 Step 5: Attendance Backend Integration Tests', () => {
  const mockEmployeesBackend = [
    {
      _id: '670411a0e7a8ceefb0080001',
      employee_ref: 'EMP-001',
      first_name: 'Arthur',
      last_name: 'Dent',
      job_title: 'Concierge Lead',
      status: 'ACTIVE',
      department_id: { _id: '670411a0e7a8ceefb0080010', name: 'Front Desk', code: 'FD' },
    },
    {
      _id: '670411a0e7a8ceefb0080002',
      employee_ref: 'EMP-002',
      first_name: 'Tricia',
      last_name: 'McMillan',
      job_title: 'Field Agent',
      status: 'ACTIVE',
      department_id: { _id: '670411a0e7a8ceefb0080011', name: 'Housekeeping', code: 'HK' },
    },
  ];

  const mockAttendanceBackend = [
    {
      _id: '670411a0e7a8ceefb0080080',
      employee_id: mockEmployeesBackend[0],
      date: '2026-10-07T00:00:00.000Z',
      clock_in_time: '2026-10-07T09:00:00.000Z',
      clock_out_time: '2026-10-07T18:00:00.000Z',
      status: 'PRESENT',
      shift: 'Day Shift',
      break_time: '01:00',
      total_hours: '08:00',
      notes: 'Morning shift',
    },
    {
      _id: '670411a0e7a8ceefb0080081',
      employee_id: mockEmployeesBackend[1],
      date: '2026-10-07T00:00:00.000Z',
      clock_in_time: null,
      clock_out_time: null,
      status: 'ABSENT',
      shift: 'Day Shift',
      break_time: '01:00',
      total_hours: '00:00',
      notes: 'Sick leave',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    staffService.getEmployees.mockResolvedValue({ data: mockEmployeesBackend });
    attendanceService.getAttendance.mockResolvedValue({ data: mockAttendanceBackend });
  });

  describe('attendanceAdapter Mapping Tests', () => {
    it('correctly adapts backend AttendanceRecord to UI row shape', () => {
      const uiRow = attendanceAdapter.toTodayAttendanceUI(mockAttendanceBackend[0]);
      expect(uiRow.id).toBe('670411a0e7a8ceefb0080080');
      expect(uiRow.name).toBe('Arthur Dent');
      expect(uiRow.empId).toBe('EMP-001');
      expect(uiRow.status).toBe('present');
      expect(uiRow.shift).toBe('Day Shift');
      expect(uiRow.firstIn).toBe('09:00');
      expect(uiRow.lastOut).toBe('18:00');
      expect(uiRow.totalHours).toBe('08:00');
    });

    it('converts modal form data into canonical backend payload', () => {
      const formData = {
        employee_id: '670411a0e7a8ceefb0080001',
        shift: 'Night Shift',
        status: 'present',
        firstIn: '20:00',
        lastOut: '04:00',
        breakTime: '01:00',
        totalHours: '07:00',
        notes: 'Night shift duty',
      };

      const payload = attendanceAdapter.toAttendanceBackendPayload(formData, '2026-10-07');
      expect(payload.employee_id).toBe('670411a0e7a8ceefb0080001');
      expect(payload.shift).toBe('Night Shift');
      expect(payload.status).toBe('PRESENT');
      expect(payload.clock_in_time).toBe('2026-10-07T20:00:00.000Z');
      expect(payload.clock_out_time).toBe('2026-10-07T04:00:00.000Z');
      expect(payload.break_time).toBe('01:00');
    });

    it('generates attendance matrix from canonical employees and records', () => {
      const matrix = attendanceAdapter.toMatrixUI(mockEmployeesBackend, mockAttendanceBackend, 2026, 9); // October
      expect(matrix['670411a0e7a8ceefb0080001']).toBeDefined();
      expect(matrix['670411a0e7a8ceefb0080001'][7]).toBe('P'); // Oct 7 present
      expect(matrix['670411a0e7a8ceefb0080002'][7]).toBe('A'); // Oct 7 absent
    });
  });

  describe('TodaysAttendance Component Integration', () => {
    it('loads and renders backend attendance data and 6 metric cards on mount', async () => {
      render(<TodaysAttendance />);

      expect(screen.getByText(/Loading today's attendance records from server/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(attendanceService.getAttendance).toHaveBeenCalled();
        expect(staffService.getEmployees).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
        expect(screen.getByText('Tricia McMillan')).toBeInTheDocument();
        expect(screen.getByText('Total Employees')).toBeInTheDocument();
        expect(screen.getByText('Attendance Rate')).toBeInTheDocument();
      });

      // Confirm no localStorage usage
      expect(localStorage.getItem('attendance_records')).toBeNull();
    });

    it('displays error banner and does NOT fall back to mock data on server error', async () => {
      attendanceService.getAttendance.mockRejectedValueOnce(new Error('Network error: server unavailable'));

      render(<TodaysAttendance />);

      await waitFor(() => {
        expect(screen.getAllByText(/Network error: server unavailable/i).length).toBeGreaterThan(0);
      });

      // Verify hardcoded demo records are not rendered
      expect(screen.queryByText('Jacob Ryan')).not.toBeInTheDocument();
    });

    it('records new attendance via modal and calls attendanceService.createAttendance', async () => {
      attendanceService.createAttendance.mockResolvedValueOnce({
        data: {
          _id: '670411a0e7a8ceefb0080099',
          employee_id: mockEmployeesBackend[0],
          date: '2026-10-07T00:00:00.000Z',
          status: 'PRESENT',
          shift: 'Day Shift',
        },
      });

      render(<TodaysAttendance />);

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      });

      // Click Add Attendance
      const addBtn = screen.getByRole('button', { name: /Add Attendance/i });
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(screen.getByText("Add Today's Attendance")).toBeInTheDocument();
      });

      // Click Save in modal
      const saveBtn = screen.getByRole('button', { name: /Save Attendance/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(attendanceService.createAttendance).toHaveBeenCalled();
      });

      // Ensure no localStorage write
      expect(localStorage.getItem('attendance_records')).toBeNull();
    });

    it('deletes attendance record via attendanceService.deleteAttendance', async () => {
      attendanceService.deleteAttendance.mockResolvedValueOnce({
        data: { message: 'Deleted' },
      });

      render(<TodaysAttendance />);

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      });

      // Click delete button on row
      const deleteIcons = screen.getAllByTestId('DeleteOutlinedIcon');
      fireEvent.click(deleteIcons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Attendance Record\?/i)).toBeInTheDocument();
      });

      // Confirm Delete
      const confirmDeleteBtn = screen.getByRole('button', { name: /^Delete$/i });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(attendanceService.deleteAttendance).toHaveBeenCalledWith('670411a0e7a8ceefb0080080');
      });
    });
  });

  describe('AttendanceSheet Component Integration', () => {
    it('loads canonical staff and month attendance from server and renders matrix', async () => {
      render(<AttendanceSheet />);

      await waitFor(() => {
        expect(staffService.getEmployees).toHaveBeenCalled();
        expect(attendanceService.getAttendance).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
        expect(screen.getByText('Tricia McMillan')).toBeInTheDocument();
        expect(screen.getAllByText('Present').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Leave').length).toBeGreaterThan(0);
      });

      // Confirm no localStorage usage
      expect(localStorage.getItem('attendance_sheet_data')).toBeNull();
    });

    it('mutates cell attendance on click and calls attendanceService.updateAttendance / createAttendance', async () => {
      attendanceService.updateAttendance.mockResolvedValue({
        data: {
          _id: '670411a0e7a8ceefb0080080',
          employee_id: mockEmployeesBackend[0],
          status: 'ABSENT',
        },
      });
      attendanceService.createAttendance.mockResolvedValue({
        data: {
          _id: '670411a0e7a8ceefb0080099',
          employee_id: mockEmployeesBackend[0]._id,
          status: 'ABSENT',
        },
      });

      render(<AttendanceSheet />);

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      });

      // Find an interactive cell button for Arthur Dent
      const buttons = screen.getAllByRole('button');
      const cellBtn = buttons.find((b) => b.textContent === 'P');
      expect(cellBtn).toBeDefined();

      fireEvent.click(cellBtn);

      await waitFor(() => {
        const wasCalled = attendanceService.updateAttendance.mock.calls.length > 0 ||
                          attendanceService.createAttendance.mock.calls.length > 0;
        expect(wasCalled).toBe(true);
      });
    });
  });
});
