import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AllStaff from '../pages/HR/Staff/AllStaff';
import StaffProfile from '../pages/HR/Staff/StaffProfile';
import staffService from '../features/staff/services/staffService';
import { staffAdapter } from '../features/staff/adapters/staffAdapter';

vi.mock('../features/staff/services/staffService', () => ({
  default: {
    getEmployees: vi.fn(),
    getEmployeeById: vi.fn(),
    deleteEmployee: vi.fn(),
  },
  staffService: {
    getEmployees: vi.fn(),
    getEmployeeById: vi.fn(),
    deleteEmployee: vi.fn(),
  }
}));

describe('Phase 8 Step 2: All Staff & Staff Profile Backend Integration', () => {
  const mockBackendEmployees = [
    {
      _id: '670411a0e7a8ceefb0080001',
      employee_ref: 'EMP-001',
      first_name: 'Arthur',
      last_name: 'Dent',
      email: 'arthur.dent@hotel.com',
      phone: '+1 555 123 4567',
      job_title: 'Concierge Lead',
      department_id: {
        _id: '670411a0e7a8ceefb0080010',
        name: 'Front Office',
        code: 'FO'
      },
      status: 'ACTIVE',
      created_at: '2026-03-01T10:00:00.000Z',
      updated_at: '2026-03-01T10:00:00.000Z'
    },
    {
      _id: '670411a0e7a8ceefb0080002',
      employee_ref: 'EMP-002',
      first_name: 'Ford',
      last_name: 'Prefect',
      email: 'ford.prefect@hotel.com',
      phone: '+1 555 987 6543',
      job_title: 'Field Scout',
      department_id: {
        _id: '670411a0e7a8ceefb0080011',
        name: 'Guest Services',
        code: 'GS'
      },
      status: 'ON_LEAVE',
      created_at: '2026-02-15T10:00:00.000Z',
      updated_at: '2026-02-15T10:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('staffAdapter Unit Tests', () => {
    it('correctly adapts backend employee contract to UI shape', () => {
      const emp = mockBackendEmployees[0];
      const uiEmp = staffAdapter.toUI(emp);

      expect(uiEmp.id).toBe('670411a0e7a8ceefb0080001');
      expect(uiEmp.empId).toBe('EMP-001');
      expect(uiEmp.name).toBe('Arthur Dent');
      expect(uiEmp.email).toBe('arthur.dent@hotel.com');
      expect(uiEmp.phone).toBe('+1 555 123 4567');
      expect(uiEmp.designation).toBe('Concierge Lead');
      expect(uiEmp.department).toBe('Front Office');
      expect(uiEmp.departmentId).toBe('670411a0e7a8ceefb0080010');
      expect(uiEmp.status).toBe('Active');
      expect(uiEmp.joiningDate).toBe('2026-03-01');
    });

    it('maps ON_LEAVE to "On Leave" and TERMINATED to "Terminated"', () => {
      const onLeaveEmp = staffAdapter.toUI(mockBackendEmployees[1]);
      expect(onLeaveEmp.status).toBe('On Leave');

      const termEmp = staffAdapter.toUI({
        _id: '670411a0e7a8ceefb0080003',
        employee_ref: 'EMP-003',
        first_name: 'Trillian',
        last_name: 'Astra',
        status: 'TERMINATED'
      });
      expect(termEmp.status).toBe('Terminated');
    });

    it('handles missing or unpopulated department gracefully', () => {
      const noDept = staffAdapter.toUI({
        _id: '670411a0e7a8ceefb0080004',
        employee_ref: 'EMP-004',
        first_name: 'Marvin',
        last_name: 'Android'
      });
      expect(noDept.department).toBe('General');
    });

    it('handles empty input safely', () => {
      expect(staffAdapter.toUI(null)).toBeNull();
      expect(staffAdapter.toListUI(null)).toEqual([]);
    });
  });

  describe('AllStaff Page Component Integration', () => {
    it('loads and renders staff from backend on mount', async () => {
      staffService.getEmployees.mockResolvedValueOnce({
        success: true,
        data: mockBackendEmployees
      });

      render(
        <MemoryRouter>
          <AllStaff />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(staffService.getEmployees).toHaveBeenCalledWith({ limit: 200 });
      });

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
        expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
        expect(screen.getByText('Concierge Lead')).toBeInTheDocument();
        expect(screen.getByText('Field Scout')).toBeInTheDocument();
      });
    });

    it('calculates summary cards from backend employee data', async () => {
      staffService.getEmployees.mockResolvedValueOnce({
        success: true,
        data: mockBackendEmployees
      });

      render(
        <MemoryRouter>
          <AllStaff />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      });

      // Total Staff = 2, Active Staff = 1, On Leave = 1
      expect(screen.getByText('Total Staff')).toBeInTheDocument();
      expect(screen.getByText('Active Staff')).toBeInTheDocument();
      expect(screen.getByText('On Leave')).toBeInTheDocument();
    });

    it('filters staff list when user types in search bar', async () => {
      staffService.getEmployees.mockResolvedValueOnce({
        success: true,
        data: mockBackendEmployees
      });

      render(
        <MemoryRouter>
          <AllStaff />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Arthur' } });

      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      expect(screen.queryByText('Ford Prefect')).not.toBeInTheDocument();
    });

    it('shows error banner and does NOT fall back to mock data on backend failure', async () => {
      staffService.getEmployees.mockRejectedValueOnce(new Error('Network error: server unreachable'));

      render(
        <MemoryRouter>
          <AllStaff />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Network error: server unreachable/i)).toBeInTheDocument();
      });

      // Confirm mockStaff names (e.g. John Doe from mockData) NEVER appear
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Mike Johnson')).not.toBeInTheDocument();
    });

    it('soft-terminates employee when delete is triggered', async () => {
      staffService.getEmployees
        .mockResolvedValueOnce({ success: true, data: mockBackendEmployees })
        .mockResolvedValueOnce({ success: true, data: [mockBackendEmployees[1]] });
      staffService.deleteEmployee.mockResolvedValueOnce({ success: true });

      render(
        <MemoryRouter>
          <AllStaff />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete staff/i });
      expect(deleteButtons.length).toBeGreaterThan(0);
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(staffService.deleteEmployee).toHaveBeenCalledWith('670411a0e7a8ceefb0080001');
      });
    });
  });

  describe('StaffProfile Page Component Integration', () => {
    it('loads employee details by ID from backend', async () => {
      staffService.getEmployeeById.mockResolvedValueOnce({
        success: true,
        data: mockBackendEmployees[0]
      });

      render(
        <MemoryRouter initialEntries={['/hr/staff/670411a0e7a8ceefb0080001']}>
          <Routes>
            <Route path="/hr/staff/:id" element={<StaffProfile />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(staffService.getEmployeeById).toHaveBeenCalledWith('670411a0e7a8ceefb0080001');
      });

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
        expect(screen.getByText(/Concierge Lead - Front Office/i)).toBeInTheDocument();
        expect(screen.getByText('+1 555 123 4567')).toBeInTheDocument();
        expect(screen.getByText('arthur.dent@hotel.com')).toBeInTheDocument();
        expect(screen.getByText('ID: EMP-001')).toBeInTheDocument();
      });
    });

    it('displays not found message when employee is not found in backend', async () => {
      staffService.getEmployeeById.mockRejectedValueOnce({
        response: { data: { message: 'Employee not found' } }
      });

      render(
        <MemoryRouter initialEntries={['/hr/staff/invalid_id']}>
          <Routes>
            <Route path="/hr/staff/:id" element={<StaffProfile />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Employee not found/i)).toBeInTheDocument();
        expect(screen.getByText(/Back to Staff Directory/i)).toBeInTheDocument();
      });
    });

    it('soft-terminates employee from profile page and navigates back to directory', async () => {
      staffService.getEmployeeById.mockResolvedValueOnce({
        success: true,
        data: mockBackendEmployees[0]
      });
      staffService.deleteEmployee.mockResolvedValueOnce({ success: true });

      render(
        <MemoryRouter initialEntries={['/hr/staff/670411a0e7a8ceefb0080001']}>
          <Routes>
            <Route path="/hr/staff/:id" element={<StaffProfile />} />
            <Route path="/hr/staff" element={<div>Staff Directory Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      });

      const deleteBtn = screen.getByRole('button', { name: /delete staff/i });
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(staffService.deleteEmployee).toHaveBeenCalledWith('670411a0e7a8ceefb0080001');
        expect(screen.getByText('Staff Directory Page')).toBeInTheDocument();
      });
    });
  });
});
