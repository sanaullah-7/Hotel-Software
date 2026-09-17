import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RestaurantMenu from '@mui/icons-material/RestaurantMenu';
import Receipt from '@mui/icons-material/Receipt';
import { getOrders, subscribeOrders } from './restaurantStore';
import MenuTab from './tabs/MenuTab';
import OrdersTab from './tabs/OrdersTab';
const SUB_TABS = [
  { key: 'menu',   label: 'Menu',   path: '/restaurant/menu',   Icon: RestaurantMenu },
  { key: 'orders', label: 'Orders', path: '/restaurant/orders', Icon: Receipt        },
];

/**
 * Restaurant — parent page with URL-driven sub-tab navigation.
 * Active tab is read from the current URL so the browser back button works.
 */
export default function Restaurant() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [inProgressCount, setInProgressCount] = useState(0);

  // Determine active tab from URL
  const activeKey = location.pathname.includes('/orders') ? 'orders' : 'menu';

  // Live badge for Orders tab
  useEffect(() => {
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

      {/* ─── Sub-Tab Bar Removed ────────────────────────── */}

      {/* ─── Active Tab Content ──────────────────────────── */}
      <div className="flex-1 min-h-0">
        {activeKey === 'menu'   && <MenuTab />}
        {activeKey === 'orders' && <OrdersTab />}
      </div>

    </div>
  );
}
