import React, { useEffect, useState } from'react';
import { useNavigate, useLocation } from'react-router-dom';
import RestaurantMenu from'@mui/icons-material/RestaurantMenu';
import Receipt from'@mui/icons-material/Receipt';
import { getOrders, subscribeOrders, initializeRestaurantStore } from './restaurantStore';
import MenuTab from './tabs/MenuTab';
import OrdersTab from './tabs/OrdersTab';

const SUB_TABS = [
  { key: 'menu', label: 'Menu', path: '/restaurant/menu', Icon: RestaurantMenu },
  { key: 'orders', label: 'Orders', path: '/restaurant/orders', Icon: Receipt },
];

/**
 * Restaurant — parent page with URL-driven sub-tab navigation.
 * Active tab is read from the current URL so the browser back button works.
 */
export default function Restaurant() {
  const navigate = useNavigate();
  const location = useLocation();
  const [inProgressCount, setInProgressCount] = useState(0);

  // Determine active tab from URL
  const activeKey = location.pathname.includes('/orders') ? 'orders' : 'menu';

  // Initialize backend data and live badge for Orders tab
  useEffect(() => {
    initializeRestaurantStore(true);
    const update = () => {
      setInProgressCount(getOrders().filter(o => o.status === 'In Progress').length);
    };
    update();
    const unsub = subscribeOrders(update);
    window.addEventListener('restaurant_update', update);
    return () => { unsub(); window.removeEventListener('restaurant_update', update); };
  }, []);

 return (
 <div className="flex flex-col gap-4 animate-fade-in">

  {/* ─── Sub-Tab Navigation Bar ────────────────────────── */}
  <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
    <div className="flex items-center gap-2">
      {SUB_TABS.map((tab) => {
        const isActive = activeKey === tab.key;
        const Icon = tab.Icon;
        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-[var(--primary-main)] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Icon sx={{ fontSize: 16 }} />
            <span>{tab.label}</span>
            {tab.key === 'orders' && inProgressCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {inProgressCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>

 {/* ─── Active Tab Content ──────────────────────────── */}
 <div className="flex-1 min-h-0">
 {activeKey ==='menu' && <MenuTab />}
 {activeKey ==='orders' && <OrdersTab />}
 </div>

 </div>
 );
}
