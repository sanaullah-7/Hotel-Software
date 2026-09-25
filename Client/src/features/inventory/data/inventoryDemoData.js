export const INVENTORY_CATEGORIES = [
  'All Categories',
  'Bathroom',
  'Bedroom',
  'Electronics',
  'Furniture',
  'Kitchen',
  'Cleaning',
  'Amenities',
  'Linens'
];

export const INVENTORY_STATUSES = [
  'All Statuses',
  'Available',
  'Low Stock',
  'Out of Stock',
  'Missing'
];

export const CHARGE_TYPES = [
  'All Types',
  'Consumption',
  'Damage',
  'External Order',
  'Service Fee'
];

export const CHARGE_STATUSES = [
  'All Statuses',
  'Added to Folio',
  'Pending',
  'Paid'
];

export const ROOM_NUMBERS = [
  '101', '102', '103', '104', '105',
  '201', '202', '203', '204', '205',
  '301', '302', '303', '304', '305'
];

export const STORAGE_LOCATIONS = [
  'Central Linen Storage (Basement)',
  'Housekeeping Closet (Floor 1)',
  'Housekeeping Closet (Floor 2)',
  'Housekeeping Closet (Floor 3)',
  'Main Maintenance Depot',
  'Kitchen & Dining Pantry',
  'Front Desk Supply Cabinet'
];

export const INITIAL_INVENTORY_ITEMS = [
  {
    id: 'INV-1001',
    sku: 'BTH-TWL-001',
    itemName: 'Bath Towel (Egyptian Cotton)',
    category: 'Bathroom',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Bathroom',
    quantity: 4,
    unitPrice: 12.50,
    totalValue: 50.00,
    minimumStock: 2,
    condition: 'Good',
    status: 'Available',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: '2026-06-15',
    lastUpdated: '2026-09-12',
    description: '600 GSM white premium plush cotton bath towels with hotel embroidery.',
    notes: 'Restocked during checkout turnaround.'
  },
  {
    id: 'INV-1002',
    sku: 'BTH-HND-002',
    itemName: 'Hand Towel',
    category: 'Bathroom',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Bathroom',
    quantity: 2,
    unitPrice: 6.00,
    totalValue: 12.00,
    minimumStock: 2,
    condition: 'Good',
    status: 'Available',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: '2026-06-15',
    lastUpdated: '2026-09-12',
    description: 'Pure cotton hand towels 40x70cm.',
    notes: 'Good condition.'
  },
  {
    id: 'INV-1003',
    sku: 'BTH-SOP-005',
    itemName: 'Organic Soap Bar (50g)',
    category: 'Bathroom',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Bathroom Vanity',
    quantity: 2,
    unitPrice: 1.80,
    totalValue: 3.60,
    minimumStock: 2,
    condition: 'New',
    status: 'Available',
    supplier: 'EcoSpa Amenities Ltd.',
    purchaseDate: '2026-08-01',
    lastUpdated: '2026-09-14',
    description: 'Lemongrass scented herbal guest soap.',
    notes: 'Freshly placed.'
  },
  {
    id: 'INV-1004',
    sku: 'BED-SH-012',
    itemName: 'King Satin Bed Sheet Set',
    category: 'Bedroom',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - King Bed',
    quantity: 1,
    unitPrice: 45.00,
    totalValue: 45.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: '2026-05-10',
    lastUpdated: '2026-09-10',
    description: '400 thread count Egyptian satin cotton sheet set.',
    notes: 'Regular wash cycle.'
  },
  {
    id: 'INV-1005',
    sku: 'ELC-TV-055',
    itemName: '55" 4K Smart OLED TV',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Media Console',
    quantity: 1,
    unitPrice: 750.00,
    totalValue: 750.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'TechVision Global Inc.',
    purchaseDate: '2025-11-20',
    lastUpdated: '2026-09-01',
    description: 'Wall mounted 4K Smart OLED TV with hotel guest streaming app.',
    notes: 'Firmware v4.2 installed.'
  },
  {
    id: 'INV-1006',
    sku: 'ELC-KTL-003',
    itemName: 'Electric Stainless Tea Kettle (1.5L)',
    category: 'Kitchen',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Hospitality Tray',
    quantity: 1,
    unitPrice: 32.00,
    totalValue: 32.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'KitchenPro Hotel Equipment',
    purchaseDate: '2026-02-14',
    lastUpdated: '2026-09-14',
    description: 'Auto shutoff quick-boil cordless kettle.',
    notes: 'Descaled bi-weekly.'
  },
  {
    id: 'INV-1007',
    sku: 'FUR-CHR-009',
    itemName: 'Ergonomic Executive Desk Chair',
    category: 'Furniture',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Work Desk',
    quantity: 1,
    unitPrice: 180.00,
    totalValue: 180.00,
    minimumStock: 1,
    condition: 'Fair',
    status: 'Available',
    supplier: 'Nordic Craft Furniture',
    purchaseDate: '2025-08-10',
    lastUpdated: '2026-09-05',
    description: 'Genuine leather swivel desk chair with lumbar support.',
    notes: 'Minor armrest wear.'
  },
  {
    id: 'INV-1008',
    sku: 'BTH-ROB-008',
    itemName: 'Plush Microfiber Bathrobe',
    category: 'Bathroom',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Closet',
    quantity: 2,
    unitPrice: 35.00,
    totalValue: 70.00,
    minimumStock: 2,
    condition: 'Good',
    status: 'Available',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: '2026-04-01',
    lastUpdated: '2026-09-12',
    description: 'Kimono collar luxury hotel bathrobe.',
    notes: 'Sanitized after every checkout.'
  },
  {
    id: 'INV-1009',
    sku: 'BTH-TWL-999',
    itemName: 'Luxury Bath Sheet (Storage Reserve)',
    category: 'Bathroom',
    locationType: 'Storage',
    roomNumber: null,
    location: 'Housekeeping Closet (Floor 2)',
    quantity: 24,
    unitPrice: 15.00,
    totalValue: 360.00,
    minimumStock: 10,
    condition: 'New',
    status: 'Available',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: '2026-08-20',
    lastUpdated: '2026-09-15',
    description: 'Backup bath sheets reserved for floor 2 suite turnover.',
    notes: 'Sealed in protective packaging.'
  },
  {
    id: 'INV-1010',
    sku: 'AMN-SHM-500',
    itemName: 'Luxury Lavender Shampoo (250ml)',
    category: 'Amenities',
    locationType: 'Storage',
    roomNumber: null,
    location: 'Central Linen Storage (Basement)',
    quantity: 150,
    unitPrice: 2.20,
    totalValue: 330.00,
    minimumStock: 50,
    condition: 'New',
    status: 'Available',
    supplier: 'EcoSpa Amenities Ltd.',
    purchaseDate: '2026-09-01',
    lastUpdated: '2026-09-20',
    description: 'Bulk eco refill bottles of lavender soothing shampoo.',
    notes: 'Expiry date: 2028-09.'
  }
];

