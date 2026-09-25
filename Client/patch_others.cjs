const fs = require('fs');

function patch(file, regexStr, replacement) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('addAuditLog')) {
    const depth = file.split('/').length - 3;
    const up = '../'.repeat(depth);
    content = `import { addAuditLog } from '${up}audit/state/auditStore.js';\n` + content;
  }
  content = content.replace(new RegExp(regexStr, 'g'), replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('patched ' + file);
}

patch('src/features/inventory/pages/inventoryStore.js',
  "export const addInventoryItem = \\(item\\) => \\{([\\s\\S]*?)saveInventoryItems\\(updated\\);([\\s\\S]*?)return nextItem;",
  "export const addInventoryItem = (item) => {$1saveInventoryItems(updated);$2try { addAuditLog({ module: 'Inventory', action: 'Added Inventory', description: `Item added.`, importance: 'Normal' }); } catch(e) {}\n  return nextItem;"
);
patch('src/features/inventory/pages/inventoryStore.js',
  "export const updateInventoryItem = \\(id, updates\\) => \\{([\\s\\S]*?)saveInventoryItems\\(updated\\);",
  "export const updateInventoryItem = (id, updates) => {$1saveInventoryItems(updated);\n  try { addAuditLog({ module: 'Inventory', action: 'Updated Inventory', description: `Item updated.`, importance: 'Normal' }); } catch(e) {}"
);
patch('src/features/inventory/pages/inventoryStore.js',
  "export const deleteInventoryItem = \\(id\\) => \\{([\\s\\S]*?)saveInventoryItems\\(updated\\);",
  "export const deleteInventoryItem = (id) => {$1saveInventoryItems(updated);\n  try { addAuditLog({ module: 'Inventory', action: 'Deleted Inventory', description: `Item deleted.`, importance: 'Critical' }); } catch(e) {}"
);

patch('src/features/restaurant/pages/restaurantStore.js',
  "export function placeOrder\\(payload\\) \\{([\\s\\S]*?)saveOrders\\(\\[nextOrder, \\.\\.\\.orders\\]\\);",
  "export function placeOrder(payload) {$1saveOrders([nextOrder, ...orders]);\n  try { addAuditLog({ module: 'Restaurant', action: 'Created Order', description: `Order placed.`, importance: 'Normal' }); } catch(e) {}"
);
patch('src/features/restaurant/pages/restaurantStore.js',
  "export function updateOrder\\(id, payload\\) \\{([\\s\\S]*?)saveOrders\\(updated\\);",
  "export function updateOrder(id, payload) {$1saveOrders(updated);\n  try { addAuditLog({ module: 'Restaurant', action: 'Updated Order', description: `Order updated.`, importance: 'Normal' }); } catch(e) {}"
);

patch('src/features/rates-pricing/pages/ratesPricingStore.js',
  "export const addRatePlan = \\(planData\\) => \\{([\\s\\S]*?)saveRatePlans\\(\\[nextPlan, \\.\\.\\.currentPlans\\]\\);",
  "export const addRatePlan = (planData) => {$1saveRatePlans([nextPlan, ...currentPlans]);\n  try { addAuditLog({ module: 'Rate & Pricing', action: 'Added Rate Plan', description: `Rate Plan added.`, importance: 'Important' }); } catch(e) {}"
);
patch('src/features/rates-pricing/pages/ratesPricingStore.js',
  "export const updateRatePlan = \\(id, updates\\) => \\{([\\s\\S]*?)saveRatePlans\\(updated\\);",
  "export const updateRatePlan = (id, updates) => {$1saveRatePlans(updated);\n  try { addAuditLog({ module: 'Rate & Pricing', action: 'Updated Rate Plan', description: `Rate Plan updated.`, importance: 'Normal' }); } catch(e) {}"
);
