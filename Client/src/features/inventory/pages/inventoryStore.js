import { addAuditLog } from '../../audit/state/auditStore.js';
import {
  INVENTORY_CATEGORIES,
  INVENTORY_STATUSES,
  CHARGE_TYPES,
  CHARGE_STATUSES,
  ROOM_NUMBERS,
  STORAGE_LOCATIONS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_GUEST_CHARGES,
  INITIAL_MISSING_INCIDENTS
} from '../data/inventoryDemoData.js';

export {
  INVENTORY_CATEGORIES,
  INVENTORY_STATUSES,
  CHARGE_TYPES,
  CHARGE_STATUSES,
  ROOM_NUMBERS,
  STORAGE_LOCATIONS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_GUEST_CHARGES,
  INITIAL_MISSING_INCIDENTS
};

// LocalStorage helpers with automatic initialization
const STORAGE_KEY_ITEMS = 'hotel_inventory_items_v2';
const STORAGE_KEY_INCIDENTS = 'hotel_inventory_incidents_v2';
const STORAGE_KEY_CHARGES = 'hotel_guest_charges_v2';

export const getInventoryItems = () => {
  const data = localStorage.getItem(STORAGE_KEY_ITEMS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_INVENTORY_ITEMS));
    return INITIAL_INVENTORY_ITEMS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_INVENTORY_ITEMS;
  }
};

export const saveInventoryItems = (items) => {
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  window.dispatchEvent(new Event('inventory_update'));
  try { addAuditLog({ module: 'Inventory', action: 'Updated Record', description: 'Inventory items saved.', importance: 'Normal' }); } catch(e){}
};

export const getMissingIncidents = () => {
  const data = localStorage.getItem(STORAGE_KEY_INCIDENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(INITIAL_MISSING_INCIDENTS));
    return INITIAL_MISSING_INCIDENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MISSING_INCIDENTS;
  }
};

export const saveMissingIncidents = (incidents) => {
  localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
  window.dispatchEvent(new Event('inventory_incidents_update'));
  try { addAuditLog({ module: 'Inventory', action: 'Updated Record', description: 'Missing incidents saved.', importance: 'Normal' }); } catch(e){}
};

// CRUD Operations
export const addInventoryItem = (item) => {
  const items = getInventoryItems();
  const newItem = {
    ...item,
    id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    sku: item.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    totalValue: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    minimumStock: Number(item.minimumStock) || 0,
    lastUpdated: new Date().toISOString().split('T')[0],
    purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0],
  };

  if (newItem.quantity === 0) {
    newItem.status = newItem.status === 'Missing' ? 'Missing' : 'Out of Stock';
  } else if (newItem.quantity <= newItem.minimumStock) {
    newItem.status = 'Low Stock';
  } else {
    newItem.status = 'Available';
  }

  const updated = [newItem, ...items];
  saveInventoryItems(updated);
  return newItem;
};

export const updateInventoryItem = (id, updates) => {
  const items = getInventoryItems();
  const updated = items.map(item => {
    if (item.id === id) {
      const merged = { ...item, ...updates };
      merged.quantity = Number(merged.quantity) || 0;
      merged.unitPrice = Number(merged.unitPrice) || 0;
      merged.totalValue = merged.quantity * merged.unitPrice;
      merged.minimumStock = Number(merged.minimumStock) || 0;
      merged.lastUpdated = new Date().toISOString().split('T')[0];

      if (merged.quantity === 0) {
        merged.status = merged.status === 'Missing' ? 'Missing' : 'Out of Stock';
      } else if (merged.quantity <= merged.minimumStock) {
        merged.status = 'Low Stock';
      } else {
        merged.status = 'Available';
      }
      return merged;
    }
    return item;
  });
  saveInventoryItems(updated);
  return updated;
};

export const deleteInventoryItem = (id) => {
  const items = getInventoryItems();
  const updated = items.filter(item => item.id !== id);
  saveInventoryItems(updated);
  return updated;
};

