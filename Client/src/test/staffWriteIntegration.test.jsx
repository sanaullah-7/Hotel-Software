import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AddStaff from '../pages/HR/Staff/AddStaff';
import EditStaff from '../pages/HR/Staff/EditStaff';
import EditStaffModal from '../pages/HR/Staff/EditStaffModal';
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
  },
  staffService: {
    getEmployees: vi.fn(),
    getEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    getDepartments: vi.fn(),
  }
}));

describe('Phase 8 Step 3: Staff Write Domain Backend Integration (Add, Edit, Modal)', () => {
  const mockDepartments = [
    { _id: '670411a0e7a8ceefb0080010', name: 'Housekeeping', code: 'HK' },
    { _id: '670411a0e7a8ceefb0080011', name: 'Front Desk', code: 'FD' }
  ];

  const mockEmployeeBackend = {
    _id: '670411a0e7a8ceefb0080001',
    employee_ref: 'EMP-100',
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane.doe@hotel.com',
    phone: '+1 555 444 3333',
    job_title: 'Room Attendant',
    department_id: {
      _id: '670411a0e7a8ceefb0080010',
      name: 'Housekeeping',
      code: 'HK'
    },
    status: 'ACTIVE',
    address: '123 Ocean View Drive',
    joining_date: '2025-01-15'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    staffService.getDepartments.mockResolvedValue({ data: mockDepartments });
  });

  describe('staffAdapter Write Payloads', () => {
    it('toBackendCreatePayload formats UI form data into canonical backend contract', () => {
      const formData = {
        fullName: 'Alexander Hamilton',
        empId: 'EMP-999',
        email: 'alex@hotel.com',
        mobile: '+1 555 222 1111',
        designation: 'Head Chef',
        department: '670411a0e7a8ceefb0080010',
        employmentStatus: 'Active',
        address: '42 Wall Street',
        salary: '6000',
        dob: '1985-01-11',
        gender: 'Male',
        emergencyName: 'Eliza Hamilton',
        emergencyPhone: '555-999-0000',
        emergencyRelation: 'Spouse'
      };

      const payload = staffAdapter.toBackendCreatePayload(formData);
      expect(payload.employee_ref).toBe('EMP-999');
      expect(payload.first_name).toBe('Alexander');
      expect(payload.last_name).toBe('Hamilton');
      expect(payload.email).toBe('alex@hotel.com');
      expect(payload.phone).toBe('+1 555 222 1111');
      expect(payload.job_title).toBe('Head Chef');
      expect(payload.department_id).toBe('670411a0e7a8ceefb0080010');
      expect(payload.status).toBe('ACTIVE');
      expect(payload.salary).toBe(6000);
      expect(payload.emergency_contact).toEqual({
        name: 'Eliza Hamilton',
        phone: '555-999-0000',
        relation: 'Spouse'
      });
    });

    it('toBackendUpdatePayload serializes updated fields correctly', () => {
      const editData = {
        name: 'Johnathan Edwards',
        designation: 'Sous Chef',
        phone: '1234567890',
        email: 'johnathan@hotel.com',
        joiningDate: '2024-06-01',
        address: '777 Sunset Blvd'
      };

      const payload = staffAdapter.toBackendUpdatePayload(editData);
      expect(payload.first_name).toBe('Johnathan');
      expect(payload.last_name).toBe('Edwards');
      expect(payload.job_title).toBe('Sous Chef');
      expect(payload.phone).toBe('1234567890');
      expect(payload.email).toBe('johnathan@hotel.com');
      expect(payload.joining_date).toBe('2024-06-01');
      expect(payload.address).toBe('777 Sunset Blvd');
    });
  });

  describe('AddStaff Component Integration', () => {
    it('loads departments dynamically from backend on mount', async () => {
      render(
        <MemoryRouter>
          <AddStaff />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(staffService.getDepartments).toHaveBeenCalledTimes(1);
      });
    });

    it('submits backend payload and does NOT write to localStorage', async () => {
      staffService.createEmployee.mockResolvedValueOnce({
        data: {
          _id: '670411a0e7a8ceefb0080099',
          employee_ref: 'EMP-NEW',
          first_name: 'Robert',
          last_name: 'Frost'
        }
      });

      const { container } = render(
        <MemoryRouter>
          <AddStaff />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(staffService.getDepartments).toHaveBeenCalled();
      });

      // Fill in required fields
      const nameInput = screen.getByLabelText(/Full Name\*/i);
      fireEvent.change(nameInput, { target: { name: 'fullName', value: 'Robert Frost' } });

      const emailInput = screen.getByLabelText(/Email Address\*/i);
      fireEvent.change(emailInput, { target: { name: 'email', value: 'robert.frost@hotel.com' } });

      // Designation is select input in DOM
      const designationInput = container.querySelector('input[name="designation"]');
      fireEvent.change(designationInput, { target: { name: 'designation', value: 'Receptionist' } });

      // Submit form
      const submitBtn = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(staffService.createEmployee).toHaveBeenCalled();
      });

      const calledPayload = staffService.createEmployee.mock.calls[0][0];
      expect(calledPayload.first_name).toBe('Robert');
      expect(calledPayload.last_name).toBe('Frost');
      expect(calledPayload.email).toBe('robert.frost@hotel.com');
      expect(calledPayload.job_title).toBe('Receptionist');

      // Verify no localStorage writes
      expect(localStorage.getItem('luxuria_staff_data')).toBeNull();
    });

    it('displays server error banner when creation fails', async () => {
      staffService.createEmployee.mockRejectedValueOnce({
        response: {
          data: { message: 'Employee with this ID already exists' }
        }
      });

      const { container } = render(
        <MemoryRouter>
          <AddStaff />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(staffService.getDepartments).toHaveBeenCalled();
      });

      const nameInput = screen.getByLabelText(/Full Name\*/i);
      fireEvent.change(nameInput, { target: { name: 'fullName', value: 'Test Dup' } });

      const emailInput = screen.getByLabelText(/Email Address\*/i);
      fireEvent.change(emailInput, { target: { name: 'email', value: 'dup@hotel.com' } });

      const designationInput = container.querySelector('input[name="designation"]');
      fireEvent.change(designationInput, { target: { name: 'designation', value: 'Receptionist' } });

      const submitBtn = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Employee with this ID already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('EditStaff Page Integration', () => {
    it('fetches employee by ID and populates fields on mount', async () => {
      staffService.getEmployeeById.mockResolvedValueOnce({
        data: mockEmployeeBackend
      });

      render(
        <MemoryRouter initialEntries={['/hr/staff/670411a0e7a8ceefb0080001/edit']}>
          <Routes>
            <Route path="/hr/staff/:id/edit" element={<EditStaff />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(staffService.getEmployeeById).toHaveBeenCalledWith('670411a0e7a8ceefb0080001');
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('jane.doe@hotel.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('+1 555 444 3333')).toBeInTheDocument();
        expect(screen.getByDisplayValue('123 Ocean View Drive')).toBeInTheDocument();
      });
    });

    it('submits update payload via staffService and does NOT write to localStorage', async () => {
      staffService.getEmployeeById.mockResolvedValueOnce({
        data: mockEmployeeBackend
      });
      staffService.updateEmployee.mockResolvedValueOnce({
        data: {
          ...mockEmployeeBackend,
          first_name: 'Jane',
          last_name: 'Smith',
          address: '999 Updated Bay Way'
        }
      });

      render(
        <MemoryRouter initialEntries={['/hr/staff/670411a0e7a8ceefb0080001/edit']}>
          <Routes>
            <Route path="/hr/staff/:id/edit" element={<EditStaff />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
      });

      // Update name
      const nameInput = screen.getByLabelText(/Name\*/i);
      fireEvent.change(nameInput, { target: { name: 'name', value: 'Jane Smith' } });

      // Save
      const saveBtn = screen.getByRole('button', { name: /^Save$/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(staffService.updateEmployee).toHaveBeenCalled();
      });

      const [targetId, payload] = staffService.updateEmployee.mock.calls[0];
      expect(targetId).toBe('670411a0e7a8ceefb0080001');
      expect(payload.first_name).toBe('Jane');
      expect(payload.last_name).toBe('Smith');

      // Verify no localStorage write
      expect(localStorage.getItem('luxuria_staff_data')).toBeNull();
    });
  });

  describe('EditStaffModal Integration', () => {
    it('submits update payload via staffService and triggers onSaveSuccess without localStorage writes', async () => {
      const onSaveSuccess = vi.fn();
      const onClose = vi.fn();
      const uiStaff = staffAdapter.toUI(mockEmployeeBackend);

      staffService.updateEmployee.mockResolvedValueOnce({
        data: {
          ...mockEmployeeBackend,
          job_title: 'Head Attendant'
        }
      });

      render(
        <EditStaffModal
          open={true}
          staff={uiStaff}
          onClose={onClose}
          onSaveSuccess={onSaveSuccess}
        />
      );

      expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('jane.doe@hotel.com')).toBeInTheDocument();

      // Submit save
      const saveBtn = screen.getByRole('button', { name: /^Save$/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(staffService.updateEmployee).toHaveBeenCalled();
      });

      const [targetId] = staffService.updateEmployee.mock.calls[0];
      expect(targetId).toBe(uiStaff.id);

      await waitFor(() => {
        expect(onSaveSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });

      // Verify no localStorage write
      expect(localStorage.getItem('luxuria_staff_data')).toBeNull();
    });
  });
});
