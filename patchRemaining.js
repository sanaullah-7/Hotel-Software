const fs = require('fs');

const stores = [
  'Client/src/features/audit/state/auditStore.js',
  'Client/src/features/car-parking/state/carParkingStore.js',
  'Client/src/features/housekeeping/pages/hkStore.js',
  'Client/src/features/inventory/pages/inventoryStore.js',
  'Client/src/features/payment-billing/pages/paymentBillingStore.js',
  'Client/src/features/restaurant/pages/restaurantStore.js',
  'Client/src/features/staff/services/staffStore.js'
];

stores.forEach(store => {
  let r = fs.readFileSync(store, 'utf8');

  // Replace localStorage.getItem
  r = r.replace(/localStorage\.getItem\([^)]+\)/g, 'null');
  
  // Replace localStorage.setItem
  r = r.replace(/localStorage\.setItem/g, '// localStorage.setItem');

  // Replace fallback to INITIAL arrays with empty arrays
  r = r.replace(/return\s+INITIAL_[A-Z_]+/g, 'return []');
  r = r.replace(/=\s*data\s*===\s*null\s*\?\s*INITIAL_[A-Z_]+\s*:\s*JSON\.parse\(data\)/g, '= data === null ? [] : JSON.parse(data)');
  r = r.replace(/return\s+INITIAL_[A-Z_]+/g, 'return []');

  // Delete export of INITIAL constants to avoid React using them
  r = r.replace(/export\s+const\s+INITIAL_[A-Z_]+\s*=\s*\[[\s\S]*?\];/g, '');

  fs.writeFileSync(store, r);
  console.log("Patched", store);
});
