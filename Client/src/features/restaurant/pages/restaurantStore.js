import restaurantService from '../../../services/restaurantService';
import {
  adaptCategoryToUI,
  adaptMenuItemToUI,
  adaptMenuItemToBackend,
  adaptOrderToUI,
  adaptOrderToBackend,
  mapUIStatusToBackend,
} from '../adapters/restaurantAdapter.js';
import { addAuditLog } from '../../audit/state/auditStore.js';

// ============================================================
// Restaurant Store — Canonical Backend-Authoritative Store
// Connects UI components directly to backend Restaurant APIs
// while providing synchronous local cache and reactive subscriptions.
// ============================================================

// ─── Default Fallback Categories (if backend has not seeded yet) ───
const DEFAULT_CATEGORIES = [
  { id: 'starters',   _id: 'starters',   label: 'Starters',         name: 'Starters',         color: '#e53935', items: 0 },
  { id: 'main',       _id: 'main',       label: 'Main Course',      name: 'Main Course',      color: '#7b1fa2', items: 0 },
  { id: 'beverages',  _id: 'beverages',  label: 'Beverages',        name: 'Beverages',        color: '#1565c0', items: 0 },
  { id: 'soups',      _id: 'soups',      label: 'Soups',            name: 'Soups',            color: '#795548', items: 0 },
  { id: 'desserts',   _id: 'desserts',   label: 'Desserts',         name: 'Desserts',         color: '#283593', items: 0 },
  { id: 'pizzas',     _id: 'pizzas',     label: 'Pizzas',           name: 'Pizzas',           color: '#2e7d32', items: 0 },
  { id: 'alcohol',    _id: 'alcohol',    label: 'Alcoholic Drinks', name: 'Alcoholic Drinks', color: '#c62828', items: 0 },
  { id: 'salads',     _id: 'salads',     label: 'Salads',           name: 'Salads',           color: '#6a1b9a', items: 0 },
];

export let CATEGORIES = [...DEFAULT_CATEGORIES];

let _menuItems = [];
let _orders = [];
let _tables = [];

let _menuListeners = [];
let _ordersListeners = [];
let _categoryListeners = [];

let _isInitialized = false;
let _isLoading = false;

function notifyMenu() {
  _menuListeners.forEach(fn => {
    try { fn(); } catch (err) { console.error('Menu subscriber error:', err); }
  });
}

function notifyOrders() {
  _ordersListeners.forEach(fn => {
    try { fn(); } catch (err) { console.error('Orders subscriber error:', err); }
  });
}

function notifyCategories() {
  _categoryListeners.forEach(fn => {
    try { fn(); } catch (err) { console.error('Category subscriber error:', err); }
  });
}

/**
 * Initialize / refresh all restaurant data from the backend.
 */
export async function initializeRestaurantStore(force = false) {
  if (!force && _isLoading) return;
  if (!force && _isInitialized) return;

  _isLoading = true;
  try {
    // 1. Fetch categories
    const catRes = await restaurantService.getCategories();
    const rawCategories = Array.isArray(catRes?.data) ? catRes.data : (Array.isArray(catRes) ? catRes : []);
    if (rawCategories.length > 0) {
      CATEGORIES = rawCategories.map((c, idx) => adaptCategoryToUI(c, idx));
    } else {
      CATEGORIES = [...DEFAULT_CATEGORIES];
    }
    notifyCategories();

    // 2. Fetch menu items
    const menuRes = await restaurantService.getMenuItems({ limit: 100 });
    const rawMenuItems = Array.isArray(menuRes?.data?.items)
      ? menuRes.data.items
      : (Array.isArray(menuRes?.data) ? menuRes.data : (Array.isArray(menuRes) ? menuRes : []));
    _menuItems = rawMenuItems.map(adaptMenuItemToUI);

    // Update item counts in categories
    CATEGORIES = CATEGORIES.map(cat => ({
      ...cat,
      items: _menuItems.filter(item => item.categoryId === cat.id || item.categoryId === cat._id).length,
    }));
    notifyMenu();
    notifyCategories();

    // 3. Fetch orders
    const ordersRes = await restaurantService.getOrders({ limit: 100 });
    const rawOrders = Array.isArray(ordersRes?.data?.items)
      ? ordersRes.data.items
      : (Array.isArray(ordersRes?.data) ? ordersRes.data : (Array.isArray(ordersRes) ? ordersRes : []));
    _orders = rawOrders.map(adaptOrderToUI);
    notifyOrders();

    _isInitialized = true;
    window.dispatchEvent(new Event('restaurant_update'));
  } catch (err) {
    console.warn('RestaurantStore fetch error (using cache/defaults):', err.message);
  } finally {
    _isLoading = false;
  }
}

