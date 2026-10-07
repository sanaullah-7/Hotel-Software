import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import CarParking from '../features/car-parking/pages/CarParking';
import AddEditCarModal from '../features/car-parking/components/AddEditCarModal';
import CheckoutCarModal from '../features/car-parking/components/CheckoutCarModal';
import ManageSpacesModal from '../features/car-parking/components/ManageSpacesModal';
import { parkingService } from '../services/parkingService';

// Mock parkingService
vi.mock('../services/parkingService', () => ({
  parkingService: {
    getSpaces: vi.fn(),
    createSpace: vi.fn(),
    updateSpaceStatus: vi.fn(),
    deleteSpace: vi.fn(),
    getMetrics: vi.fn(),
    getRecords: vi.fn(),
    getRecordById: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    checkoutRecord: vi.fn(),
    deleteRecord: vi.fn(),
  },
  default: {
    getSpaces: vi.fn(),
    createSpace: vi.fn(),
    updateSpaceStatus: vi.fn(),
    deleteSpace: vi.fn(),
    getMetrics: vi.fn(),
    getRecords: vi.fn(),
    getRecordById: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    checkoutRecord: vi.fn(),
    deleteRecord: vi.fn(),
  },
}));

const mockSpaces = [
  { _id: 'sp-1', space_number: 'P-01', status: 'AVAILABLE', location: 'Main Lot' },
  { _id: 'sp-2', space_number: 'P-02', status: 'OCCUPIED', location: 'Main Lot' },
  { _id: 'sp-3', space_number: 'P-03', status: 'BLOCKED', location: 'Main Lot' },
];

const mockRecords = [
  {
    _id: 'rec-1',
    record_ref: 'PRK-20261007-001',
    vehicle_plate: 'ABC-123',
    guest_name: 'Zaid Khan',
    room_number: '101',
    vehicle_type: 'Sedan',
    space_id: { _id: 'sp-2', space_number: 'P-02', status: 'OCCUPIED' },
    entry_time: new Date().toISOString(),
    exit_time: null,
    charge_type: 'Daily',
    charge_amount: 500,
    payment_status: 'Paid',
    status: 'PARKED',
  },
  {
    _id: 'rec-2',
    record_ref: 'PRK-20261007-002',
    vehicle_plate: 'XYZ-789',
    guest_name: 'Sara Ali',
    room_number: '202',
    vehicle_type: 'SUV',
    space_id: { _id: 'sp-1', space_number: 'P-01', status: 'AVAILABLE' },
    entry_time: new Date(Date.now() - 3600000).toISOString(),
    exit_time: new Date().toISOString(),
    charge_type: 'Hourly',
    charge_amount: 200,
    payment_status: 'Pending',
    status: 'EXITED',
  },
];

