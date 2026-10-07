import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InspectionChecklist from '../features/housekeeping/pages/InspectionChecklist';
import inspectionService from '../services/inspectionService';
import {
  toFrontendInspection,
  toFrontendInspectionList,
  toBackendPayload,
  mapStatusToFrontend,
  mapStatusToBackend,
} from '../features/housekeeping/adapters/inspectionChecklistAdapter';

vi.mock('../services/inspectionService', () => ({
  default: {
    getInspections: vi.fn(),
    getInspectionById: vi.fn(),
    createInspection: vi.fn(),
    updateInspection: vi.fn(),
    deleteInspection: vi.fn(),
    getChecklists: vi.fn(),
    createChecklist: vi.fn(),
  },
  inspectionService: {
    getInspections: vi.fn(),
    getInspectionById: vi.fn(),
    createInspection: vi.fn(),
    updateInspection: vi.fn(),
    deleteInspection: vi.fn(),
    getChecklists: vi.fn(),
    createChecklist: vi.fn(),
  },
}));

describe('Inspection Checklist Backend Integration & Adapter Tests (Step 5)', () => {
  const mockBackendInspections = [
    {
      _id: 'ins_101',
      task_id: {
        _id: 'task_001',
        room_id: {
          _id: 'room_101',
          room_number: '101',
          room_type_id: { name: 'Deluxe Suite', code: 'DLX' },
        },
      },
      inspector_id: {
        _id: 'emp_001',
        first_name: 'John',
        last_name: 'Smith',
        employee_ref: 'EMP-001',
      },
      status: 'PASSED',
      passed: true,
      score: 95,
      comments: 'Room is in pristine condition.',
      inspected_at: '2026-02-02T10:00:00.000Z',
    },
    {
      _id: 'ins_102',
      task_id: {
        _id: 'task_002',
        room_id: {
          _id: 'room_102',
          room_number: '102',
          room_type_id: { name: 'Standard Room', code: 'STD' },
        },
      },
      inspector_id: {
        _id: 'emp_002',
        first_name: 'Jane',
        last_name: 'Doe',
        employee_ref: 'EMP-002',
      },
      status: 'FAILED',
      passed: false,
      score: 55,
      comments: 'Dust on tables and missing towels.',
      inspected_at: '2026-02-03T11:30:00.000Z',
    },
    {
      _id: 'ins_103',
      task_id: {
        _id: 'task_003',
        room_id: {
          _id: 'room_201',
          room_number: '201',
          room_type_id: { name: 'Penthouse', code: 'PNT' },
        },
      },
      inspector_id: {
        _id: 'emp_003',
        first_name: 'Mike',
        last_name: 'Ross',
        employee_ref: 'EMP-003',
      },
      status: 'PENDING',
      passed: false,
      score: 0,
      comments: 'Scheduled inspection.',
      inspected_at: '2026-02-04T09:15:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    inspectionService.getInspections.mockResolvedValue({
      data: { inspections: mockBackendInspections },
    });
  });

  describe('Adapter Unit Tests', () => {
    it('toFrontendInspection correctly transforms backend document to UI model', () => {
      const adapted = toFrontendInspection(mockBackendInspections[0]);

      expect(adapted.id).toBe('ins_101');
      expect(adapted.roomNo).toBe('101');
      expect(adapted.roomType).toBe('Deluxe');
      expect(adapted.inspector).toBe('John Smith');
      expect(adapted.status).toBe('Passed');
      expect(adapted.score).toBe(95);
      expect(adapted.comments).toBe('Room is in pristine condition.');
      expect(adapted.inspectionDate).toBe('2026-02-02');
    });

    it('toFrontendInspectionList maps array of inspections', () => {
      const list = toFrontendInspectionList(mockBackendInspections);

      expect(list.length).toBe(3);
      expect(list[0].roomNo).toBe('101');
      expect(list[1].roomNo).toBe('102');
      expect(list[2].roomNo).toBe('201');
    });

    it('mapStatus bidirectional conversion works correctly', () => {
      expect(mapStatusToFrontend('PASSED')).toBe('Passed');
      expect(mapStatusToFrontend('FAILED')).toBe('Failed');
      expect(mapStatusToFrontend('PENDING')).toBe('Pending');

      expect(mapStatusToBackend('Passed')).toBe('PASSED');
      expect(mapStatusToBackend('Failed')).toBe('FAILED');
      expect(mapStatusToBackend('Pending')).toBe('PENDING');
    });

    it('toBackendPayload builds valid backend schema payload', () => {
      const form = {
        roomNo: '305',
        roomType: 'Suite',
        inspector: 'Sarah Connor',
        status: 'Passed',
        score: 92,
        comments: 'Everything is spotless.',
        inspectionDate: '2026-02-05',
      };

      const payload = toBackendPayload(form);

      expect(payload.room_number).toBe('305');
      expect(payload.inspector_name).toBe('Sarah Connor');
      expect(payload.status).toBe('PASSED');
      expect(payload.score).toBe(92);
      expect(payload.comments).toBe('Everything is spotless.');
      expect(payload.inspected_at).toBeDefined();
    });
  });

  describe('UI Component Integration', () => {
    it('loads and renders backend inspections, replacing hardcoded initialInspections', async () => {
      render(<InspectionChecklist />);

      // Verify service was called
      await waitFor(() => {
        expect(inspectionService.getInspections).toHaveBeenCalledWith({ limit: 200 });
      });

      // Verify backend records rendered in table
      await waitFor(() => {
        expect(screen.getByText('Room 101')).toBeInTheDocument();
        expect(screen.getByText('Room 102')).toBeInTheDocument();
        expect(screen.getByText('Room 201')).toBeInTheDocument();
      });

      // Verify inspectors
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Mike Ross')).toBeInTheDocument();

      // Verify summary cards derived from backend records (Total: 3, Passed: 1, Failed: 1, Avg: 50%)
      expect(screen.getByText('Total Inspections')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders empty state when backend returns no inspections without falling back to demo data', async () => {
      inspectionService.getInspections.mockResolvedValueOnce({
        data: { inspections: [] },
      });

      render(<InspectionChecklist />);

      await waitFor(() => {
        expect(screen.getByText('No inspections recorded.')).toBeInTheDocument();
      });

      // Ensure demo data (e.g. Room 418 or 501 from initialInspections) is NOT rendered
      expect(screen.queryByText('Room 418')).not.toBeInTheDocument();
      expect(screen.queryByText('Room 501')).not.toBeInTheDocument();
    });

    it('displays error banner and recovers on retry', async () => {
      inspectionService.getInspections
        .mockRejectedValueOnce(new Error('Network error loading inspections'))
        .mockResolvedValueOnce({
          data: { inspections: mockBackendInspections },
        });

      render(<InspectionChecklist />);

      await waitFor(() => {
        expect(screen.getByText(/Network error loading inspections/i)).toBeInTheDocument();
      });

      // Click retry
      const retryBtn = screen.getByText('Retry');
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Room 101')).toBeInTheDocument();
      });
    });

    it('creates a new inspection record via modal form', async () => {
      inspectionService.createInspection.mockResolvedValueOnce({
        data: {
          _id: 'ins_new',
          status: 'PASSED',
          score: 88,
        },
      });

      render(<InspectionChecklist />);

      await waitFor(() => {
        expect(screen.getByText('Room 101')).toBeInTheDocument();
      });

      // Open new record modal
      const newBtn = screen.getByTitle('New Record');
      fireEvent.click(newBtn);

      expect(screen.getByText('New Inspection')).toBeInTheDocument();

      // Fill form inputs
      fireEvent.change(screen.getByLabelText(/Room No\*/i), { target: { value: '405' } });
      fireEvent.change(screen.getByLabelText(/Inspector Name\*/i), { target: { value: 'Officer Ray' } });
      fireEvent.change(screen.getByLabelText(/Score/i), { target: { value: '88' } });

      // Submit
      const saveBtn = screen.getByRole('button', { name: /^Save$/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(inspectionService.createInspection).toHaveBeenCalled();
      });

      const callPayload = inspectionService.createInspection.mock.calls[0][0];
      expect(callPayload.room_number).toBe('405');
      expect(callPayload.inspector_name).toBe('Officer Ray');
      expect(callPayload.score).toBe(88);
    });

    it('edits an existing inspection record', async () => {
      inspectionService.updateInspection.mockResolvedValueOnce({
        data: { _id: 'ins_101', score: 98 },
      });

      render(<InspectionChecklist />);

      await waitFor(() => {
        expect(screen.getByText('Room 101')).toBeInTheDocument();
      });

      // Click first edit button
      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Edit Inspection: Room 101')).toBeInTheDocument();

      // Change score
      const scoreInput = screen.getByLabelText(/Score/i);
      fireEvent.change(scoreInput, { target: { value: '98' } });

      // Submit
      const saveBtn = screen.getByRole('button', { name: /^Save$/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(inspectionService.updateInspection).toHaveBeenCalledWith(
          'ins_101',
          expect.objectContaining({ score: 98 })
        );
      });
    });

    it('deletes an inspection record via delete confirmation modal', async () => {
      inspectionService.deleteInspection.mockResolvedValueOnce({
        data: { message: 'Inspection deleted successfully' },
      });

      render(<InspectionChecklist />);

      await waitFor(() => {
        expect(screen.getByText('Room 101')).toBeInTheDocument();
      });

      // Click first delete button
      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButtons[0]);

      // Confirm modal opens
      expect(screen.getByText('Confirm Delete?')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete the inspection record for Room/i)).toBeInTheDocument();

      // Click confirm delete in modal
      const confirmDeleteBtn = screen.getAllByRole('button', { name: /^Delete$/i }).pop();
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(inspectionService.deleteInspection).toHaveBeenCalledWith('ins_101');
      });
    });
  });
});
