import { addAuditLog } from '../../audit/state/auditStore.js';
// ============================================================
// Restaurant Store — Single Source of Truth
// All restaurant data lives here. Import getters/setters in
// any tab component — keeps state consistent across tabs.
// ============================================================

// ─── Menu Categories ────────────────────────────────────────
export const CATEGORIES = [
  { id: 'starters',   label: 'Starters',         color: '#e53935', items: 6 },
  { id: 'main',       label: 'Main Course',      color: '#7b1fa2', items: 6 },
  { id: 'beverages',  label: 'Beverages',        color: '#1565c0', items: 6 },
  { id: 'soups',      label: 'Soups',            color: '#795548', items: 6 },
  { id: 'desserts',   label: 'Desserts',         color: '#283593', items: 4 },
  { id: 'pizzas',     label: 'Pizzas',           color: '#2e7d32', items: 3 },
  { id: 'alcohol',    label: 'Alcoholic Drinks', color: '#c62828', items: 6 },
  { id: 'salads',     label: 'Salads',           color: '#6a1b9a', items: 5 },
];

// ─── Menu Items ─────────────────────────────────────────────
const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' });

let _menuItems = [
  // Starters
  { id: 'mi-01', categoryId: 'starters', name: 'Paneer Tikka',      price: 250, description: 'Grilled cottage cheese with spices',   dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-02', categoryId: 'starters', name: 'Chicken Tikka',     price: 300, description: 'Marinated chicken grilled in tandoor',  dietary: 'Non-Veg', availability: 'Available', lastUpdated: today },
  { id: 'mi-03', categoryId: 'starters', name: 'Tandoori Chicken',  price: 350, description: 'Classic whole tandoori chicken',        dietary: 'Non-Veg', availability: 'Available', lastUpdated: today },
  { id: 'mi-04', categoryId: 'starters', name: 'Samosa',            price: 100, description: 'Crispy fried pastry with potato filling',dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-05', categoryId: 'starters', name: 'Aloo Tikki',        price: 120, description: 'Pan-fried potato patty',                dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-06', categoryId: 'starters', name: 'Hara Bhara Kebab',  price: 220, description: 'Green vegetable kebab',                 dietary: 'Veg',     availability: 'Available', lastUpdated: today },

  // Main Course
  { id: 'mi-07', categoryId: 'main', name: 'Butter Chicken',        price: 380, description: 'Creamy tomato-based chicken curry',     dietary: 'Non-Veg', availability: 'Available', lastUpdated: today },
  { id: 'mi-08', categoryId: 'main', name: 'Dal Makhani',           price: 240, description: 'Slow-cooked black lentils in cream',    dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-09', categoryId: 'main', name: 'Mutton Biryani',        price: 450, description: 'Fragrant rice with slow-cooked mutton', dietary: 'Non-Veg', availability: 'Available', lastUpdated: today },
  { id: 'mi-10', categoryId: 'main', name: 'Chicken Karahi',        price: 420, description: 'Wok-cooked spicy chicken',              dietary: 'Non-Veg', availability: 'Available', lastUpdated: today },
  { id: 'mi-11', categoryId: 'main', name: 'Palak Paneer',          price: 280, description: 'Cottage cheese in spinach gravy',       dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-12', categoryId: 'main', name: 'Nihari',                price: 390, description: 'Slow-cooked beef stew',                 dietary: 'Non-Veg', availability: 'Unavailable', lastUpdated: today },

  // Beverages
  { id: 'mi-13', categoryId: 'beverages', name: 'Mango Lassi',      price: 130, description: 'Fresh mango blended with yogurt',      dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-14', categoryId: 'beverages', name: 'Fresh Lime Soda',  price: 80,  description: 'Refreshing lime with soda',            dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-15', categoryId: 'beverages', name: 'Masala Chai',      price: 60,  description: 'Spiced Indian tea',                    dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-16', categoryId: 'beverages', name: 'Cold Coffee',      price: 150, description: 'Blended iced coffee',                  dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-17', categoryId: 'beverages', name: 'Mint Cooler',      price: 90,  description: 'Fresh mint with lemon',                dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-18', categoryId: 'beverages', name: 'Strawberry Shake', price: 160, description: 'Fresh strawberry milkshake',           dietary: 'Veg',     availability: 'Available', lastUpdated: today },

  // Soups
  { id: 'mi-19', categoryId: 'soups', name: 'Tomato Soup',          price: 120, description: 'Classic creamy tomato',                dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-20', categoryId: 'soups', name: 'Hot & Sour Soup',      price: 140, description: 'Tangy spicy Chinese soup',             dietary: 'Non-Veg', availability: 'Available', lastUpdated: today },
  { id: 'mi-21', categoryId: 'soups', name: 'Sweet Corn Soup',      price: 130, description: 'Creamy corn broth',                    dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-22', categoryId: 'soups', name: 'Manchow Soup',         price: 150, description: 'Crispy noodle garnish soup',           dietary: 'Non-Veg', availability: 'Available', lastUpdated: today },
  { id: 'mi-23', categoryId: 'soups', name: 'Mushroom Soup',        price: 160, description: 'Earthy mushroom cream soup',           dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-24', categoryId: 'soups', name: 'Paya Soup',            price: 180, description: 'Traditional trotters broth',           dietary: 'Non-Veg', availability: 'Unavailable', lastUpdated: today },

  // Desserts
  { id: 'mi-25', categoryId: 'desserts', name: 'Gulab Jamun',       price: 90,  description: 'Soft milk solids in rose syrup',       dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-26', categoryId: 'desserts', name: 'Rasmalai',          price: 110, description: 'Cottage cheese in saffron milk',       dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-27', categoryId: 'desserts', name: 'Kheer',             price: 100, description: 'Rice pudding with cardamom',           dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-28', categoryId: 'desserts', name: 'Chocolate Brownie', price: 180, description: 'Warm fudgy chocolate brownie',         dietary: 'Veg',     availability: 'Available', lastUpdated: today },

  // Pizzas
  { id: 'mi-29', categoryId: 'pizzas', name: 'Margherita',          price: 320, description: 'Classic tomato, mozzarella, basil',   dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-30', categoryId: 'pizzas', name: 'BBQ Chicken',         price: 420, description: 'Smoky BBQ with grilled chicken',       dietary: 'Non-Veg', availability: 'Available', lastUpdated: today },
  { id: 'mi-31', categoryId: 'pizzas', name: 'Veggie Delight',      price: 350, description: 'Loaded garden vegetables',             dietary: 'Veg',     availability: 'Available', lastUpdated: today },

  // Alcoholic Drinks
  { id: 'mi-32', categoryId: 'alcohol', name: 'House Red Wine',     price: 550, description: 'Smooth dry red blend',                dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-33', categoryId: 'alcohol', name: 'Craft Beer',         price: 320, description: 'Local craft lager',                   dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-34', categoryId: 'alcohol', name: 'Mojito',             price: 280, description: 'Rum with fresh mint & lime',          dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-35', categoryId: 'alcohol', name: 'Whiskey Sour',       price: 450, description: 'Whiskey with lemon juice',            dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-36', categoryId: 'alcohol', name: 'Sangria',            price: 380, description: 'Fruity wine punch',                    dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-37', categoryId: 'alcohol', name: 'Margarita',          price: 350, description: 'Tequila with lime and salt',          dietary: 'Veg',     availability: 'Available', lastUpdated: today },

  // Salads
  { id: 'mi-38', categoryId: 'salads', name: 'Caesar Salad',        price: 220, description: 'Romaine, croutons, parmesan',          dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-39', categoryId: 'salads', name: 'Greek Salad',         price: 200, description: 'Olives, feta, cucumber, tomato',       dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-40', categoryId: 'salads', name: 'Pasta Salad',         price: 230, description: 'Chilled pasta with veggies',           dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-41', categoryId: 'salads', name: 'Coleslaw',            price: 130, description: 'Creamy cabbage & carrot slaw',         dietary: 'Veg',     availability: 'Available', lastUpdated: today },
  { id: 'mi-42', categoryId: 'salads', name: 'Fruit Salad',         price: 180, description: 'Seasonal fresh fruits',               dietary: 'Veg',     availability: 'Available', lastUpdated: today },
];

// ─── Menu Items Public API ───────────────────────────────────
let _menuListeners = [];

function notifyMenu() {
  _menuListeners.forEach(fn => fn());
}

export function getMenuItems() {
  return [..._menuItems];
}

export function subscribeMenuItems(fn) {
  _menuListeners.push(fn);
  return () => { _menuListeners = _menuListeners.filter(l => l !== fn); };
}

let _idCounter = 43;
export function addMenuItem(data) {
  const newItem = {
    ...data,
    id: `mi-${String(_idCounter++).padStart(2, '0')}`,
    lastUpdated: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }),
  };
  _menuItems = [newItem, ..._menuItems];
  notifyMenu();
}

export function updateMenuItem(id, data) {
  _menuItems = _menuItems.map(item =>
    item.id === id
      ? { ...item, ...data, lastUpdated: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) }
      : item
  );
  notifyMenu();
}

export function deleteMenuItem(id) {
  _menuItems = _menuItems.filter(item => item.id !== id);
  notifyMenu();
}

export function toggleMenuItemAvailability(id) {
  _menuItems = _menuItems.map(item =>
    item.id === id
      ? { ...item, availability: item.availability === 'Available' ? 'Unavailable' : 'Available',
          lastUpdated: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) }
      : item
  );
  notifyMenu();
}

// ─── Initial Orders (seed data for Orders tab) ──────────────
const TAX_RATE = 0.0525; // 5.25%

function buildOrder(id, customer, roomNo, items, status, paymentMode, minsAgo) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const date = new Date(Date.now() - minsAgo * 60 * 1000);
  return { id, customer, roomNo, items, status, paymentMode, subtotal, tax, total, placedAt: date.toISOString() };
}

let _orders = [
  buildOrder('ORD-001', 'Amrit Raj',   1,  [{ itemId: 'mi-01', name: 'Paneer Tikka',    price: 250, qty: 2 }],                                                                   'Completed',   'Cash',   90),
  buildOrder('ORD-002', 'Simran Soni', 3,  [{ itemId: 'mi-07', name: 'Butter Chicken',  price: 380, qty: 1 }, { itemId: 'mi-13', name: 'Mango Lassi',   price: 130, qty: 1 }], 'In Progress', 'Online', 32),
  buildOrder('ORD-003', 'Amrit Raj',   4,  [{ itemId: 'mi-09', name: 'Mutton Biryani',  price: 450, qty: 1 }, { itemId: 'mi-15', name: 'Masala Chai',   price: 60,  qty: 2 }], 'In Progress', 'Cash',   28),
  buildOrder('ORD-004', 'Ankit Raj',   8,  [{ itemId: 'mi-04', name: 'Samosa',          price: 100, qty: 3 }],                                                                   'In Progress', 'Online', 15),
  buildOrder('ORD-005', 'Sagrika Soni',12, [{ itemId: 'mi-29', name: 'Margherita',      price: 320, qty: 1 }, { itemId: 'mi-16', name: 'Cold Coffee',   price: 150, qty: 1 }], 'Completed',   'Online', 60),
  buildOrder('ORD-006', 'Raza Khan',   2,  [{ itemId: 'mi-10', name: 'Chicken Karahi',  price: 420, qty: 1 }, { itemId: 'mi-19', name: 'Tomato Soup',   price: 120, qty: 2 }], 'Cancelled',   'Cash',   120),
  buildOrder('ORD-007', 'Fatima Ali',  5,  [{ itemId: 'mi-25', name: 'Gulab Jamun',     price: 90,  qty: 2 }, { itemId: 'mi-27', name: 'Kheer',         price: 100, qty: 1 }], 'Completed',   'Cash',   200),
  buildOrder('ORD-008', 'Bilal Shah',  7,  [{ itemId: 'mi-30', name: 'BBQ Chicken',     price: 420, qty: 1 }, { itemId: 'mi-33', name: 'Craft Beer',    price: 320, qty: 2 }], 'Cancelled',   'Online', 180),
];

let _listeners = [];

function notify() {
  _listeners.forEach(fn => fn());
}

// ─── Public API ──────────────────────────────────────────────
export function getOrders() {
  return [..._orders];
}

/**
 * Place a new order from the Menu tab's order panel.
 */
export function placeOrder(payload) {
  const id = `ORD-${String(_orders.length + 1).padStart(3, '0')}`;
  const newOrder = buildOrder(id, payload.customer, payload.roomNo, payload.items, 'In Progress', payload.paymentMode || 'Room Folio', 0);
  
  // Apply additional fields
  newOrder.deliveryDate = payload.deliveryDate;
  newOrder.deliveryTime = payload.deliveryTime;
  newOrder.gratuity = payload.gratuity;
  newOrder.description = payload.description;
  if (payload.total !== undefined) newOrder.total = payload.total;

  _orders = [newOrder, ..._orders];
  notify();
  // Persist to localStorage so sibling tabs pick it up
  window.dispatchEvent(new Event('restaurant_update'));
    try { addAuditLog({ module: 'Restaurant', action: 'Updated Record', description: 'CATEGORIES was called.', importance: 'Normal' }); } catch(e){}
}

export function updateOrder(id, payload) {
  _orders = _orders.map(o => {
    if (o.id === id) {
      const subtotal = payload.items.reduce((s, i) => s + i.price * i.qty, 0);
      const tax = +(subtotal * TAX_RATE).toFixed(2);
      const total = +(subtotal + tax + (payload.gratuity || 0)).toFixed(2);
      return { ...o, ...payload, subtotal, tax, total };
    }
    return o;
  });
  notify();
  window.dispatchEvent(new Event('restaurant_update'));
}

/**
 * Subscribe to order updates.
 * @param {Function} fn
 * @returns {Function} unsubscribe
 */
export function subscribeOrders(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

export function deleteOrder(id) {
  _orders = _orders.filter(o => o.id !== id);
  notify();
  window.dispatchEvent(new Event('restaurant_update'));
}

export function updateOrderStatus(id, status) {
  _orders = _orders.map(o => o.id === id ? { ...o, status } : o);
  notify();
  window.dispatchEvent(new Event('restaurant_update'));
}