describe('Car Parking Frontend-to-Backend Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    parkingService.getSpaces.mockResolvedValue(mockSpaces);
    parkingService.getRecords.mockResolvedValue(mockRecords);
  });

  describe('1. CarParking Main Page Integration', () => {
    it('fetches live spaces and records from parkingService and renders table', async () => {
      render(
        <BrowserRouter>
          <CarParking />
        </BrowserRouter>
      );

      // Loading state
      expect(screen.getByText(/loading parking records/i)).toBeInTheDocument();

      // Wait for data load
      await waitFor(() => {
        expect(parkingService.getSpaces).toHaveBeenCalled();
        expect(parkingService.getRecords).toHaveBeenCalled();
      });

      // Verify KPI metrics
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Total Spaces
        expect(screen.getByText('1')).toBeInTheDocument(); // Parked Cars
        expect(screen.getByText('2')).toBeInTheDocument(); // Available Spaces
      });

      // Table row values
      expect(screen.getByText('ABC-123')).toBeInTheDocument();
      expect(screen.getByText('Zaid Khan')).toBeInTheDocument();
      expect(screen.getByText('P-02')).toBeInTheDocument();
    });

    it('surfaces backend errors with a functional retry button', async () => {
      parkingService.getSpaces.mockRejectedValueOnce(new Error('Database unavailable'));

      render(
        <BrowserRouter>
          <CarParking />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/database unavailable/i)).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /retry/i });
      expect(retryBtn).toBeInTheDocument();

      // Mock recovery
      parkingService.getSpaces.mockResolvedValueOnce(mockSpaces);
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('ABC-123')).toBeInTheDocument();
      });
    });

    it('deletes a parking record via parkingService.deleteRecord', async () => {
      parkingService.deleteRecord.mockResolvedValueOnce({ success: true });
      window.confirm = vi.fn().mockReturnValue(true);

      render(
        <BrowserRouter>
          <CarParking />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('ABC-123')).toBeInTheDocument();
      });

      // Open menu for the record
      const actionBtns = screen.getAllByRole('button');
      const moreBtn = actionBtns.find(
        (b) => b.querySelector('svg[data-testid="MoreVertIcon"]')
      );
      expect(moreBtn).toBeTruthy();
      fireEvent.click(moreBtn);

      const deleteMenuItem = await screen.findByText('Delete Record');
      fireEvent.click(deleteMenuItem);

      await waitFor(() => {
        expect(parkingService.deleteRecord).toHaveBeenCalledWith('rec-1');
      });
    });
  });

  describe('2. AddEditCarModal Integration', () => {
    it('loads available spaces from parkingService and submits new car entry', async () => {
      parkingService.createRecord.mockResolvedValueOnce({
        _id: 'rec-3',
        vehicle_plate: 'KHI-555',
        status: 'PARKED',
      });

      const onClose = vi.fn();
      const onSuccess = vi.fn();

      render(
        <AddEditCarModal
          open={true}
          onClose={onClose}
          editRecord={null}
          onSuccess={onSuccess}
        />
      );

      await waitFor(() => {
        expect(parkingService.getSpaces).toHaveBeenCalled();
      });

      // Fill in form
      const guestInput = screen.getByPlaceholderText('Guest Name');
      const carInput = screen.getByPlaceholderText('Car Number');

      fireEvent.change(guestInput, { target: { value: 'Bilal Tariq' } });
      fireEvent.change(carInput, { target: { value: 'KHI-555' } });

      // Select space
      const selectSpace = screen.getByText('Select Space');
      fireEvent.mouseDown(selectSpace);

      const availableOption = await screen.findByText(/P-01 \(Available\)/i);
      fireEvent.click(availableOption);

      // Submit
      const submitBtn = screen.getByRole('button', { name: /add parking/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(parkingService.createRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            guest_name: 'Bilal Tariq',
            vehicle_plate: 'KHI-555',
            parking_space: 'P-01',
          })
        );
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('populates existing record and updates via parkingService.updateRecord', async () => {
      parkingService.updateRecord.mockResolvedValueOnce({
        _id: 'rec-1',
        vehicle_plate: 'ABC-123-MOD',
      });

      const onClose = vi.fn();
      const onSuccess = vi.fn();

      render(
        <AddEditCarModal
          open={true}
          onClose={onClose}
          editRecord={{
            id: 'rec-1',
            guestName: 'Zaid Khan',
            roomNumber: '101',
            carNumber: 'ABC-123',
            carType: 'Sedan',
            parkingSpace: 'P-02',
            chargeType: 'Daily',
            chargeAmount: 500,
            paymentStatus: 'Paid',
            entryDate: '2026-10-07',
            entryTime: '10:00',
          }}
          onSuccess={onSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Zaid Khan')).toBeInTheDocument();
      });

      const guestInput = screen.getByDisplayValue('Zaid Khan');
      fireEvent.change(guestInput, { target: { value: 'Zaid Khan Updated' } });

      const submitBtn = screen.getByRole('button', { name: /update record/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(parkingService.updateRecord).toHaveBeenCalledWith(
          'rec-1',
          expect.objectContaining({
            guest_name: 'Zaid Khan Updated',
            vehicle_plate: 'ABC-123',
          })
        );
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('3. CheckoutCarModal Integration', () => {
    it('calls parkingService.checkoutRecord when confirming checkout', async () => {
      parkingService.checkoutRecord.mockResolvedValueOnce({
        _id: 'rec-1',
        status: 'EXITED',
      });

      const onClose = vi.fn();
      const onSuccess = vi.fn();

      render(
        <CheckoutCarModal
          open={true}
          onClose={onClose}
          record={{
            id: 'rec-1',
            guestName: 'Zaid Khan',
            carNumber: 'ABC-123',
            parkingSpace: 'P-02',
            chargeAmount: 500,
            paymentStatus: 'Paid',
            entryTime: '10:00',
            entryDate: '2026-10-07',
          }}
          onSuccess={onSuccess}
        />
      );

      expect(screen.getByText('Zaid Khan')).toBeInTheDocument();
      expect(screen.getByText('ABC-123')).toBeInTheDocument();

      const checkoutBtn = screen.getByRole('button', { name: /check out car/i });
      fireEvent.click(checkoutBtn);

      await waitFor(() => {
        expect(parkingService.checkoutRecord).toHaveBeenCalledWith(
          'rec-1',
          expect.objectContaining({
            exitDate: expect.any(String),
            exitTime: expect.any(String),
          })
        );
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('4. ManageSpacesModal Integration', () => {
    it('loads spaces, adds a new space, and toggles block status', async () => {
      parkingService.createSpace.mockResolvedValueOnce({
        _id: 'sp-4',
        space_number: 'P-04',
        status: 'AVAILABLE',
      });
      parkingService.updateSpaceStatus.mockResolvedValueOnce({
        _id: 'sp-1',
        space_number: 'P-01',
        status: 'BLOCKED',
      });

      render(<ManageSpacesModal open={true} onClose={vi.fn()} />);

      await waitFor(() => {
        expect(parkingService.getSpaces).toHaveBeenCalled();
        expect(screen.getByText('P-01')).toBeInTheDocument();
        expect(screen.getByText('P-02')).toBeInTheDocument();
      });

      // Add new space
      const input = screen.getByPlaceholderText('e.g. P-31');
      fireEvent.change(input, { target: { value: 'P-04' } });

      const addBtn = screen.getByRole('button', { name: /\+ add space/i });
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(parkingService.createSpace).toHaveBeenCalledWith({
          space_number: 'P-04',
        });
      });

      // Block P-01
      const blockBtns = screen.getAllByTitle('Block Space');
      expect(blockBtns.length).toBeGreaterThan(0);
      fireEvent.click(blockBtns[0]);

      await waitFor(() => {
        expect(parkingService.updateSpaceStatus).toHaveBeenCalledWith(
          'sp-1',
          'BLOCKED'
        );
      });
    });
  });
});