export const reportMissingIncident = (incidentData) => {
  const incidents = getMissingIncidents();
  const items = getInventoryItems();
  const targetItem = items.find(i => i.id === incidentData.inventoryItemId);

  const missingQty = Number(incidentData.quantity) || 1;
  const unitValue = targetItem ? targetItem.unitPrice : (Number(incidentData.unitValue) || 25);
  const totalLoss = missingQty * unitValue;

  const timestamp = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newIncident = {
    id: `MI-${Math.floor(10000 + Math.random() * 90000)}`,
    incidentNumber: `MI-${Math.floor(10000 + Math.random() * 90000)}`,
    inventoryItemId: incidentData.inventoryItemId,
    itemName: targetItem ? targetItem.itemName : (incidentData.itemName || 'Inventory Item'),
    category: targetItem ? targetItem.category : (incidentData.category || 'General'),
    roomNumber: incidentData.roomNumber || (targetItem ? targetItem.roomNumber : 'N/A'),
    location: incidentData.location || (targetItem ? targetItem.location : 'Hotel Premises'),
    expectedQty: targetItem ? targetItem.quantity : missingQty,
    quantity: missingQty,
    missingQty: missingQty,
    unitValue: unitValue,
    totalLoss: totalLoss,
    condition: 'Missing',
    reportedDate: 'Today',
    reportedBy: incidentData.reportedBy || 'Housekeeping Staff',
    reason: incidentData.reason || 'Missing item logged during routine inspection',
    status: 'Reported',
    assignedTo: incidentData.assignedTo || 'Housekeeping Supervisor',
    guestName: incidentData.guestName || 'N/A',
    notes: incidentData.notes || '',
    timeline: [
      { date: timestamp, action: 'Logged Missing', user: incidentData.reportedBy || 'Housekeeping', detail: incidentData.reason || 'Missing item logged' }
    ]
  };

  if (targetItem) {
    const newQty = Math.max(0, targetItem.quantity - missingQty);
    updateInventoryItem(targetItem.id, {
      quantity: newQty,
      status: newQty === 0 ? 'Out of Stock' : 'Missing'
    });
  }

  const updatedIncidents = [newIncident, ...incidents];
  saveMissingIncidents(updatedIncidents);
  return newIncident;
};

export const addMissingIncident = reportMissingIncident;

export const updateIncidentStatus = (incidentId, newStatus, resolutionData = {}) => {
  const incidents = getMissingIncidents();
  const timestamp = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const updatedIncidents = incidents.map(inc => {
    if (inc.id === incidentId) {
      const timelineEntry = {
        date: timestamp,
        action: `Status changed to ${newStatus}`,
        user: resolutionData.user || 'Supervisor',
        detail: resolutionData.resolutionNotes || `Incident progressed to ${newStatus}`
      };

      const updated = {
        ...inc,
        status: newStatus,
        ...resolutionData,
        timeline: [...(inc.timeline || []), timelineEntry]
      };

      if (['Recovered', 'Replaced', 'Written Off'].includes(newStatus)) {
        updated.resolutionType = newStatus;
        updated.resolutionDate = new Date().toISOString().split('T')[0];
        if (resolutionData.resolutionNotes) {
          updated.resolutionNotes = resolutionData.resolutionNotes;
        }
      }

      return updated;
    }
    return inc;
  });

  saveMissingIncidents(updatedIncidents);

  const incident = incidents.find(i => i.id === incidentId);
  if (incident && incident.inventoryItemId) {
    if (newStatus === 'Recovered' || newStatus === 'Replaced') {
      updateInventoryItem(incident.inventoryItemId, {
        status: 'Available',
        quantity: Math.max(1, incident.quantity)
      });
    } else if (newStatus === 'Written Off') {
      updateInventoryItem(incident.inventoryItemId, {
        status: 'Out of Stock',
        quantity: 0
      });
    }
  }
};

