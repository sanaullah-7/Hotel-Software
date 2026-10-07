import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Restaurant from '../features/restaurant/pages/Restaurant';
import MenuTab from '../features/restaurant/pages/tabs/MenuTab';
import OrdersTab from '../features/restaurant/pages/tabs/OrdersTab';
import restaurantService from '../services/restaurantService';
import {
  initializeRestaurantStore,
  getMenuItems,
  getOrders,
  getCategories,
} from '../features/restaurant/pages/restaurantStore';
import {
  adaptCategoryToUI,
  adaptMenuItemToUI,
  adaptMenuItemToBackend,
  adaptOrderToUI,
  adaptOrderToBackend,
  mapBackendStatusToUI,
  mapUIStatusToBackend,
} from '../features/restaurant/adapters/restaurantAdapter';

vi.mock('../services/restaurantService', () => ({
  default: {
    getCategories: vi.fn(),
    getCategory: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    getMenuItems: vi.fn(),
    getMenuItem: vi.fn(),
    createMenuItem: vi.fn(),
    updateMenuItem: vi.fn(),
    deleteMenuItem: vi.fn(),
    getTables: vi.fn(),
    getTable: vi.fn(),
    createTable: vi.fn(),
    updateTable: vi.fn(),
    deleteTable: vi.fn(),
    getOrders: vi.fn(),
    getOrder: vi.fn(),
    createOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    deleteOrder: vi.fn(),
  },
  restaurantService: {
    getCategories: vi.fn(),
    getCategory: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    getMenuItems: vi.fn(),
    getMenuItem: vi.fn(),
    createMenuItem: vi.fn(),
    updateMenuItem: vi.fn(),
    deleteMenuItem: vi.fn(),
    getTables: vi.fn(),
    getTable: vi.fn(),
    createTable: vi.fn(),
    updateTable: vi.fn(),
    deleteTable: vi.fn(),
    getOrders: vi.fn(),
    getOrder: vi.fn(),
    createOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    deleteOrder: vi.fn(),
  },
}));

