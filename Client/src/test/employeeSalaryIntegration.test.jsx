import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeSalary from '../pages/HR/Salary/EmployeeSalary';
import { payrollService } from '../features/staff/services/payrollService';
import { payrollAdapter } from '../features/staff/adapters/payrollAdapter';

vi.mock('../features/staff/services/payrollService', () => ({
  payrollService: {
    getPayrollRoster: vi.fn(),
    getPayrollRuns: vi.fn(),
    getPayrollRunById: vi.fn(),
    createPayrollRun: vi.fn(),
    updatePayrollRun: vi.fn(),
    deletePayrollRun: vi.fn(),
    getPayrollItems: vi.fn(),
    getPayrollItemById: vi.fn(),
    createPayrollItem: vi.fn(),
    updatePayrollItem: vi.fn(),
    deletePayrollItem: vi.fn(),
    updateEmployeeSalary: vi.fn(),
  },
  default: {
    getPayrollRoster: vi.fn(),
    getPayrollRuns: vi.fn(),
    getPayrollRunById: vi.fn(),
    createPayrollRun: vi.fn(),
    updatePayrollRun: vi.fn(),
    deletePayrollRun: vi.fn(),
    getPayrollItems: vi.fn(),
    getPayrollItemById: vi.fn(),
    createPayrollItem: vi.fn(),
    updatePayrollItem: vi.fn(),
    deletePayrollItem: vi.fn(),
    updateEmployeeSalary: vi.fn(),
  },
}));

vi.mock('../features/staff/services/staffService', () => ({
  staffService: {
    createStaff: vi.fn(),
  },
  default: {
    createStaff: vi.fn(),
  },
}));

