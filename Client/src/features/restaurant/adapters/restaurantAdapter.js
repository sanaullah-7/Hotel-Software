/**
 * Restaurant & POS Module Adapter
 * Handles bidirectional transformation between Backend Canonical models and Frontend UI models.
 */

const PALETTE = [
  '#e53935', '#7b1fa2', '#1565c0', '#795548',
  '#283593', '#2e7d32', '#c62828', '#6a1b9a',
  '#00897b', '#d81b60', '#f57c00', '#546e7a',
];

export const adaptCategoryToUI = (category, index = 0) => {
  if (!category) return null;
  const id = category._id || category.id;
  const name = category.name || category.label || '';
  const color = category.color || PALETTE[index % PALETTE.length];

  return {
    id,
    _id: id,
    label: name,
    name,
    description: category.description || '',
    color,
    items: category.itemsCount !== undefined ? category.itemsCount : (category.items || 0),
    status: category.status || 'ACTIVE',
  };
};

export const adaptMenuItemToUI = (item) => {
  if (!item) return null;
  const id = item._id || item.id;
  const categoryId = typeof item.category_id === 'object' && item.category_id !== null
    ? item.category_id._id
    : (item.category_id || item.categoryId || '');

  const isVeg = Array.isArray(item.dietary_flags)
    ? item.dietary_flags.includes('VEGETARIAN') || item.dietary_flags.includes('VEGAN')
    : item.dietary === 'Veg';

  const isAvailable = item.is_available !== undefined
    ? Boolean(item.is_available)
    : item.availability === 'Available';

  const updatedDate = item.updated_at || item.created_at || Date.now();
  const lastUpdated = new Date(updatedDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return {
    id,
    _id: id,
    categoryId,
    name: item.name || '',
    price: Number(item.price) || 0,
    description: item.description || '',
    dietary: isVeg ? 'Veg' : 'Non-Veg',
    availability: isAvailable ? 'Available' : 'Unavailable',
    is_available: isAvailable,
    sku: item.sku || '',
    status: item.status || 'ACTIVE',
    lastUpdated,
  };
};

export const adaptMenuItemToBackend = (formData) => {
  if (!formData) return {};
  const isVeg = formData.dietary === 'Veg';
  const isAvailable = formData.availability === 'Available' || formData.is_available === true;

  return {
    name: (formData.name || '').trim(),
    category_id: formData.categoryId || formData.category_id,
    price: Number(formData.price) || 0,
    description: (formData.description || '').trim(),
    sku: formData.sku ? formData.sku.trim() : undefined,
    dietary_flags: isVeg ? ['VEGETARIAN'] : [],
    is_available: isAvailable,
    status: formData.status || 'ACTIVE',
  };
};

export const mapBackendStatusToUI = (status) => {
  switch (status) {
    case 'PENDING':
    case 'PREPARING':
    case 'SERVED':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status || 'In Progress';
  }
};

export const mapUIStatusToBackend = (uiStatus) => {
  switch (uiStatus) {
    case 'In Progress':
      return 'PREPARING';
    case 'Completed':
      return 'COMPLETED';
    case 'Cancelled':
      return 'CANCELLED';
    default:
      return uiStatus;
  }
};

export const mapBackendPaymentToUI = (mode) => {
  switch (mode) {
    case 'ROOM_FOLIO':
      return 'Room Folio';
    case 'CASH':
      return 'Cash';
    case 'CARD':
      return 'Card';
    case 'ONLINE':
      return 'Online';
    default:
      return mode || 'Cash';
  }
};

export const mapUIPaymentToBackend = (mode) => {
  const norm = String(mode || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (norm.includes('room') || norm.includes('folio')) return 'ROOM_FOLIO';
  if (norm.includes('card')) return 'CARD';
  if (norm.includes('online')) return 'ONLINE';
  return 'CASH';
};

export const adaptOrderToUI = (order) => {
  if (!order) return null;
  const id = order.order_ref || order._id || order.id;
  const items = Array.isArray(order.items)
    ? order.items.map((i) => ({
        itemId: i.menu_item_id?._id || i.menu_item_id || i.itemId || i._id,
        name: i.item_name_snapshot || i.name || '',
        price: Number(i.unit_price_snapshot !== undefined ? i.unit_price_snapshot : i.price) || 0,
        qty: Number(i.quantity !== undefined ? i.quantity : i.qty) || 1,
        subtotal: Number(i.subtotal) || 0,
        special_requests: i.special_requests || '',
      }))
    : [];

  const subtotal = Number(order.subtotal) || items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = Number(order.total_amount !== undefined ? order.total_amount : order.total) || subtotal;
  const tax = Number(order.tax) || +(total - subtotal).toFixed(2);

  return {
    id,
    _id: order._id || id,
    order_ref: order.order_ref || id,
    customer: order.customer_name || order.customer || 'Walk-in Diner',
    roomNo: order.room_number || order.roomNo || '—',
    items,
    status: mapBackendStatusToUI(order.status),
    paymentMode: mapBackendPaymentToUI(order.payment_mode || order.paymentMode),
    subtotal: +subtotal.toFixed(2),
    tax: tax > 0 ? +tax.toFixed(2) : 0,
    total: +total.toFixed(2),
    placedAt: order.created_at || order.placedAt || new Date().toISOString(),
    settled_at: order.settled_at || null,
    notes: order.notes || '',
    rawStatus: order.status || 'PENDING',
    rawPaymentMode: order.payment_mode || 'CASH',
  };
};

export const adaptOrderToBackend = (uiOrder, menuItemsMap = {}) => {
  if (!uiOrder) return {};
  const paymentMode = mapUIPaymentToBackend(uiOrder.paymentMode);

  const items = (uiOrder.items || []).map((i) => {
    // resolve menu item ID if available
    const menuItemId = i.itemId || i.menu_item_id || menuItemsMap[i.name]?._id || menuItemsMap[i.name]?.id;
    return {
      menu_item_id: menuItemId,
      quantity: Number(i.qty || i.quantity) || 1,
      special_requests: (i.special_requests || i.specialRequests || '').trim(),
    };
  });

  const payload = {
    items,
    payment_mode: paymentMode,
    customer_name: (uiOrder.customer || uiOrder.customer_name || '').trim(),
    room_number: uiOrder.roomNo && uiOrder.roomNo !== '—' && uiOrder.roomNo !== '-' ? String(uiOrder.roomNo).trim() : undefined,
    notes: (uiOrder.notes || uiOrder.description || '').trim(),
  };

  if (uiOrder.folio_id) payload.folio_id = uiOrder.folio_id;
  if (uiOrder.table_id) payload.table_id = uiOrder.table_id;
  if (uiOrder.idempotency_key) payload.idempotency_key = uiOrder.idempotency_key;

  return payload;
};
