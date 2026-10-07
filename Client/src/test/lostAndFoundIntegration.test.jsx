import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LostAndFound from '../features/housekeeping/pages/LostAndFound';
import lostAndFoundService from '../services/lostAndFoundService';
import opsService from '../services/opsService';
import {
  toFrontendItem,
  toFrontendItemList,
  toBackendPayload,
  mapStatusToFrontend,
  mapStatusToBackend,
} from '../features/housekeeping/adapters/lostAndFoundAdapter';

vi.mock('../services/lostAndFoundService', () => ({
  default: {
    getItems: vi.fn(),
    getItemById: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn()
  }
}));

vi.mock('../services/opsService', () => ({
  default: {
    getEmployees: vi.fn()
  }
}));

describe('Lost and Found Backend Integration & Adapter Tests (Step 4)', () => {
  const mockEmployees = [
    { _id: 'emp_101', employee_ref: 'EMP-101', first_name: 'Sarah', last_name: 'Connor' },
    { _id: 'emp_102', employee_ref: 'EMP-102', first_name: 'John', last_name: 'Doe' }
  ];

  const mockBackendItems = [
    {
      _id: 'lf_item_1',
      reference_number: 'LF-100001',
      item_type: 'Electronics',
      item_name: 'MacBook Air Charger',
      description: 'White MagSafe 3 charger',
      found_location: 'Room 501',
      found_by: {
        _id: 'emp_101',
        first_name: 'Sarah',
        last_name: 'Connor',
        employee_ref: 'EMP-101'
      },
      found_date: '2026-02-10T09:00:00.000Z',
      status: 'REPORTED',
      claimed_by: null,
      claimed_date: null
    },
    {
      _id: 'lf_item_2',
      reference_number: 'LF-100002',
      item_type: 'Accessories',
      item_name: 'Gold Watch',
      description: 'Rolex silver and gold wristwatch',
      found_location: 'Lobby Sofa',
      found_by: null,
      finder_name: 'Front Desk Staff',
      found_date: '2026-02-12T14:30:00.000Z',
      status: 'CLAIMED',
      claimed_by: 'Mr. James Bond',
      claimed_date: '2026-02-13T10:00:00.000Z'
    },
    {
      _id: 'lf_item_3',
      reference_number: 'LF-100003',
      item_type: 'Perishable',
      item_name: 'Half-full Coffee Mug',
      description: 'Discarded after 48h',
      found_location: 'Pool Lounge',
      found_by: null,
      finder_name: 'Pool Attendant',
      found_date: '2026-02-05T12:00:00.000Z',
      status: 'DISCARDED',
      claimed_by: null,
      claimed_date: null
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    lostAndFoundService.getItems.mockResolvedValue({
      data: { items: mockBackendItems }
    });
    opsService.getEmployees.mockResolvedValue({
      data: mockEmployees
    });
  });

  describe('Adapter Unit Tests', () => {
    it('toFrontendItem correctly maps backend document to frontend contract', () => {
      const item = toFrontendItem(mockBackendItems[0]);

      expect(item.id).toBe('lf_item_1');
      expect(item.reference).toBe('LF-100001');
      expect(item.itemName).toBe('MacBook Air Charger');
      expect(item.location).toBe('Room 501');
      expect(item.finderName).toBe('Sarah Connor');
      expect(item.status).toBe('Found');
      expect(item.backendStatus).toBe('REPORTED');
      expect(item.foundDate).toBe('2026-02-10');
      expect(item.description).toBe('White MagSafe 3 charger');
    });

    it('toFrontendItem correctly maps claimed item with claimant details', () => {
      const item = toFrontendItem(mockBackendItems[1]);

      expect(item.id).toBe('lf_item_2');
      expect(item.status).toBe('Claimed');
      expect(item.finderName).toBe('Front Desk Staff');
      expect(item.claimant).toBe('Mr. James Bond');
      expect(item.claimedDate).toBe('2026-02-13');
    });

    it('toBackendPayload correctly maps frontend form data to canonical backend payload', () => {
      const uiForm = {
        itemName: 'Diamond Earring',
        location: 'Spa Suite 3',
        status: 'Found',
        foundDate: '2026-03-01',
        foundBy: 'emp_101',
        finderName: 'Sarah Connor',
        description: 'Single diamond earring found on rug'
      };

      const payload = toBackendPayload(uiForm);

      expect(payload.item_name).toBe('Diamond Earring');
      expect(payload.item_type).toBe('Diamond Earring');
      expect(payload.found_location).toBe('Spa Suite 3');
      expect(payload.status).toBe('REPORTED');
      expect(payload.found_by).toBe('emp_101');
      expect(payload.description).toBe('Single diamond earring found on rug');
      expect(new Date(payload.found_date).toISOString()).toContain('2026-03-01');
    });

    it('status mappings map correctly between UI and backend enums', () => {
      expect(mapStatusToFrontend('REPORTED')).toBe('Found');
      expect(mapStatusToFrontend('CLAIMED')).toBe('Claimed');
      expect(mapStatusToFrontend('DISCARDED')).toBe('Disposed');
      expect(mapStatusToFrontend('DONATED')).toBe('Disposed');

      expect(mapStatusToBackend('Found')).toBe('REPORTED');
      expect(mapStatusToBackend('Claimed')).toBe('CLAIMED');
      expect(mapStatusToBackend('Returned')).toBe('CLAIMED');
      expect(mapStatusToBackend('Disposed')).toBe('DISCARDED');
      expect(mapStatusToBackend('Donated')).toBe('DONATED');
    });
  });

  describe('LostAndFound UI Component Integration', () => {
    it('loads and renders backend items on mount (hardcoded 12 items are NOT displayed)', async () => {
      render(<LostAndFound />);

      await waitFor(() => {
        expect(lostAndFoundService.getItems).toHaveBeenCalled();
        expect(opsService.getEmployees).toHaveBeenCalled();
      });

      // Backend items are rendered
      expect(await screen.findByText('MacBook Air Charger')).toBeTruthy();
      expect(screen.getByText('Gold Watch')).toBeTruthy();
      expect(screen.getByText('Half-full Coffee Mug')).toBeTruthy();

      // Old hardcoded items like 'iPhone 13 Charger' are NOT in DOM
      expect(screen.queryByText('iPhone 13 Charger')).toBeNull();
      expect(screen.queryByText('Blue Sunglasses')).toBeNull();

      // Check summary card stats (3 total, 1 unclaimed, 1 claimed, 1 disposed)
      expect(screen.getByText('3')).toBeTruthy(); // Total Items
    });

    it('creates a new Lost and Found item via lostAndFoundService.createItem', async () => {
      lostAndFoundService.createItem.mockResolvedValue({
        data: {
          _id: 'lf_new_id',
          reference_number: 'LF-202699',
          item_type: 'Valuables',
          item_name: 'Leather Handbag',
          description: 'Gucci black leather handbag',
          found_location: 'Restaurant Table 4',
          found_by: null,
          finder_name: 'Waiter Bilal',
          found_date: '2026-02-15T18:00:00.000Z',
          status: 'REPORTED'
        }
      });

      render(<LostAndFound />);

      await waitFor(() => {
        expect(screen.getByText('MacBook Air Charger')).toBeTruthy();
      });

      // Open new record modal
      const newBtn = screen.getByTitle('New Record');
      fireEvent.click(newBtn);

      expect(screen.getByText('New Lost & Found Item')).toBeTruthy();

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Item Name\*/i), {
        target: { value: 'Leather Handbag' }
      });
      fireEvent.change(screen.getByLabelText(/Location Found\*/i), {
        target: { value: 'Restaurant Table 4' }
      });
      fireEvent.change(screen.getByLabelText(/Description & Details/i), {
        target: { value: 'Gucci black leather handbag' }
      });

      // Submit form
      const saveBtn = screen.getByRole('button', { name: /^Save$/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(lostAndFoundService.createItem).toHaveBeenCalledWith(
          expect.objectContaining({
            item_name: 'Leather Handbag',
            found_location: 'Restaurant Table 4',
            description: 'Gucci black leather handbag',
            status: 'REPORTED'
          })
        );
      });
    });

    it('edits an existing Lost & Found item via lostAndFoundService.updateItem', async () => {
      lostAndFoundService.updateItem.mockResolvedValue({
        data: {
          _id: 'lf_item_1',
          reference_number: 'LF-100001',
          item_type: 'Electronics',
          item_name: 'MacBook Air Charger (Updated)',
          description: 'White 30W charger with USB-C cable',
          found_location: 'Room 501',
          status: 'REPORTED'
        }
      });

      render(<LostAndFound />);

      await waitFor(() => {
        expect(screen.getByText('MacBook Air Charger')).toBeTruthy();
      });

      // Click Edit on the first item
      const editButtons = screen.getAllByRole('button', { name: /^Edit$/i });
      fireEvent.click(editButtons[0]);

      expect(screen.getByText(/Edit Item: MacBook Air Charger/i)).toBeTruthy();

      // Change description
      const descInput = screen.getByLabelText(/Description & Details/i);
      fireEvent.change(descInput, { target: { value: 'White 30W charger with USB-C cable' } });

      // Save
      const saveBtn = screen.getByRole('button', { name: /^Save$/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(lostAndFoundService.updateItem).toHaveBeenCalledWith(
          'lf_item_1',
          expect.objectContaining({
            description: 'White 30W charger with USB-C cable'
          })
        );
      });
    });

    it('deletes an item via lostAndFoundService.deleteItem', async () => {
      lostAndFoundService.deleteItem.mockResolvedValue({
        data: { message: 'Lost & Found item deleted successfully' }
      });

      render(<LostAndFound />);

      await waitFor(() => {
        expect(screen.getByText('MacBook Air Charger')).toBeTruthy();
      });

      // Click Delete on the first item
      const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/i });
      fireEvent.click(deleteButtons[0]);

      // Confirm modal opens
      expect(screen.getByText('Confirm Delete')).toBeTruthy();

      // Click the Delete confirm button inside modal
      const confirmDeleteBtn = screen.getAllByRole('button', { name: /^Delete$/i }).find(
        btn => btn.className.includes('bg-rose-600')
      );
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(lostAndFoundService.deleteItem).toHaveBeenCalledWith('lf_item_1');
      });
    });

    it('surfaces backend load error with retry trigger', async () => {
      lostAndFoundService.getItems.mockRejectedValueOnce(new Error('Network error loading lost and found'));

      render(<LostAndFound />);

      await waitFor(() => {
        expect(screen.getByText(/Network error loading lost and found/i)).toBeTruthy();
      });

      // Clicking Retry calls getItems again
      const retryBtn = screen.getByText('Retry');
      lostAndFoundService.getItems.mockResolvedValueOnce({
        data: { items: mockBackendItems }
      });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('MacBook Air Charger')).toBeTruthy();
      });
    });
  });
});
