const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

const replacement = `import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon, 
  Laptop as FrontOfficeIcon,
  EventNote as BookingIcon,
  Domain as OccupancyIcon,
  Bed as RoomIcon,
  ChevronRight as ChevronRightIcon, 
  ChevronLeft as ChevronLeftIcon,
  CleaningServices as HousekeepingIcon,
  Build as MaintenanceIcon,
  Inventory2 as InventoryIcon,
  Payments as RatesPricingIcon,
  ReceiptLong as PaymentBillingIcon,
  People as HRIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  Restaurant as RestaurantIcon,
  AutoAwesome as AssistantIcon
} from '@mui/icons-material';

export default function Sidebar() {
  const location = useLocation();
  const isFrontOfficePath = location.pathname.startsWith('/front-office');
  const isOccupancyPath`;

content = content.replace(/^.*?const isOccupancyPath/s, replacement);
fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', content);

const esbuild = require('esbuild');
async function test() {
  try {
    const c = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');
    await esbuild.transform(c, { loader: 'jsx' });
    console.log('Sidebar: Valid JSX!');
  } catch (e) {
    console.error('Sidebar Error:', e.errors[0].text);
    console.error('Line:', e.errors[0].location.line);
  }
}
test();
