import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LeaveRequests from '../pages/HR/LeaveRequests/LeaveRequests';
import staffService from '../features/staff/services/staffService';
import staffAdapter from '../features/staff/adapters/staffAdapter';

vi.mock('../features/staff/services/staffService', () => ({
  default: {
    getEmployees: vi.fn(),
    getEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    getDepartments: vi.fn(),
    getLeaveRequests: vi.fn(),
    getLeaveRequestById: vi.fn(),
    createLeaveRequest: vi.fn(),
    updateLeaveRequest: vi.fn(),
    deleteLeaveRequest: vi.fn(),
  },
  staffService: {
    getEmployees: vi.fn(),
    getEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    getDepartments: vi.fn(),
    getLeaveRequests: vi.fn(),
    getLeaveRequestById: vi.fn(),
    createLeaveRequest: vi.fn(),
    updateLeaveRequest: vi.fn(),
    deleteLeaveRequest: vi.fn(),
  }
}));

describe('Phase 8 Step 4: Leave Requests Backend Integration Tests', () => {
  const mockEmployeesBackend = [
    {
      _id: '670411a0e7a8ceefb0080001',
      employee_ref: 'EMP-001',
      first_name: 'Arthur',
      last_name: 'Dent',
      job_title: 'Concierge Lead',
      department_id: { _id: '670411a0e7a8ceefb0080010', name: 'Front Desk', code: 'FD' }
    },
    {
      _id: '670411a0e7a8ceefb0080002',
      employee_ref: 'EMP-002',
      first_name: 'Tricia',
      last_name: 'McMillan',
      job_title: 'Field Scout',
      department_id: { _id: '670411a0e7a8ceefb0080011', name: 'Housekeeping', code: 'HK' }
    },
    {
      _id: '670411a0e7a8ceefb0080003',
      employee_ref: 'EMP-003',
      first_name: 'Zaphod',
      last_name: 'Beeblebrox',
      job_title: 'Director',
      department_id: { _id: '670411a0e7a8ceefb0080010', name: 'Front Desk', code: 'FD' }
    }
  ];

  const mockLeaveBackend = [
    {
      _id: '670411a0e7a8ceefb0080050',
      employee_id: mockEmployeesBackend[0],
      leave_type: 'ANNUAL',
      start_date: '2026-05-10T00:00:00.000Z',
      end_date: '2026-05-15T00:00:00.000Z',
      days: 6,
      reason: 'Summer vacation trip',
      status: 'APPROVED',
      approved_by: mockEmployeesBackend[2],
      manager_comments: 'Approved by manager',
      created_at: '2026-04-01T10:00:00.000Z'
    },
    {
      _id: '670411a0e7a8ceefb0080051',
      employee_id: mockEmployeesBackend[1],
      leave_type: 'SICK',
      start_date: '2026-06-01T00:00:00.000Z',
      end_date: '2026-06-03T00:00:00.000Z',
      days: 3,
      reason: 'Doctor appointment',
      status: 'PENDING',
      created_at: '2026-04-02T10:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    staffService.getEmployees.mockResolvedValue({ data: mockEmployeesBackend });
    staffService.getLeaveRequests.mockResolvedValue({ data: mockLeaveBackend });
  });

  describe('staffAdapter Leave Mapping Tests', () => {
    it('correctly adapts backend LeaveRequest to UI shape', () => {
      const uiLeave = staffAdapter.toLeaveUI(mockLeaveBackend[0]);
      expect(uiLeave.id).toBe('670411a0e7a8ceefb0080050');
      expect(uiLeave.name).toBe('Arthur Dent');
      expect(uiLeave.empId).toBe('EMP-001');
      expect(uiLeave.department).toBe('Front Desk');
      expect(uiLeave.designation).toBe('Concierge Lead');
      expect(uiLeave.leaveType).toBe('Annual Leave');
      expect(uiLeave.status).toBe('Approved');
      expect(uiLeave.from).toBe('2026-05-10');
      expect(uiLeave.to).toBe('2026-05-15');
      expect(uiLeave.days).toBe(6);
      expect(uiLeave.approvedBy).toBe('Zaphod Beeblebrox');
      expect(uiLeave.reason).toBe('Summer vacation trip');
    });

    it('converts UI modal formData into canonical backend payload', () => {
      const formData = {
        employee_id: '670411a0e7a8ceefb0080001',
        leaveType: 'Sick Leave',
        from: '2026-07-01',
        to: '2026-07-04',
        days: 4,
        reason: 'Severe flu',
        status: 'Pending'
      };

      const payload = staffAdapter.toLeaveBackendPayload(formData);
      expect(payload.employee_id).toBe('670411a0e7a8ceefb0080001');
      expect(payload.leave_type).toBe('SICK');
      expect(payload.start_date).toBe('2026-07-01');
      expect(payload.end_date).toBe('2026-07-04');
      expect(payload.days).toBe(4);
      expect(payload.reason).toBe('Severe flu');
      expect(payload.status).toBe('PENDING');
    });
  });

  describe('LeaveRequests Component UI Integration', () => {
    it('loads and renders backend leave requests and summary statistics on mount', async () => {
      render(<LeaveRequests />);

      expect(screen.getByText(/Loading leave requests from server/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(staffService.getLeaveRequests).toHaveBeenCalledTimes(1);
        expect(staffService.getEmployees).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
        expect(screen.getByText('Tricia McMillan')).toBeInTheDocument();
        expect(screen.getByText('Annual Leave')).toBeInTheDocument();
        expect(screen.getByText('Sick Leave')).toBeInTheDocument();
      });

      // Verify no localStorage usage
      expect(localStorage.getItem('luxuria_leave_data')).toBeNull();
    });

    it('displays error banner and does NOT fallback to mock data on backend failure', async () => {
      staffService.getLeaveRequests.mockRejectedValueOnce(new Error('Network error: server down'));

      render(<LeaveRequests />);

      await waitFor(() => {
        expect(screen.getByText(/Network error: server down/i)).toBeInTheDocument();
      });

      // Verify no demo items rendered
      expect(screen.queryByText('John Deo')).not.toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('creates a new leave request via modal and submits payload to staffService.createLeaveRequest', async () => {
      staffService.createLeaveRequest.mockResolvedValueOnce({
        data: {
          _id: '670411a0e7a8ceefb0080099',
          employee_id: mockEmployeesBackend[0],
          leave_type: 'SPECIAL',
          start_date: '2026-08-01T00:00:00.000Z',
          end_date: '2026-08-05T00:00:00.000Z',
          days: 5,
          reason: 'Family event',
          status: 'PENDING'
        }
      });

      const { container } = render(<LeaveRequests />);

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      });

      // Open Apply Leave modal
      const applyBtn = screen.getByRole('button', { name: /Apply Leave/i });
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(screen.getByText('New Leave Request')).toBeInTheDocument();
      });

      // Fill reason
      const reasonInput = screen.getByLabelText(/Reason\*/i);
      fireEvent.change(reasonInput, { target: { value: 'Family event' } });

      // Click Save
      const saveBtn = screen.getByRole('button', { name: /^Save$/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(staffService.createLeaveRequest).toHaveBeenCalled();
      });

      const calledPayload = staffService.createLeaveRequest.mock.calls[0][0];
      expect(calledPayload.employee_id).toBe(mockEmployeesBackend[0]._id);
      expect(calledPayload.reason).toBe('Family event');
      expect(calledPayload.status).toBe('PENDING');

      // Verify no localStorage write
      expect(localStorage.getItem('luxuria_leave_data')).toBeNull();
    });

    it('deletes a leave request via staffService.deleteLeaveRequest', async () => {
      staffService.deleteLeaveRequest.mockResolvedValueOnce({
        data: null
      });

      render(<LeaveRequests />);

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      });

      // Click delete button on the first row
      const deleteButtons = screen.getAllByRole('button', { name: /Delete leave request/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(staffService.deleteLeaveRequest).toHaveBeenCalledWith('670411a0e7a8ceefb0080050');
      });
    });
  });
});