export const INITIAL_GUEST_CHARGES = [
  {
    id: 'GC-4821',
    guestName: 'Robert Langdon',
    roomNumber: '203',
    chargeType: 'Consumption',
    itemName: 'Mini Bar - Premium Red Wine (750ml)',
    inventoryItemId: 'INV-1011',
    quantity: 1,
    unitPrice: 45.00,
    amount: 45.00,
    status: 'Added to Folio',
    date: '2026-09-24',
    reportedDate: '2026-09-24',
    folioId: 'FOL-203-88',
    notes: 'Consumed from minibar inventory.',
    deductedFromStock: true
  },
  {
    id: 'GC-4822',
    guestName: 'Eleanor Vance',
    roomNumber: '304',
    chargeType: 'Damage',
    itemName: 'Stained Velvet Decorative Pillow',
    inventoryItemId: 'INV-1012',
    quantity: 1,
    unitPrice: 35.00,
    amount: 35.00,
    status: 'Pending',
    date: '2026-09-25',
    reportedDate: '2026-09-25',
    folioId: 'FOL-304-12',
    notes: 'Irreparable wine stain during stay.',
    deductedFromStock: true
  }
];

export const INITIAL_MISSING_INCIDENTS = [
  {
    id: 'INC-2026-01',
    inventoryItemId: 'INV-1008',
    sku: 'BTH-ROB-008',
    itemName: 'Plush Microfiber Bathrobe',
    category: 'Bathroom',
    location: 'Room 203 - Closet',
    quantity: 1,
    unitLoss: 35.00,
    totalLoss: 35.00,
    reportedBy: 'Housekeeping - Anna',
    reportedDate: '2026-09-22',
    status: 'Under Investigation',
    guestName: 'Marcus Aurelius',
    roomNumber: '203',
    notes: 'Missing after checkout inspection.',
    timeline: [
      { date: '2026-09-22 11:30', action: 'Reported Missing', user: 'Housekeeping - Anna', detail: 'Bathrobe missing during checkout audit.' }
    ]
  }
];
