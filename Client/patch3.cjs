const fs = require('fs');

function replaceRegex(filePath, pattern, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (pattern.test(content)) {
    content = content.replace(pattern, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`Not found in ${filePath}`);
  }
}

// Guest Store
replaceRegex('src/features/guests/state/guestStore.js', 
  /export function addGuest\(guest\) \{([\s\S]*?)saveGuests\(\[nextGuest, \.\.\.readGuests\(\)\]\);\s*return nextGuest;\s*\}/,
  `export function addGuest(guest) {$1saveGuests([nextGuest, ...readGuests()]);
  try {
    addAuditLog({ module: 'Guests', action: 'Added Guest', recordId: nextGuest.id, description: \`Guest \${nextGuest.name} was added.\`, importance: 'Important' });
  } catch(e) {}
  return nextGuest;
}`
);

replaceRegex('src/features/guests/state/guestStore.js', 
  /export function updateGuest\(id, updates\) \{([\s\S]*?)saveGuests\(guests\);\s*return guests\.find\(\(guest\) => guest\.id === id\);\s*\}/,
  `export function updateGuest(id, updates) {$1saveGuests(guests);
  const updatedGuest = guests.find((guest) => guest.id === id);
  if (updatedGuest) {
    try {
      addAuditLog({ module: 'Guests', action: 'Updated Guest', recordId: id, description: \`Guest \${updatedGuest.name} was updated.\`, importance: 'Normal' });
    } catch(e) {}
  }
  return updatedGuest;
}`
);

replaceRegex('src/features/guests/state/guestStore.js', 
  /export function deleteGuest\(id\) \{\s*saveGuests\(readGuests\(\)\.filter\(\(guest\) => guest\.id !== id\)\);\s*\}/,
  `export function deleteGuest(id) {
  const guestToDelete = readGuests().find((guest) => guest.id === id);
  saveGuests(readGuests().filter((guest) => guest.id !== id));
  if (guestToDelete) {
    try {
      addAuditLog({ module: 'Guests', action: 'Deleted Guest', recordId: id, description: \`Guest \${guestToDelete.name} was deleted.\`, importance: 'Critical' });
    } catch(e) {}
  }
}`
);