// Metric Calculations
export const computeInventoryMetrics = (items) => {
  const totalCount = items.length;
  const totalQuantity = items.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const availableStock = items.filter(i => i.status === 'Available').length;
  const lowStock = items.filter(i => i.status === 'Low Stock').length;
  const missingItems = items.filter(i => i.status === 'Missing').length;
  const outOfStock = items.filter(i => i.status === 'Out of Stock').length;
  const totalValuation = items.reduce((acc, curr) => acc + (Number(curr.totalValue) || 0), 0);

  return {
    totalCount,
    totalQuantity,
    availableStock,
    lowStock,
    missingItems,
    outOfStock,
    totalValuation
  };
};

export const computeIncidentMetrics = (incidents) => {
  const openIncidents = incidents.filter(i => i.status === 'Reported').length;
  const underInvestigation = incidents.filter(i => i.status === 'Under Investigation').length;
  const recovered = incidents.filter(i => i.status === 'Recovered').length;
  const replaced = incidents.filter(i => i.status === 'Replaced').length;
  const writtenOff = incidents.filter(i => i.status === 'Written Off').length;
  const totalLoss = incidents
    .filter(i => ['Reported', 'Under Investigation', 'Written Off'].includes(i.status))
    .reduce((acc, curr) => acc + (Number(curr.totalLoss) || 0), 0);

  return {
    total: incidents.length,
    openIncidents,
    underInvestigation,
    recovered,
    replaced,
    writtenOff,
    totalLoss
  };
};

export const getRoomInventoryBreakdown = (roomNumber, items) => {
  const roomItems = items.filter(item => item.roomNumber === roomNumber);
  const byCategory = {};
  roomItems.forEach(item => {
    if (!byCategory[item.category]) {
      byCategory[item.category] = [];
    }
    byCategory[item.category].push(item);
  });
  return {
    roomNumber,
    items: roomItems,
    byCategory,
    totalItems: roomItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    totalValue: roomItems.reduce((sum, item) => sum + (Number(item.totalValue) || 0), 0)
  };
};

export const getStorageReserveForItem = (item, allItems = []) => {
  if (!item) return null;
  const storageItems = allItems.filter(i => i.locationType === 'Storage');
  const exactMatch = storageItems.find(i => i.sku === item.sku);
  if (exactMatch) {
    return {
      availableUnits: exactMatch.quantity,
      location: exactMatch.location,
      status: exactMatch.status
    };
  }
  const categoryMatches = storageItems.filter(i => i.category === item.category);
  if (categoryMatches.length > 0) {
    const totalCatUnits = categoryMatches.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    return {
      availableUnits: totalCatUnits,
      location: 'Central Storage Depots',
      status: totalCatUnits > 0 ? 'Available' : 'Out of Stock'
    };
  }
  return null;
};

// Guest Charges Store & Helpers
export const getGuestCharges = () => {
  const data = localStorage.getItem(STORAGE_KEY_CHARGES);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_CHARGES, JSON.stringify(INITIAL_GUEST_CHARGES));
    return INITIAL_GUEST_CHARGES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_GUEST_CHARGES;
  }
};

export const saveGuestCharges = (charges) => {
  localStorage.setItem(STORAGE_KEY_CHARGES, JSON.stringify(charges));
  window.dispatchEvent(new Event('guest_charges_update'));
  try { addAuditLog({ module: 'Inventory', action: 'Created Record', description: 'addInventoryItem was called.', importance: 'Normal' }); } catch(e){}
};