// Auto-initialize if token exists
if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
  initializeRestaurantStore();
}

// ─── Categories Public API ───────────────────────────────────

export function getCategories() {
  return [...CATEGORIES];
}

export function subscribeCategories(fn) {
  _categoryListeners.push(fn);
  return () => { _categoryListeners = _categoryListeners.filter(l => l !== fn); };
}

export async function addCategory(categoryData) {
  try {
    const res = await restaurantService.createCategory(categoryData);
    const newCat = adaptCategoryToUI(res?.data || res);
    CATEGORIES = [...CATEGORIES, newCat];
    notifyCategories();
    return newCat;
  } catch (err) {
    console.error('Failed to create category on backend:', err);
    throw err;
  }
}

export async function deleteCategory(id) {
  try {
    await restaurantService.deleteCategory(id);
    CATEGORIES = CATEGORIES.filter(c => c.id !== id && c._id !== id);
    notifyCategories();
  } catch (err) {
    console.error('Failed to delete category on backend:', err);
    throw err;
  }
}

// ─── Menu Items Public API ───────────────────────────────────

export function getMenuItems() {
  return [..._menuItems];
}

export function subscribeMenuItems(fn) {
  _menuListeners.push(fn);
  return () => { _menuListeners = _menuListeners.filter(l => l !== fn); };
}

export async function addMenuItem(data) {
  try {
    let finalCatId = data.categoryId;
    const matchedCategory = CATEGORIES.find(c => c.id === data.categoryId || c._id === data.categoryId);
    if (matchedCategory && matchedCategory._id) {
      finalCatId = matchedCategory._id;
    }

    const payload = adaptMenuItemToBackend({ ...data, categoryId: finalCatId });
    const res = await restaurantService.createMenuItem(payload);
    const newItem = adaptMenuItemToUI(res?.data || res);

    _menuItems = [newItem, ..._menuItems];

    // Refresh category count
    CATEGORIES = CATEGORIES.map(cat => ({
      ...cat,
      items: _menuItems.filter(item => item.categoryId === cat.id || item.categoryId === cat._id).length,
    }));

    notifyMenu();
    notifyCategories();
    window.dispatchEvent(new Event('restaurant_update'));
    try { addAuditLog({ module: 'Restaurant', action: 'Created Record', description: `Menu item ${newItem.name} created.`, importance: 'Normal' }); } catch(e){}
    return newItem;
  } catch (err) {
    console.error('Failed to add menu item on backend:', err);
    throw err;
  }
}

export async function updateMenuItem(id, data) {
  try {
    const existing = _menuItems.find(i => i.id === id || i._id === id);
    const backendId = existing?._id || existing?.id || id;

    let finalCatId = data.categoryId || existing?.categoryId;
    const matchedCategory = CATEGORIES.find(c => c.id === finalCatId || c._id === finalCatId);
    if (matchedCategory && matchedCategory._id) {
      finalCatId = matchedCategory._id;
    }

    const payload = adaptMenuItemToBackend({ ...existing, ...data, categoryId: finalCatId });
    const res = await restaurantService.updateMenuItem(backendId, payload);
    const updated = adaptMenuItemToUI(res?.data || res);

    _menuItems = _menuItems.map(item => (item.id === id || item._id === id ? updated : item));

    notifyMenu();
    window.dispatchEvent(new Event('restaurant_update'));
    return updated;
  } catch (err) {
    console.error('Failed to update menu item on backend:', err);
    throw err;
  }
}

export async function deleteMenuItem(id) {
  try {
    const existing = _menuItems.find(i => i.id === id || i._id === id);
    const backendId = existing?._id || existing?.id || id;

    await restaurantService.deleteMenuItem(backendId);
    _menuItems = _menuItems.filter(item => item.id !== id && item._id !== id);

    CATEGORIES = CATEGORIES.map(cat => ({
      ...cat,
      items: _menuItems.filter(item => item.categoryId === cat.id || item.categoryId === cat._id).length,
    }));

    notifyMenu();
    notifyCategories();
    window.dispatchEvent(new Event('restaurant_update'));
  } catch (err) {
    console.error('Failed to delete menu item on backend:', err);
    throw err;
  }
}

export async function toggleMenuItemAvailability(id) {
  try {
    const existing = _menuItems.find(i => i.id === id || i._id === id);
    if (!existing) return;
    const backendId = existing._id || existing.id || id;
    const newAvail = !existing.is_available;

    const res = await restaurantService.updateMenuItem(backendId, { is_available: newAvail });
    const updated = adaptMenuItemToUI(res?.data || res);

    _menuItems = _menuItems.map(item => (item.id === id || item._id === id ? updated : item));
    notifyMenu();
    window.dispatchEvent(new Event('restaurant_update'));
  } catch (err) {
    console.error('Failed to toggle menu item availability:', err);
    throw err;
  }
}