// AddReservation.jsx
replaceRegex('src/features/reservations/pages/AddReservation.jsx',
  /saveReservations\(\[\{\s*id:\s*nextId,/,
  `try { addAuditLog({ module: 'Reservation', action: 'Created Reservation', recordId: nextId, description: \`Reservation \${nextId} created.\`, importance: 'Important' }); } catch(e) {}
  saveReservations([{
    id: nextId,`
);

// AllReservations.jsx
replaceRegex('src/features/reservations/pages/AllReservations.jsx',
  /saveReservations\(nextBookings\);\s*onClose\(\);/,
  `saveReservations(nextBookings);
    try { addAuditLog({ module: 'Reservation', action: 'Updated Reservation', recordId: editingBooking.bookingId, description: \`Reservation \${editingBooking.bookingId} updated.\`, importance: 'Important' }); } catch(e) {}
    onClose();`
);

// CancelBooking.jsx
replaceRegex('src/features/reservations/pages/CancelBooking.jsx',
  /saveReservations\(updated\);\s*setBookings\(updated\);/,
  `saveReservations(updated);
      setBookings(updated);
      try { addAuditLog({ module: 'Reservation', action: 'Cancelled Reservation', recordId: selectedBooking.id, description: \`Reservation \${selectedBooking.id} cancelled.\`, importance: 'Critical' }); } catch(e) {}`
);

// Payment & Billing (PaymentBillingStore)
replaceRegex('src/features/payment-billing/pages/paymentBillingStore.js',
  /export const addInvoice = \(newInvoice\) => \{([\s\S]*?)window\.dispatchEvent\(new Event\('paymentBillingUpdate'\)\);\s*\}/,
  `export const addInvoice = (newInvoice) => {$1window.dispatchEvent(new Event('paymentBillingUpdate'));
  try { addAuditLog({ module: 'Payment & Billing', action: 'Created Invoice', recordId: newInvoice.invoiceNumber, description: \`Invoice \${newInvoice.invoiceNumber} created.\`, importance: 'Important' }); } catch(e) {}
}`
);

replaceRegex('src/features/payment-billing/pages/paymentBillingStore.js',
  /export const updateInvoice = \(id, updatedData\) => \{([\s\S]*?)window\.dispatchEvent\(new Event\('paymentBillingUpdate'\)\);\s*\}/,
  `export const updateInvoice = (id, updatedData) => {$1window.dispatchEvent(new Event('paymentBillingUpdate'));
  try { addAuditLog({ module: 'Payment & Billing', action: 'Updated Invoice', recordId: id, description: \`Invoice \${id} updated.\`, importance: 'Important' }); } catch(e) {}
}`
);

replaceRegex('src/features/payment-billing/pages/paymentBillingStore.js',
  /export const processRefund = \(refund\) => \{([\s\S]*?)window\.dispatchEvent\(new Event\('paymentBillingUpdate'\)\);\s*\}/,
  `export const processRefund = (refund) => {$1window.dispatchEvent(new Event('paymentBillingUpdate'));
  try { addAuditLog({ module: 'Payment & Billing', action: 'Processed Refund', recordId: refund.refundId, description: \`Refund \${refund.refundId} processed.\`, importance: 'Critical' }); } catch(e) {}
}`
);

// Housekeeping
replaceRegex('src/features/housekeeping/pages/hkStore.js',
  /export const updateTask = \(id, updatedData\) => \{([\s\S]*?)window\.dispatchEvent\(new Event\('hkUpdate'\)\);\s*\}/,
  `export const updateTask = (id, updatedData) => {$1window.dispatchEvent(new Event('hkUpdate'));
  try { addAuditLog({ module: 'Housekeeping', action: 'Updated Task', recordId: id, description: \`Cleaning task \${id} updated.\`, importance: 'Normal' }); } catch(e) {}
}`
);

// Inventory
replaceRegex('src/features/inventory/pages/inventoryStore.js',
  /export const addStockItem = \(item\) => \{([\s\S]*?)window\.dispatchEvent\(new Event\('inventoryUpdate'\)\);\s*\}/,
  `export const addStockItem = (item) => {$1window.dispatchEvent(new Event('inventoryUpdate'));
  try { addAuditLog({ module: 'Inventory', action: 'Added Stock', recordId: item.sku, description: \`Stock \${item.name} added.\`, importance: 'Normal' }); } catch(e) {}
}`
);
replaceRegex('src/features/inventory/pages/inventoryStore.js',
  /export const updateStockItem = \(id, updatedData\) => \{([\s\S]*?)window\.dispatchEvent\(new Event\('inventoryUpdate'\)\);\s*\}/,
  `export const updateStockItem = (id, updatedData) => {$1window.dispatchEvent(new Event('inventoryUpdate'));
  try { addAuditLog({ module: 'Inventory', action: 'Updated Stock', recordId: id, description: \`Stock \${id} updated.\`, importance: 'Normal' }); } catch(e) {}
}`
);

// Rates & Pricing
replaceRegex('src/features/rates-pricing/pages/ratesPricingStore.js',
  /export const addRatePlan = \(plan\) => \{([\s\S]*?)window\.dispatchEvent\(new Event\('ratesPricingUpdate'\)\);\s*\}/,
  `export const addRatePlan = (plan) => {$1window.dispatchEvent(new Event('ratesPricingUpdate'));
  try { addAuditLog({ module: 'Rate & Pricing', action: 'Created Rate Plan', recordId: plan.id, description: \`Rate plan \${plan.name} created.\`, importance: 'Important' }); } catch(e) {}
}`
);

// Restaurant
replaceRegex('src/features/restaurant/pages/restaurantStore.js',
  /export const addOrder = \(order\) => \{([\s\S]*?)window\.dispatchEvent\(new Event\('restaurantUpdate'\)\);\s*\}/,
  `export const addOrder = (order) => {$1window.dispatchEvent(new Event('restaurantUpdate'));
  try { addAuditLog({ module: 'Restaurant', action: 'Created Order', recordId: order.id, description: \`Order \${order.id} created.\`, importance: 'Normal' }); } catch(e) {}
}`
);

// Todays Attendance
replaceRegex('src/pages/HR/Attendance/useTodaysAttendance.js',
  /localStorage\.setItem\(ATTENDANCE_STORAGE_KEY, JSON\.stringify\(nextRecords\)\);/,
  `localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(nextRecords));
      try { 
        if (typeof addAuditLog === 'function') {
           addAuditLog({ module: 'Human Resources', action: 'Updated Attendance', description: \`Attendance records updated.\`, importance: 'Normal' }); 
        }
      } catch(e) {}`
);

console.log("All patches applied.");
