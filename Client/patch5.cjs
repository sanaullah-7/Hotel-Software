const fs = require('fs');

function patchRegex(filePath, patches) {
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

    let modified = false;
    for (const p of patches) {
        if (p.pattern.test(content)) {
            content = content.replace(p.pattern, p.replacement);
            modified = true;
            console.log(`Regex matched in ${filePath}`);
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

patchRegex('src/features/payment-billing/pages/paymentBillingStore.js', [
    {
        pattern: /const updated = \[invoiceWithId, \.\.\.invoices\];[\s\n]*saveInvoices\(updated\);[\s\n]*return updated;/,
        replacement: `const updated = [invoiceWithId, ...invoices];
  saveInvoices(updated);
  try { addAuditLog({ module: 'Payment & Billing', action: 'Created Invoice', recordId: invoiceWithId.invoiceNumber, description: \`Invoice \${invoiceWithId.invoiceNumber} created.\`, importance: 'Important' }); } catch(e) {}
  return updated;`
    },
    {
        pattern: /saveInvoices\(updated\);[\s\n]*return updated;[\s\n]*\};[\s\n]*export const deleteInvoice = \(invoiceId\) => \{/,
        replacement: `saveInvoices(updated);
  try { addAuditLog({ module: 'Payment & Billing', action: 'Updated Invoice', recordId: invoiceId, description: \`Invoice \${invoiceId} updated.\`, importance: 'Normal' }); } catch(e) {}
  return updated;
};
export const deleteInvoice = (invoiceId) => {`
    },
    {
        pattern: /saveInvoices\(updated\);[\s\n]*return updated;[\s\n]*\};[\s\n]*export const addPayment = \(paymentData\) => \{/,
        replacement: `saveInvoices(updated);
  try { addAuditLog({ module: 'Payment & Billing', action: 'Deleted Invoice', recordId: invoiceId, description: \`Invoice \${invoiceId} deleted.\`, importance: 'Critical' }); } catch(e) {}
  return updated;
};
export const addPayment = (paymentData) => {`
    },
    {
        pattern: /saveInvoices\(invoices\);[\s\n]*return newPayment;[\s\n]*\};/,
        replacement: `saveInvoices(invoices);
  try { addAuditLog({ module: 'Payment & Billing', action: 'Processed Payment', recordId: newPayment.paymentId, description: \`Payment \${newPayment.paymentId} processed for \${newPayment.amount}.\`, importance: 'Important' }); } catch(e) {}
  return newPayment;
};`
    },
    {
        pattern: /saveInvoices\(updated\);[\s\n]*return newRefund;[\s\n]*\};/,
        replacement: `saveInvoices(updated);
  try { addAuditLog({ module: 'Payment & Billing', action: 'Processed Refund', recordId: newRefund.refundId, description: \`Refund \${newRefund.refundId} processed.\`, importance: 'Critical' }); } catch(e) {}
  return newRefund;
};`
    }
]);

// housekeeping hkStore.js
patchRegex('src/features/housekeeping/pages/hkStore.js', [
    {
        pattern: /saveTasks\(\[nextTask, \.\.\.tasks\]\);[\s\n]*return nextTask;/,
        replacement: `saveTasks([nextTask, ...tasks]);
  try { addAuditLog({ module: 'Housekeeping', action: 'Created Task', recordId: nextTask.taskId, description: \`Task \${nextTask.taskId} created.\`, importance: 'Normal' }); } catch(e) {}
  return nextTask;`
    },
    {
        pattern: /saveTasks\(updated\);[\s\n]*return updated\.find\(\(t\) => t\.id === taskId \|\| t\.taskId === taskId\);/,
        replacement: `saveTasks(updated);
  try { addAuditLog({ module: 'Housekeeping', action: 'Updated Task', recordId: taskId, description: \`Task \${taskId} updated.\`, importance: 'Normal' }); } catch(e) {}
  return updated.find((t) => t.id === taskId || t.taskId === taskId);`
    }
]);

// inventoryStore.js
patchRegex('src/features/inventory/pages/inventoryStore.js', [
    {
        pattern: /saveStock\(\[nextItem, \.\.\.stock\]\);[\s\n]*return nextItem;/,
        replacement: `saveStock([nextItem, ...stock]);
  try { addAuditLog({ module: 'Inventory', action: 'Added Stock', recordId: nextItem.sku, description: \`Stock \${nextItem.sku} added.\`, importance: 'Normal' }); } catch(e) {}
  return nextItem;`
    },
    {
        pattern: /saveStock\(updated\);[\s\n]*return updated\.find\(\(i\) => i\.id === itemId \|\| i\.sku === itemId\);/,
        replacement: `saveStock(updated);
  try { addAuditLog({ module: 'Inventory', action: 'Updated Stock', recordId: itemId, description: \`Stock \${itemId} updated.\`, importance: 'Normal' }); } catch(e) {}
  return updated.find((i) => i.id === itemId || i.sku === itemId);`
    }
]);

// restaurantStore.js
patchRegex('src/features/restaurant/pages/restaurantStore.js', [
    {
        pattern: /saveOrders\(\[nextOrder, \.\.\.orders\]\);[\s\n]*return nextOrder;/,
        replacement: `saveOrders([nextOrder, ...orders]);
  try { addAuditLog({ module: 'Restaurant', action: 'Created Order', recordId: nextOrder.orderId, description: \`Order \${nextOrder.orderId} created.\`, importance: 'Normal' }); } catch(e) {}
  return nextOrder;`
    },
    {
        pattern: /saveOrders\(updated\);[\s\n]*return updated\.find\(\(o\) => o\.id === orderId \|\| o\.orderId === orderId\);/,
        replacement: `saveOrders(updated);
  try { addAuditLog({ module: 'Restaurant', action: 'Updated Order', recordId: orderId, description: \`Order \${orderId} updated.\`, importance: 'Normal' }); } catch(e) {}
  return updated.find((o) => o.id === orderId || o.orderId === orderId);`
    }
]);

// ratesPricingStore.js
patchRegex('src/features/rates-pricing/pages/ratesPricingStore.js', [
    {
        pattern: /saveRatePlans\(\[nextPlan, \.\.\.plans\]\);[\s\n]*return nextPlan;/,
        replacement: `saveRatePlans([nextPlan, ...plans]);
  try { addAuditLog({ module: 'Rate & Pricing', action: 'Created Rate Plan', recordId: nextPlan.planCode, description: \`Rate Plan \${nextPlan.planCode} created.\`, importance: 'Important' }); } catch(e) {}
  return nextPlan;`
    },
    {
        pattern: /saveRatePlans\(updated\);[\s\n]*return updated\.find\(\(p\) => p\.id === planId \|\| p\.planCode === planId\);/,
        replacement: `saveRatePlans(updated);
  try { addAuditLog({ module: 'Rate & Pricing', action: 'Updated Rate Plan', recordId: planId, description: \`Rate Plan \${planId} updated.\`, importance: 'Normal' }); } catch(e) {}
  return updated.find((p) => p.id === planId || p.planCode === planId);`
    }
]);

console.log('Done');