export const addGuestCharge = (chargeData) => {
  const charges = getGuestCharges();
  const quantity = Number(chargeData.quantity) || 1;
  const unitPrice = Number(chargeData.unitPrice) || 0;
  const amount = Number(chargeData.amount) || (quantity * unitPrice);

  const newCharge = {
    ...chargeData,
    id: `GC-${Math.floor(1000 + Math.random() * 9000)}`,
    guestName: chargeData.guestName ? chargeData.guestName.trim() : 'Guest',
    roomNumber: chargeData.roomNumber || '205',
    chargeType: chargeData.chargeType || 'Consumption',
    itemName: chargeData.itemName ? chargeData.itemName.trim() : 'Hotel Service / Item',
    inventoryItemId: chargeData.inventoryItemId || null,
    quantity: quantity,
    unitPrice: unitPrice,
    amount: amount,
    status: chargeData.status || 'Added to Folio',
    date: chargeData.date || 'Today',
    reportedDate: chargeData.reportedDate || new Date().toISOString().split('T')[0],
    folioId: chargeData.folioId || `FOL-${chargeData.roomNumber || '205'}-${Math.floor(10 + Math.random() * 90)}`,
    notes: chargeData.notes ? chargeData.notes.trim() : '',
    deductedFromStock: chargeData.chargeType === 'Consumption' || chargeData.chargeType === 'Damage'
  };

  if (newCharge.deductedFromStock && newCharge.inventoryItemId) {
    const items = getInventoryItems();
    const targetItem = items.find(i => i.id === newCharge.inventoryItemId);
    if (targetItem) {
      const newQty = Math.max(0, (Number(targetItem.quantity) || 0) - quantity);
      updateInventoryItem(targetItem.id, {
        quantity: newQty,
        status: newQty === 0 ? 'Out of Stock' : newQty <= targetItem.minimumStock ? 'Low Stock' : targetItem.status
      });
    }
  }

  const updatedCharges = [newCharge, ...charges];
  saveGuestCharges(updatedCharges);
  return newCharge;
};

export const updateGuestCharge = (id, updates) => {
  const charges = getGuestCharges();
  const updatedCharges = charges.map(ch => {
    if (ch.id === id) {
      const merged = { ...ch, ...updates };
      merged.quantity = Number(merged.quantity) || 1;
      merged.unitPrice = Number(merged.unitPrice) || 0;
      merged.amount = merged.amount !== undefined ? Number(merged.amount) : (merged.quantity * merged.unitPrice);
      return merged;
    }
    return ch;
  });
  saveGuestCharges(updatedCharges);
};

export const deleteGuestCharge = (id) => {
  const charges = getGuestCharges();
  const updatedCharges = charges.filter(ch => ch.id !== id);
  saveGuestCharges(updatedCharges);
};

export const computeGuestChargeMetrics = (charges) => {
  const totalCount = charges.length;
  const totalAmount = charges.reduce((sum, ch) => sum + (Number(ch.amount) || 0), 0);
  
  const addedToFolio = charges.filter(ch => ch.status === 'Added to Folio');
  const addedToFolioAmount = addedToFolio.reduce((sum, ch) => sum + (Number(ch.amount) || 0), 0);

  const pending = charges.filter(ch => ch.status === 'Pending');
  const pendingAmount = pending.reduce((sum, ch) => sum + (Number(ch.amount) || 0), 0);

  const paid = charges.filter(ch => ch.status === 'Paid');
  const paidAmount = paid.reduce((sum, ch) => sum + (Number(ch.amount) || 0), 0);

  const consumption = charges.filter(ch => ch.chargeType === 'Consumption');
  const consumptionAmount = consumption.reduce((sum, ch) => sum + (Number(ch.amount) || 0), 0);

  const damage = charges.filter(ch => ch.chargeType === 'Damage');
  const damageAmount = damage.reduce((sum, ch) => sum + (Number(ch.amount) || 0), 0);

  const externalOrder = charges.filter(ch => ch.chargeType === 'External Order');
  const externalOrderAmount = externalOrder.reduce((sum, ch) => sum + (Number(ch.amount) || 0), 0);

  return {
    totalCount,
    totalAmount,
    addedToFolioCount: addedToFolio.length,
    addedToFolioAmount,
    pendingCount: pending.length,
    pendingAmount,
    paidCount: paid.length,
    paidAmount,
    consumptionCount: consumption.length,
    consumptionAmount,
    damageCount: damage.length,
    damageAmount,
    externalOrderCount: externalOrder.length,
    externalOrderAmount
  };
};