// ─── Orders Public API ────────────────────────────────────────

export function getOrders() {
  return [..._orders];
}

export function subscribeOrders(fn) {
  _ordersListeners.push(fn);
  return () => { _ordersListeners = _ordersListeners.filter(l => l !== fn); };
}

export async function placeOrder(payload) {
  try {
    const nameMap = {};
    _menuItems.forEach(i => { nameMap[i.name] = i; });

    const backendPayload = adaptOrderToBackend(payload, nameMap);
    const res = await restaurantService.createOrder(backendPayload);
    const newOrder = adaptOrderToUI(res?.data || res);

    _orders = [newOrder, ..._orders];
    notifyOrders();
    window.dispatchEvent(new Event('restaurant_update'));
    try { addAuditLog({ module: 'Restaurant', action: 'Created Record', description: `Order ${newOrder.order_ref} placed.`, importance: 'Normal' }); } catch(e){}
    return newOrder;
  } catch (err) {
    console.error('Failed to place order on backend:', err);
    throw err;
  }
}

export async function updateOrder(id, payload) {
  try {
    const existing = _orders.find(o => o.id === id || o._id === id || o.order_ref === id);
    if (!existing) return;
    const backendId = existing._id || existing.id;

    if (payload.status) {
      await updateOrderStatus(id, payload.status);
    }

    const backendPayload = {
      customer_name: payload.customer || payload.customer_name,
      room_number: payload.roomNo && payload.roomNo !== '—' && payload.roomNo !== '-' ? String(payload.roomNo).trim() : undefined,
      notes: payload.notes || payload.description,
    };

    const res = await restaurantService.updateOrder(backendId, backendPayload);
    const updated = adaptOrderToUI(res?.data || res);

    _orders = _orders.map(o => (o.id === id || o._id === id || o.order_ref === id ? updated : o));
    notifyOrders();
    window.dispatchEvent(new Event('restaurant_update'));
    return updated;
  } catch (err) {
    console.error('Failed to update order on backend:', err);
    throw err;
  }
}

export async function updateOrderStatus(id, uiStatus) {
  try {
    const existing = _orders.find(o => o.id === id || o._id === id || o.order_ref === id);
    if (!existing) return;
    const backendId = existing._id || existing.id;
    const targetStatus = mapUIStatusToBackend(uiStatus);

    let res;
    // Walk canonical state machine safely:
    // PENDING -> PREPARING -> SERVED -> COMPLETED
    if (targetStatus === 'COMPLETED') {
      if (existing.rawStatus === 'PENDING') {
        await restaurantService.updateOrderStatus(backendId, { status: 'PREPARING' });
        await restaurantService.updateOrderStatus(backendId, { status: 'SERVED' });
      } else if (existing.rawStatus === 'PREPARING') {
        await restaurantService.updateOrderStatus(backendId, { status: 'SERVED' });
      }
      res = await restaurantService.updateOrderStatus(backendId, { status: 'COMPLETED' });
    } else if (targetStatus === 'PREPARING') {
      if (existing.rawStatus === 'PENDING') {
        res = await restaurantService.updateOrderStatus(backendId, { status: 'PREPARING' });
      }
    } else {
      res = await restaurantService.updateOrderStatus(backendId, { status: targetStatus });
    }

    const updated = adaptOrderToUI(res?.data || res);
    _orders = _orders.map(o => (o.id === id || o._id === id || o.order_ref === id ? updated : o));
    notifyOrders();
    window.dispatchEvent(new Event('restaurant_update'));
    return updated;
  } catch (err) {
    console.error(`Failed to update order status to ${uiStatus} on backend:`, err);
    throw err;
  }
}

export async function deleteOrder(id) {
  try {
    const existing = _orders.find(o => o.id === id || o._id === id || o.order_ref === id);
    if (!existing) return;
    const backendId = existing._id || existing.id;

    // Proactively cancel active order on backend to void guest charges and maintain audit log
    if (existing.rawStatus === 'PENDING' || existing.rawStatus === 'PREPARING') {
      await restaurantService.updateOrderStatus(backendId, { status: 'CANCELLED', notes: 'Cancelled by staff' });
      _orders = _orders.map(o => (o.id === id || o._id === id || o.order_ref === id ? { ...o, status: 'Cancelled', rawStatus: 'CANCELLED' } : o));
    } else {
      _orders = _orders.filter(o => o.id !== id && o._id !== id && o.order_ref !== id);
    }

    notifyOrders();
    window.dispatchEvent(new Event('restaurant_update'));
  } catch (err) {
    console.error('Failed to cancel/delete order on backend:', err);
    throw err;
  }
}
