const fs = require('fs');

function patchStoreExact(filePath, patches) {
    if (!fs.existsSync(filePath)) {
        console.log(`Not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Add import if missing
    if (!content.includes('addAuditLog')) {
        const depth = filePath.split('/').length - 3;
        const up = '../'.repeat(depth);
        const importStmt = `import { addAuditLog } from '${up}audit/state/auditStore.js';\n`;
        content = importStmt + content;
    }

    // Replace
    for (const p of patches) {
        if (content.includes(p.target)) {
            content = content.replace(p.target, p.replacement);
            console.log(`Replaced in ${filePath}`);
        } else {
            console.log(`Could not find target in ${filePath}`);
            console.log("Target was:", p.target);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

// 1. paymentBillingStore.js
patchStoreExact('src/features/payment-billing/pages/paymentBillingStore.js', [
    {
        target: "  const updated = [invoiceWithId, ...invoices];\n  saveInvoices(updated);\n  return updated;",
        replacement: "  const updated = [invoiceWithId, ...invoices];\n  saveInvoices(updated);\n  try { addAuditLog({ module: 'Payment & Billing', action: 'Created Invoice', recordId: invoiceWithId.invoiceNumber, description: `Invoice ${invoiceWithId.invoiceNumber} created.`, importance: 'Important' }); } catch(e) {}\n  return updated;"
    },
    {
        target: "  saveInvoices(updated);\n  return updated;\n};\n\nexport const deleteInvoice = (invoiceId) => {",
        replacement: "  saveInvoices(updated);\n  try { addAuditLog({ module: 'Payment & Billing', action: 'Updated Invoice', recordId: invoiceId, description: `Invoice ${invoiceId} updated.`, importance: 'Normal' }); } catch(e) {}\n  return updated;\n};\n\nexport const deleteInvoice = (invoiceId) => {"
    },
    {
        target: "  saveInvoices(updated);\n  return updated;\n};\n\nexport const addPayment = (paymentData) => {",
        replacement: "  saveInvoices(updated);\n  try { addAuditLog({ module: 'Payment & Billing', action: 'Deleted Invoice', recordId: invoiceId, description: `Invoice ${invoiceId} deleted.`, importance: 'Critical' }); } catch(e) {}\n  return updated;\n};\n\nexport const addPayment = (paymentData) => {"
    },
    {
        target: "  saveInvoices(invoices);\n  return newPayment;\n};",
        replacement: "  saveInvoices(invoices);\n  try { addAuditLog({ module: 'Payment & Billing', action: 'Processed Payment', recordId: newPayment.paymentId, description: `Payment ${newPayment.paymentId} processed for ${newPayment.amount}.`, importance: 'Important' }); } catch(e) {}\n  return newPayment;\n};"
    },
    {
        target: "  saveInvoices(updated);\n  return newRefund;\n};",
        replacement: "  saveInvoices(updated);\n  try { addAuditLog({ module: 'Payment & Billing', action: 'Processed Refund', recordId: newRefund.refundId, description: `Refund ${newRefund.refundId} processed.`, importance: 'Critical' }); } catch(e) {}\n  return newRefund;\n};"
    }
]);

// 2. housekeeping hkStore.js
patchStoreExact('src/features/housekeeping/pages/hkStore.js', [
    {
        target: "  saveTasks(updated);\n  return nextTask;",
        replacement: "  saveTasks(updated);\n  try { addAuditLog({ module: 'Housekeeping', action: 'Created Task', recordId: nextTask.taskId, description: `Task ${nextTask.taskId} created.`, importance: 'Normal' }); } catch(e) {}\n  return nextTask;"
    },
    {
        target: "  saveTasks(updated);\n  return updated.find(t => t.id === taskId || t.taskId === taskId);\n}",
        replacement: "  saveTasks(updated);\n  try { addAuditLog({ module: 'Housekeeping', action: 'Updated Task', recordId: taskId, description: `Task ${taskId} updated.`, importance: 'Normal' }); } catch(e) {}\n  return updated.find(t => t.id === taskId || t.taskId === taskId);\n}"
    }
]);

// 3. inventoryStore.js
patchStoreExact('src/features/inventory/pages/inventoryStore.js', [
    {
        target: "  saveStock(updated);\n  return nextItem;",
        replacement: "  saveStock(updated);\n  try { addAuditLog({ module: 'Inventory', action: 'Added Stock', recordId: nextItem.sku, description: `Stock ${nextItem.sku} added.`, importance: 'Normal' }); } catch(e) {}\n  return nextItem;"
    },
    {
        target: "  saveStock(updated);\n  return updated.find(i => i.id === itemId || i.sku === itemId);\n}",
        replacement: "  saveStock(updated);\n  try { addAuditLog({ module: 'Inventory', action: 'Updated Stock', recordId: itemId, description: `Stock ${itemId} updated.`, importance: 'Normal' }); } catch(e) {}\n  return updated.find(i => i.id === itemId || i.sku === itemId);\n}"
    }
]);

// 4. restaurantStore.js
patchStoreExact('src/features/restaurant/pages/restaurantStore.js', [
    {
        target: "  saveOrders([nextOrder, ...orders]);\n  return nextOrder;",
        replacement: "  saveOrders([nextOrder, ...orders]);\n  try { addAuditLog({ module: 'Restaurant', action: 'Created Order', recordId: nextOrder.orderId, description: `Order ${nextOrder.orderId} created.`, importance: 'Normal' }); } catch(e) {}\n  return nextOrder;"
    },
    {
        target: "  saveOrders(updated);\n  return updated.find(o => o.id === orderId || o.orderId === orderId);\n}",
        replacement: "  saveOrders(updated);\n  try { addAuditLog({ module: 'Restaurant', action: 'Updated Order', recordId: orderId, description: `Order ${orderId} updated.`, importance: 'Normal' }); } catch(e) {}\n  return updated.find(o => o.id === orderId || o.orderId === orderId);\n}"
    }
]);

// 5. ratesPricingStore.js
patchStoreExact('src/features/rates-pricing/pages/ratesPricingStore.js', [
    {
        target: "  saveRatePlans(updated);\n  return nextPlan;",
        replacement: "  saveRatePlans(updated);\n  try { addAuditLog({ module: 'Rate & Pricing', action: 'Created Rate Plan', recordId: nextPlan.planCode, description: `Rate Plan ${nextPlan.planCode} created.`, importance: 'Important' }); } catch(e) {}\n  return nextPlan;"
    },
    {
        target: "  saveRatePlans(updated);\n  return updated.find(p => p.id === planId || p.planCode === planId);\n}",
        replacement: "  saveRatePlans(updated);\n  try { addAuditLog({ module: 'Rate & Pricing', action: 'Updated Rate Plan', recordId: planId, description: `Rate Plan ${planId} updated.`, importance: 'Normal' }); } catch(e) {}\n  return updated.find(p => p.id === planId || p.planCode === planId);\n}"
    }
]);

console.log('Script done.');
