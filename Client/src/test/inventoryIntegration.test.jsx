import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AllInventory from '../features/inventory/pages/AllInventory';
import MissingInventory from '../features/inventory/pages/MissingInventory';
import inventoryService from '../services/inventoryService';
import roomService from '../services/roomService';

vi.mock('../services/inventoryService', () => ({
  default: {
    getInventoryItems: vi.fn(),
    getInventoryItemById: vi.fn(),
    createInventoryItem: vi.fn(),
    updateInventoryItem: vi.fn(),
    adjustStock: vi.fn(),
    deactivateInventoryItem: vi.fn(),
    getMovements: vi.fn(),
    getIncidents: vi.fn(),
    createIncident: vi.fn(),
    updateIncident: vi.fn(),
  },
  inventoryService: {
    getInventoryItems: vi.fn(),
    getInventoryItemById: vi.fn(),
    createInventoryItem: vi.fn(),
    updateInventoryItem: vi.fn(),
    adjustStock: vi.fn(),
    deactivateInventoryItem: vi.fn(),
    getMovements: vi.fn(),
    getIncidents: vi.fn(),
    createIncident: vi.fn(),
    updateIncident: vi.fn(),
  }
}));

vi.mock('../services/roomService', () => ({
  default: {
    getRooms: vi.fn()
  }
}));