describe('Phase 8 Step 6: Employee Salary Frontend Backend Integration Tests', () => {
  const mockBackendRoster = [
    {
      id: '670411a0e7a8ceefb0080001',
      employee_id: '670411a0e7a8ceefb0080001',
      payroll_item_id: '670411a0e7a8ceefb0080010',
      empId: 'EMP-001',
      name: 'John Doe',
      email: 'john.doe@hotel.com',
      department: 'Management',
      role: 'General Manager',
      salary: 5000,
      bonus: 500,
      deductions: 200,
      netSalary: 5300,
      paymentStatus: 'Paid',
      paymentDate: '2026-10-01',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    },
    {
      id: '670411a0e7a8ceefb0080002',
      employee_id: '670411a0e7a8ceefb0080002',
      payroll_item_id: '670411a0e7a8ceefb0080020',
      empId: 'EMP-002',
      name: 'Jane Smith',
      email: 'jane.smith@hotel.com',
      department: 'Front Office',
      role: 'Receptionist',
      salary: 3200,
      bonus: 200,
      deductions: 100,
      netSalary: 3300,
      paymentStatus: 'Pending',
      paymentDate: '',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Payroll Adapter Unit Tests', () => {
    it('should accurately adapt backend roster item to UI row format', () => {
      const raw = {
        _id: '670411a0e7a8ceefb0080099',
        employee_ref: 'EMP-999',
        first_name: 'Arthur',
        last_name: 'Dent',
        email: 'arthur@hotel.com',
        job_title: 'Concierge Lead',
        department_id: { name: 'Front Desk' },
        salary: 4500,
        bonuses: 300,
        deductions: 150,
        status: 'PAID',
      };

      const row = payrollAdapter.toSalaryRow(raw);
      expect(row.id).toBe('670411a0e7a8ceefb0080099');
      expect(row.empId).toBe('EMP-999');
      expect(row.name).toBe('Arthur Dent');
      expect(row.department).toBe('Front Desk');
      expect(row.role).toBe('Concierge Lead');
      expect(row.salary).toBe(4500);
      expect(row.bonus).toBe(300);
      expect(row.deductions).toBe(150);
      expect(row.netSalary).toBe(4650);
      expect(row.paymentStatus).toBe('Paid');
    });

    it('should handle missing and default values gracefully', () => {
      const emptyRow = payrollAdapter.toSalaryRow({});
      expect(emptyRow.salary).toBe(0);
      expect(emptyRow.bonus).toBe(0);
      expect(emptyRow.deductions).toBe(0);
      expect(emptyRow.netSalary).toBe(0);
      expect(emptyRow.paymentStatus).toBe('Pending');
      expect(emptyRow.name).toBe('Staff Member');
    });
  });

  describe('EmployeeSalary Page Component Integration', () => {
    it('loads and displays employee salary roster from backend on mount', async () => {
      payrollService.getPayrollRoster.mockResolvedValueOnce({
        success: true,
        data: mockBackendRoster,
      });

      render(<EmployeeSalary />);

      expect(payrollService.getPayrollRoster).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Employee IDs
      expect(screen.getByText('john.doe@hotel.com')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@hotel.com')).toBeInTheDocument();

      // Summary Cards Verification
      // Total Employees = 2
      expect(screen.getByText('Total Employees')).toBeInTheDocument();
      expect(screen.getByText('Total Payroll')).toBeInTheDocument();
      expect(screen.getAllByText('$8,600').length).toBeGreaterThanOrEqual(1); // 5300 + 3300 = 8600
    });

    it('shows error banner and does NOT fall back to mock data on backend failure', async () => {
      payrollService.getPayrollRoster.mockRejectedValueOnce(
        new Error('Network error: server unreachable')
      );

      render(<EmployeeSalary />);

      await waitFor(() => {
        expect(
          screen.getByText('Network error: server unreachable')
        ).toBeInTheDocument();
      });

      // Assert no mock salaries are rendered
      expect(screen.queryByText('EMP-001')).not.toBeInTheDocument();
      expect(
        screen.getByText('No employee salary records found matching your filters.')
      ).toBeInTheDocument();

      // Verify Retry button exists and functions
      const retryBtn = screen.getByRole('button', { name: /retry/i });
      expect(retryBtn).toBeInTheDocument();

      payrollService.getPayrollRoster.mockResolvedValueOnce({
        success: true,
        data: mockBackendRoster,
      });

      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('allows searching employee salary records by name and filtering', async () => {
      payrollService.getPayrollRoster.mockResolvedValueOnce({
        success: true,
        data: mockBackendRoster,
      });

      render(<EmployeeSalary />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Jane' } });

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('submits salary edits through backend payrollService and updates roster', async () => {
      payrollService.getPayrollRoster
        .mockResolvedValueOnce({ success: true, data: mockBackendRoster })
        .mockResolvedValueOnce({
          success: true,
          data: [
            {
              ...mockBackendRoster[0],
              salary: 6000,
              netSalary: 6300,
            },
            mockBackendRoster[1],
          ],
        });

      payrollService.updateEmployeeSalary.mockResolvedValueOnce({
        success: true,
        data: { _id: '670411a0e7a8ceefb0080001', salary: 6000 },
      });
      payrollService.updatePayrollItem.mockResolvedValueOnce({
        success: true,
        data: { _id: '670411a0e7a8ceefb0080010', base_salary: 6000, net_pay: 6300 },
      });

      render(<EmployeeSalary />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Find edit button for first row
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
      fireEvent.click(editButtons[0]);

      // Edit dialog opens
      await waitFor(() => {
        expect(screen.getByText('Edit Employee Salary')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      const salaryInput = dialog.querySelector('input[type="number"]') || screen.getAllByLabelText(/salary/i)[0];
      fireEvent.change(salaryInput, { target: { value: '6000' } });

      // Save
      const saveBtn = screen.getByRole('button', { name: /^update$/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(payrollService.updateEmployeeSalary).toHaveBeenCalledWith(
          '670411a0e7a8ceefb0080002',
          6000
        );
      });
    });
  });
});
