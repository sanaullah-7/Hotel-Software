const fs = require('fs');
const path = require('path');

const stores = [
  'Client/src/features/audit/state/auditStore.js',
  'Client/src/features/car-parking/state/carParkingStore.js',
  'Client/src/features/housekeeping/pages/hkStore.js',
  'Client/src/features/inventory/pages/inventoryStore.js',
  'Client/src/features/payment-billing/pages/paymentBillingStore.js',
  'Client/src/features/restaurant/pages/restaurantStore.js',
  'Client/src/features/staff/services/staffStore.js',
  'Client/src/features/front-office/pages/opsStore.js',
  'Client/src/features/rates-pricing/pages/ratesStore.js'
];

stores.forEach(store => {
  const fullPath = path.resolve(__dirname, store);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace INITIAL_ arrays and STORAGE_KEYS
    content = content.replace(/export const INITIAL_[a-zA-Z0-9_]+\s*=\s*\[[\s\S]*?\];/g, '');
    content = content.replace(/const INITIAL_[a-zA-Z0-9_]+\s*=\s*\[[\s\S]*?\];/g, '');
    content = content.replace(/const STORAGE_KEY.*?;\n?/g, '');
    
    // Convert localStorage reads to memoryCache
    content = content.replace(/localStorage\.getItem\([^)]+\)/g, 'null');
    content = content.replace(/localStorage\.setItem\([^)]+\)/g, 'null');

    fs.writeFileSync(fullPath, content);
    console.log('Cleaned localStorage from', store);
  }
});