describe('Inventory Module Step 3: Frontend Migration Integration', () => {
  const mockBackendItems = [
    {
      _id: '670411a0e7a8ceefb0080001',
      sku: 'SKU-TOWEL-01',
      name: 'Luxury Bath Towel',
      category: 'Linens',
      description: 'Egyptian cotton white bath towel',
      quantity: 45,
      unit: 'PIECES',
      reorder_level: 15,
      unit_cost: 18.50,
      location_type: 'STORAGE',
      location_name: 'Central Linen Room',
      condition: 'GOOD',
      supplier: 'LuxLinens Co',
      status: 'ACTIVE',
      is_active: true,
      last_restocked_at: '2026-03-01T10:00:00.000Z',
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z'
    },
    {
      _id: '670411a0e7a8ceefb0080002',
      sku: 'SKU-TV-101',
      name: 'Smart TV 55 inch',
      category: 'Electronics',
      description: '4K OLED Smart TV',
      quantity: 1,
      unit: 'PIECES',
      reorder_level: 1,
      unit_cost: 450.00,
      location_type: 'ROOM',
      room_id: '670411a0e7a8ceefb0080101',
      room_number: '101',
      location_name: 'Room 101 Wall Mount',
      condition: 'GOOD',
      supplier: 'Sony Hospitality',
      status: 'ACTIVE',
      is_active: true,
      last_restocked_at: '2026-02-15T10:00:00.000Z',
      createdAt: '2026-02-15T10:00:00.000Z',
      updatedAt: '2026-02-15T10:00:00.000Z'
    },
    {
      _id: '670411a0e7a8ceefb0080003',
      sku: 'SKU-KETTLE-102',
      name: 'Electric Kettle',
      category: 'Amenities',
      description: 'Stainless steel 1.5L kettle',
      quantity: 0,
      unit: 'PIECES',
      reorder_level: 5,
      unit_cost: 25.00,
      location_type: 'ROOM',
      room_id: '670411a0e7a8ceefb0080102',
      room_number: '102',
      location_name: 'Room 102 Desk',
      condition: 'FAIR',
      supplier: 'KitchenPro',
      status: 'OUT_OF_STOCK',
      is_active: true,
      last_restocked_at: '2026-01-10T10:00:00.000Z',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z'
    }
  ];

  const mockBackendIncidents = [
    {
      _id: '670411a0e7a8ceefb0080050',
      incident_ref: 'INC-2026-0001',
      item_id: {
        _id: '670411a0e7a8ceefb0080002',
        name: 'Smart TV 55 inch',
        sku: 'SKU-TV-101',
        category: 'Electronics'
      },
      room_id: {
        _id: '670411a0e7a8ceefb0080101',
        room_number: '101'
      },
      room_number: '101',
      quantity_lost: 1,
      unit_loss_value: 450.00,
      total_loss_value: 450.00,
      status: 'REPORTED',
      reported_by: {
        _id: '670411a0e7a8ceefb0080099',
        name: 'Maria Housekeeper'
      },
      reported_by_name: 'Maria Housekeeper',
      assigned_to: {
        _id: '670411a0e7a8ceefb0080098',
        name: 'John Supervisor'
      },
      assigned_to_name: 'John Supervisor',
      guest_id: null,
      guest_name: 'Walk-in Guest',
      reason: 'MISSING',
      notes: 'TV missing after guest checkout',
      investigation_notes: '',
      resolution_outcome: null,
      resolution_notes: '',
      resolved_at: null,
      timeline: [
        {
          action: 'INCIDENT_REPORTED',
          note: 'TV missing after guest checkout',
          performed_at: '2026-03-05T12:00:00.000Z',
          performed_by_name: 'Maria Housekeeper'
        }
      ],
      createdAt: '2026-03-05T12:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    inventoryService.getInventoryItems.mockResolvedValue({
      data: mockBackendItems,
      pagination: { total: 3, page: 1, limit: 100 }
    });
    inventoryService.getIncidents.mockResolvedValue({
      data: mockBackendIncidents,
      pagination: { total: 1, page: 1, limit: 100 }
    });
    roomService.getRooms.mockResolvedValue({
      rooms: [
        { id: '670411a0e7a8ceefb0080101', roomNumber: '101', roomType: 'Deluxe' },
        { id: '670411a0e7a8ceefb0080102', roomNumber: '102', roomType: 'Standard' }
      ]
    });
  });

  describe('1. AllInventory (Stock Authority) Page', () => {
    it('fetches inventory items from backend inventoryService on mount', async () => {
      render(
        <MemoryRouter>
          <AllInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(inventoryService.getInventoryItems).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText('Luxury Bath Towel')).toBeInTheDocument();
      expect(screen.getByText('Smart TV 55 inch')).toBeInTheDocument();
      expect(screen.getByText('Electric Kettle')).toBeInTheDocument();
      expect(screen.getByText(/SKU-TOWEL-01/i)).toBeInTheDocument();
    });

    it('renders error state and retries successfully upon user action', async () => {
      inventoryService.getInventoryItems.mockRejectedValueOnce(new Error('Network Connection Error'));

      render(
        <MemoryRouter>
          <AllInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Network Connection Error')).toBeInTheDocument();
      });

      inventoryService.getInventoryItems.mockResolvedValueOnce({
        data: mockBackendItems,
        pagination: { total: 3, page: 1, limit: 100 }
      });

      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Luxury Bath Towel')).toBeInTheDocument();
      });
      expect(inventoryService.getInventoryItems).toHaveBeenCalledTimes(2);
    });

    it('filters inventory items by search term', async () => {
      render(
        <MemoryRouter>
          <AllInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Luxury Bath Towel')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search item, SKU, room, category.../i);
      fireEvent.change(searchInput, { target: { value: 'Towel' } });

      expect(screen.getByText('Luxury Bath Towel')).toBeInTheDocument();
      expect(screen.queryByText('Smart TV 55 inch')).not.toBeInTheDocument();
    });
  });

  describe('2. Add Stock Item Modal Integration', () => {
    it('creates a new inventory item via inventoryService.createInventoryItem', async () => {
      const createdItem = {
        _id: '670411a0e7a8ceefb0080004',
        sku: 'SKU-PILLOW-01',
        name: 'Memory Foam Pillow',
        category: 'Linens',
        description: 'Ergonomic luxury pillow',
        quantity: 20,
        unit: 'PIECES',
        reorder_level: 5,
        unit_cost: 35.00,
        location_type: 'STORAGE',
        location_name: 'Central Linen Room',
        condition: 'NEW',
        supplier: 'LuxLinens Co',
        status: 'ACTIVE',
        is_active: true,
        createdAt: '2026-03-06T10:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z'
      };
      inventoryService.createInventoryItem.mockResolvedValueOnce({
        data: createdItem
      });

      render(
        <MemoryRouter>
          <AllInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Luxury Bath Towel')).toBeInTheDocument();
      });

      const addBtn = screen.getByTitle('Add Stock');
      fireEvent.click(addBtn);

      expect(screen.getByText('Add Hotel Stock Item')).toBeInTheDocument();

      const nameInput = screen.getByPlaceholderText(/e\.g\. Bath Towel/i);
      fireEvent.change(nameInput, { target: { value: 'Memory Foam Pillow' } });

      const saveBtn = screen.getByRole('button', { name: /Save Stock Item/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(inventoryService.createInventoryItem).toHaveBeenCalled();
      });

      const payload = inventoryService.createInventoryItem.mock.calls[0][0];
      expect(payload.name).toBe('Memory Foam Pillow');
    });
  });

  describe('3. Item Detail Modal (Metadata PATCH vs Stock Adjust)', () => {
    it('executes metadata PATCH and separate stock adjustment when quantity changes', async () => {
      inventoryService.updateInventoryItem.mockResolvedValueOnce({
        data: { ...mockBackendItems[0], unit_cost: 20 }
      });
      inventoryService.adjustStock.mockResolvedValueOnce({
        data: { ...mockBackendItems[0], quantity: 50 }
      });

      render(
        <MemoryRouter>
          <AllInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Luxury Bath Towel')).toBeInTheDocument();
      });

      // Click on row to open ItemDetailModal
      const rowItem = screen.getByText('Luxury Bath Towel');
      fireEvent.click(rowItem);

      // Click "Edit Item" button
      const editBtn = await screen.findByRole('button', { name: /Edit Item/i });
      fireEvent.click(editBtn);

      // Change unit price and quantity
      const priceInput = screen.getByDisplayValue('18.5');
      fireEvent.change(priceInput, { target: { value: '20' } });

      const qtyInput = screen.getByDisplayValue('45');
      fireEvent.change(qtyInput, { target: { value: '50' } });

      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(inventoryService.updateInventoryItem).toHaveBeenCalledWith(
          '670411a0e7a8ceefb0080001',
          expect.objectContaining({ unit_cost: 20 })
        );
        expect(inventoryService.adjustStock).toHaveBeenCalledWith(
          '670411a0e7a8ceefb0080001',
          expect.objectContaining({
            adjustment_type: 'SET',
            quantity: 50
          })
        );
      });
    });

    it('deactivates an inventory item via inventoryService.deactivateInventoryItem', async () => {
      inventoryService.deactivateInventoryItem.mockResolvedValueOnce({
        data: { success: true }
      });

      render(
        <MemoryRouter>
          <AllInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Luxury Bath Towel')).toBeInTheDocument();
      });

      // Click on row to open ItemDetailModal
      const rowItem = screen.getByText('Luxury Bath Towel');
      fireEvent.click(rowItem);

      const deleteBtn = await screen.findByRole('button', { name: /Deactivate Record/i });
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(inventoryService.deactivateInventoryItem).toHaveBeenCalledWith('670411a0e7a8ceefb0080001');
      });
    });
  });

  describe('4. Missing Inventory / Incidents Integration', () => {
    it('fetches incidents from backend inventoryService on MissingInventory mount', async () => {
      render(
        <MemoryRouter>
          <MissingInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(inventoryService.getIncidents).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText('INC-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('Smart TV 55 inch')).toBeInTheDocument();
      expect(screen.getByText('$450.00')).toBeInTheDocument();
    });

    it('progresses incident to Under Investigation via inventoryService.updateIncident', async () => {
      inventoryService.updateIncident.mockResolvedValueOnce({
        data: {
          ...mockBackendIncidents[0],
          status: 'INVESTIGATING'
        }
      });

      render(
        <MemoryRouter>
          <MissingInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('INC-2026-0001')).toBeInTheDocument();
      });

      const incidentRow = screen.getByText('Smart TV 55 inch');
      fireEvent.click(incidentRow);

      await waitFor(() => {
        expect(screen.getByText('Update Incident Status')).toBeInTheDocument();
      });

      const investBtn = screen.getByRole('button', { name: /Start Investigation/i });
      fireEvent.click(investBtn);

      await waitFor(() => {
        expect(inventoryService.updateIncident).toHaveBeenCalledWith(
          '670411a0e7a8ceefb0080050',
          expect.objectContaining({
            status: 'INVESTIGATING'
          })
        );
      });
    });

    it('resolves incident as Written Off via backend inventoryService.updateIncident', async () => {
      inventoryService.updateIncident.mockResolvedValueOnce({
        data: {
          ...mockBackendIncidents[0],
          status: 'RESOLVED',
          resolution_outcome: 'WRITTEN_OFF',
          resolution_notes: 'Unrecoverable physical damage'
        }
      });

      render(
        <MemoryRouter>
          <MissingInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('INC-2026-0001')).toBeInTheDocument();
      });

      const incidentRow = screen.getByText('Smart TV 55 inch');
      fireEvent.click(incidentRow);

      await waitFor(() => {
        expect(screen.getByText('Update Incident Status')).toBeInTheDocument();
      });

      const notesInput = screen.getByPlaceholderText(/Enter details on recovery, replacement, or write-off reason/i);
      fireEvent.change(notesInput, { target: { value: 'Unrecoverable physical damage' } });

      const writeOffBtn = screen.getByRole('button', { name: /Mark as Written Off/i });
      fireEvent.click(writeOffBtn);

      await waitFor(() => {
        expect(inventoryService.updateIncident).toHaveBeenCalledWith(
          '670411a0e7a8ceefb0080050',
          expect.objectContaining({
            status: 'RESOLVED',
            resolution_type: 'WRITTEN_OFF',
            resolution_notes: 'Unrecoverable physical damage'
          })
        );
      });
    });
  });
});