describe('Restaurant & POS Frontend Integration Suite', () => {
  const mockCategories = [
    { _id: 'cat-01', name: 'Starters', description: 'Appetizers & Starters', status: 'ACTIVE', display_order: 1 },
    { _id: 'cat-02', name: 'Main Course', description: 'Entrees', status: 'ACTIVE', display_order: 2 },
  ];

  const mockMenuItems = [
    {
      _id: 'item-01',
      name: 'Paneer Butter Masala',
      category_id: { _id: 'cat-02', name: 'Main Course' },
      price: 320,
      sku: 'SKU-PBM-01',
      description: 'Rich cottage cheese in creamy sauce',
      dietary_flags: ['VEGETARIAN'],
      is_available: true,
      status: 'ACTIVE',
      updated_at: '2026-10-07T00:00:00.000Z',
    },
    {
      _id: 'item-02',
      name: 'Crispy Veg Spring Rolls',
      category_id: 'cat-01',
      price: 180,
      sku: 'SKU-SPR-02',
      description: 'Golden rolls with sweet chili dip',
      dietary_flags: ['VEGETARIAN'],
      is_available: false,
      status: 'ACTIVE',
      updated_at: '2026-10-07T00:00:00.000Z',
    },
  ];

  const mockOrders = [
    {
      _id: 'order-01',
      order_ref: 'ORD-10001',
      customer_name: 'John Doe',
      room_number: '305',
      payment_mode: 'ROOM_FOLIO',
      status: 'PREPARING',
      total_amount: 500,
      items: [
        {
          menu_item_id: 'item-01',
          item_name_snapshot: 'Paneer Butter Masala',
          unit_price_snapshot: 320,
          quantity: 1,
          subtotal: 320,
        },
      ],
      created_at: '2026-10-07T10:00:00.000Z',
    },
    {
      _id: 'order-02',
      order_ref: 'ORD-10002',
      customer_name: 'Sarah Connor',
      room_number: '',
      payment_mode: 'CASH',
      status: 'COMPLETED',
      total_amount: 180,
      settled_at: '2026-10-07T11:00:00.000Z',
      items: [
        {
          menu_item_id: 'item-02',
          item_name_snapshot: 'Crispy Veg Spring Rolls',
          unit_price_snapshot: 180,
          quantity: 1,
          subtotal: 180,
        },
      ],
      created_at: '2026-10-07T10:30:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    restaurantService.getCategories.mockResolvedValue({ success: true, data: mockCategories });
    restaurantService.getMenuItems.mockResolvedValue({ success: true, data: mockMenuItems });
    restaurantService.getOrders.mockResolvedValue({ success: true, data: mockOrders });
  });

  describe('1. Restaurant Adapter Tests', () => {
    it('adapts backend category to UI category model', () => {
      const adapted = adaptCategoryToUI(mockCategories[0], 0);
      expect(adapted.id).toBe('cat-01');
      expect(adapted.label).toBe('Starters');
      expect(adapted.status).toBe('ACTIVE');
    });

    it('adapts backend menu item to UI menu model', () => {
      const adapted = adaptMenuItemToUI(mockMenuItems[0]);
      expect(adapted.id).toBe('item-01');
      expect(adapted.name).toBe('Paneer Butter Masala');
      expect(adapted.categoryId).toBe('cat-02');
      expect(adapted.price).toBe(320);
      expect(adapted.dietary).toBe('Veg');
      expect(adapted.availability).toBe('Available');
      expect(adapted.is_available).toBe(true);
    });

    it('adapts UI menu item form data to backend payload', () => {
      const payload = adaptMenuItemToBackend({
        name: 'Garlic Naan',
        categoryId: 'cat-01',
        price: 60,
        description: 'Tandoor baked garlic bread',
        dietary: 'Veg',
        availability: 'Available',
      });
      expect(payload.name).toBe('Garlic Naan');
      expect(payload.category_id).toBe('cat-01');
      expect(payload.price).toBe(60);
      expect(payload.dietary_flags).toContain('VEGETARIAN');
      expect(payload.is_available).toBe(true);
    });

    it('adapts backend order to UI order model with mapped status and payment', () => {
      const adapted = adaptOrderToUI(mockOrders[0]);
      expect(adapted.id).toBe('ORD-10001');
      expect(adapted.customer).toBe('John Doe');
      expect(adapted.roomNo).toBe('305');
      expect(adapted.status).toBe('In Progress');
      expect(adapted.paymentMode).toBe('Room Folio');
      expect(adapted.total).toBe(500);
      expect(adapted.items.length).toBe(1);
    });

    it('maps status transitions bidirectionally', () => {
      expect(mapBackendStatusToUI('PREPARING')).toBe('In Progress');
      expect(mapBackendStatusToUI('COMPLETED')).toBe('Completed');
      expect(mapBackendStatusToUI('CANCELLED')).toBe('Cancelled');

      expect(mapUIStatusToBackend('In Progress')).toBe('PREPARING');
      expect(mapUIStatusToBackend('Completed')).toBe('COMPLETED');
      expect(mapUIStatusToBackend('Cancelled')).toBe('CANCELLED');
    });
  });

  describe('2. Store Initialization & Backend Sync', () => {
    it('initializes store and populates categories, items, and orders from service', async () => {
      await initializeRestaurantStore(true);

      expect(restaurantService.getCategories).toHaveBeenCalled();
      expect(restaurantService.getMenuItems).toHaveBeenCalled();
      expect(restaurantService.getOrders).toHaveBeenCalled();

      const items = getMenuItems();
      expect(items.length).toBe(2);
      expect(items[0].name).toBe('Paneer Butter Masala');

      const orders = getOrders();
      expect(orders.length).toBe(2);
      expect(orders[0].customer).toBe('John Doe');

      const cats = getCategories();
      expect(cats.some(c => c.label === 'Starters')).toBe(true);
    });
  });

  describe('3. MenuTab UI Integration', () => {
    it('renders live menu items and category filters', async () => {
      await initializeRestaurantStore(true);

      render(
        <MemoryRouter>
          <MenuTab />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Paneer Butter Masala')).toBeInTheDocument();
        expect(screen.getByText('Crispy Veg Spring Rolls')).toBeInTheDocument();
      });

      // Check price rendering
      expect(screen.getByText('PKR 320')).toBeInTheDocument();
      expect(screen.getByText('PKR 180')).toBeInTheDocument();
    });

    it('filters menu items via search input', async () => {
      await initializeRestaurantStore(true);

      render(
        <MemoryRouter>
          <MenuTab />
        </MemoryRouter>
      );

      const searchInput = screen.getByPlaceholderText('Search items...');
      fireEvent.change(searchInput, { target: { value: 'Paneer' } });

      await waitFor(() => {
        expect(screen.getByText('Paneer Butter Masala')).toBeInTheDocument();
        expect(screen.queryByText('Crispy Veg Spring Rolls')).not.toBeInTheDocument();
      });
    });
  });

  describe('4. OrdersTab UI Integration', () => {
    it('renders live orders with mapped customer name and room number', async () => {
      await initializeRestaurantStore(true);

      render(
        <MemoryRouter>
          <OrdersTab />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      });
    });

    it('updates order status via service when action is triggered', async () => {
      await initializeRestaurantStore(true);
      restaurantService.updateOrderStatus.mockResolvedValue({
        success: true,
        data: { ...mockOrders[0], status: 'COMPLETED' },
      });

      render(
        <MemoryRouter>
          <OrdersTab />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('5. Restaurant Main Navigation Badge Integration', () => {
    it('initializes store and calculates in-progress orders badge', async () => {
      await initializeRestaurantStore(true);

      render(
        <MemoryRouter initialEntries={['/restaurant/menu']}>
          <Restaurant />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Paneer Butter Masala')).toBeInTheDocument();
      });
    });
  });

  describe('6. Store Mutation Methods Integration', () => {
    it('addMenuItem calls service and updates store items', async () => {
      await initializeRestaurantStore(true);
      const createdItem = {
        _id: 'item-new',
        name: 'Veg Hakka Noodles',
        category_id: 'cat-01',
        price: 220,
        dietary_flags: ['VEGETARIAN'],
        is_available: true,
        status: 'ACTIVE',
      };
      restaurantService.createMenuItem.mockResolvedValue({ success: true, data: createdItem });

      const { addMenuItem } = await import('../features/restaurant/pages/restaurantStore');
      await addMenuItem({
        name: 'Veg Hakka Noodles',
        categoryId: 'cat-01',
        price: 220,
        dietary: 'Veg',
        availability: 'Available',
      });

      expect(restaurantService.createMenuItem).toHaveBeenCalled();
      const items = getMenuItems();
      expect(items.some(i => i.name === 'Veg Hakka Noodles')).toBe(true);
    });

    it('toggleMenuItemAvailability calls updateMenuItem and flips state', async () => {
      await initializeRestaurantStore(true);
      restaurantService.updateMenuItem.mockResolvedValue({
        success: true,
        data: { ...mockMenuItems[0], is_available: false },
      });

      const { toggleMenuItemAvailability } = await import('../features/restaurant/pages/restaurantStore');
      await toggleMenuItemAvailability('item-01');

      expect(restaurantService.updateMenuItem).toHaveBeenCalledWith('item-01', { is_available: false });
    });

    it('deleteMenuItem calls service and removes from store', async () => {
      await initializeRestaurantStore(true);
      restaurantService.deleteMenuItem.mockResolvedValue({ success: true });

      const { deleteMenuItem } = await import('../features/restaurant/pages/restaurantStore');
      await deleteMenuItem('item-01');

      expect(restaurantService.deleteMenuItem).toHaveBeenCalledWith('item-01');
      const items = getMenuItems();
      expect(items.some(i => i.id === 'item-01')).toBe(false);
    });

    it('placeOrder calls createOrder with adapted backend payload', async () => {
      await initializeRestaurantStore(true);
      const newOrder = {
        _id: 'order-03',
        order_ref: 'ORD-10003',
        customer_name: 'Diner Dave',
        room_number: '101',
        payment_mode: 'ROOM_FOLIO',
        status: 'PENDING',
        total_amount: 320,
        items: [
          {
            menu_item_id: 'item-01',
            item_name_snapshot: 'Paneer Butter Masala',
            unit_price_snapshot: 320,
            quantity: 1,
            subtotal: 320,
          },
        ],
      };
      restaurantService.createOrder.mockResolvedValue({ success: true, data: newOrder });

      const { placeOrder } = await import('../features/restaurant/pages/restaurantStore');
      await placeOrder({
        customer: 'Diner Dave',
        roomNo: '101',
        paymentMode: 'Room Folio',
        items: [{ itemId: 'item-01', name: 'Paneer Butter Masala', price: 320, qty: 1 }],
      });

      expect(restaurantService.createOrder).toHaveBeenCalledWith(expect.objectContaining({
        payment_mode: 'ROOM_FOLIO',
        customer_name: 'Diner Dave',
        room_number: '101',
      }));

      const orders = getOrders();
      expect(orders.some(o => o.customer === 'Diner Dave')).toBe(true);
    });

    it('deleteOrder on active order cancels via updateOrderStatus', async () => {
      await initializeRestaurantStore(true);
      restaurantService.updateOrderStatus.mockResolvedValue({
        success: true,
        data: { ...mockOrders[0], status: 'CANCELLED' },
      });

      const { deleteOrder } = await import('../features/restaurant/pages/restaurantStore');
      await deleteOrder('ORD-10001');

      expect(restaurantService.updateOrderStatus).toHaveBeenCalledWith('order-01', {
        status: 'CANCELLED',
        notes: 'Cancelled by staff',
      });
    });
  });
});
