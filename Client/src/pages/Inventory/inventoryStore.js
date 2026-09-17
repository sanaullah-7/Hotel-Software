// Hotel Inventory Data Store & State Management

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
  // Room 203 specific items
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
    sku: 'BTH-SHP-006',
    itemName: 'Luxury Botanical Shampoo (60ml)',
    category: 'Bathroom',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Shower Shelf',
    quantity: 1,
    unitPrice: 2.20,
    totalValue: 2.20,
    minimumStock: 2,
    condition: 'New',
    status: 'Low Stock',
    supplier: 'EcoSpa Amenities Ltd.',
    purchaseDate: '2026-08-01',
    lastUpdated: '2026-09-14',
    description: 'Hydrating botanical shampoo miniature bottle.',
    notes: 'Needs refill during evening service.'
  },
  {
    id: 'INV-1005',
    sku: 'BED-PLW-010',
    itemName: 'Down Feather Pillow (King)',
    category: 'Bedroom',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Bed',
    quantity: 2,
    unitPrice: 28.00,
    totalValue: 56.00,
    minimumStock: 2,
    condition: 'Good',
    status: 'Available',
    supplier: 'SlumberLux Bedding Co.',
    purchaseDate: '2026-03-10',
    lastUpdated: '2026-09-08',
    description: 'Hypoallergenic goose feather & down blend pillow.',
    notes: 'Pillow protectors fitted.'
  },
  {
    id: 'INV-1006',
    sku: 'BED-BLK-012',
    itemName: 'Microfiber Thermal Blanket',
    category: 'Bedroom',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Bed & Wardrobe',
    quantity: 1,
    unitPrice: 45.00,
    totalValue: 45.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'SlumberLux Bedding Co.',
    purchaseDate: '2026-03-10',
    lastUpdated: '2026-09-08',
    description: 'Warm, breathable double-layer blanket in taupe gray.',
    notes: 'Dry cleaned weekly.'
  },
  {
    id: 'INV-1007',
    sku: 'ELC-TVR-021',
    itemName: 'Smart TV Remote Controller',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Nightstand',
    quantity: 0,
    unitPrice: 24.00,
    totalValue: 0.00,
    minimumStock: 1,
    condition: 'Fair',
    status: 'Missing',
    supplier: 'Sony Hospitality Solutions',
    purchaseDate: '2026-01-20',
    lastUpdated: '2026-09-14',
    description: 'Voice remote with Netflix and HDMI quick buttons.',
    notes: 'Missing post checkout on Sep 14. Incident MI-00024 filed.'
  },
  {
    id: 'INV-1008',
    sku: 'ELC-TVS-020',
    itemName: '55" 4K UHD Smart Hospitality TV',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Wall Mount',
    quantity: 1,
    unitPrice: 480.00,
    totalValue: 480.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Sony Hospitality Solutions',
    purchaseDate: '2026-01-20',
    lastUpdated: '2026-08-30',
    description: 'Hotel mode TV with customized welcome screen and casting.',
    notes: 'Serial #SN-492048-TV.'
  },
  {
    id: 'INV-1009',
    sku: 'ELC-ACR-025',
    itemName: 'Air Conditioner Remote',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '203',
    location: 'Room 203 - Wall Cradle',
    quantity: 1,
    unitPrice: 18.00,
    totalValue: 18.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Daikin Climate Systems',
    purchaseDate: '2025-11-15',
    lastUpdated: '2026-09-01',
    description: 'Inverter AC remote with digital display and wall bracket.',
    notes: 'Batteries replaced on Sep 1.'
  },

  // Room 101 Items
  {
    id: 'INV-1010',
    sku: 'BTH-TWL-001',
    itemName: 'Bath Towel (Egyptian Cotton)',
    category: 'Bathroom',
    locationType: 'Room',
    roomNumber: '101',
    location: 'Room 101 - Bathroom',
    quantity: 3,
    unitPrice: 12.50,
    totalValue: 37.50,
    minimumStock: 2,
    condition: 'Good',
    status: 'Available',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: '2026-06-15',
    lastUpdated: '2026-09-13',
    description: '600 GSM white premium plush cotton bath towels.',
    notes: 'Checked daily.'
  },
  {
    id: 'INV-1011',
    sku: 'BTH-DRY-015',
    itemName: 'Ionic Hair Dryer 1800W',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '101',
    location: 'Room 101 - Bathroom Cabinet',
    quantity: 1,
    unitPrice: 38.00,
    totalValue: 38.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Philips Pro Appliances',
    purchaseDate: '2026-02-14',
    lastUpdated: '2026-09-10',
    description: 'Foldable wall-mounted ionic hair dryer with cool shot.',
    notes: 'Working perfectly.'
  },
  {
    id: 'INV-1012',
    sku: 'APP-KET-030',
    itemName: 'Electric Cordless Kettle 1.2L',
    category: 'Kitchen',
    locationType: 'Room',
    roomNumber: '101',
    location: 'Room 101 - Coffee Station',
    quantity: 1,
    unitPrice: 32.00,
    totalValue: 32.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Hamilton Beach Commercial',
    purchaseDate: '2026-04-10',
    lastUpdated: '2026-09-11',
    description: 'Stainless steel double-wall electric kettle with auto shut-off.',
    notes: 'Descaled last week.'
  },

  // Room 102 Items
  {
    id: 'INV-1013',
    sku: 'ELC-TVR-021',
    itemName: 'Smart TV Remote Controller',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '102',
    location: 'Room 102 - TV Table',
    quantity: 1,
    unitPrice: 24.00,
    totalValue: 24.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Sony Hospitality Solutions',
    purchaseDate: '2026-01-20',
    lastUpdated: '2026-09-13',
    description: 'Voice remote with Netflix and HDMI quick buttons.',
    notes: 'Operational.'
  },
  {
    id: 'INV-1014',
    sku: 'FUR-IRN-040',
    itemName: 'Steam Iron & Stand Set',
    category: 'Amenities',
    locationType: 'Room',
    roomNumber: '102',
    location: 'Room 102 - Wardrobe',
    quantity: 0,
    unitPrice: 55.00,
    totalValue: 0.00,
    minimumStock: 1,
    condition: 'Damaged',
    status: 'Out of Stock',
    supplier: 'Tefal Commercial Services',
    purchaseDate: '2025-10-05',
    lastUpdated: '2026-09-14',
    description: 'Anti-calc ceramic soleplate steam iron with compact board.',
    notes: 'Sent to maintenance for cord repair.'
  },

  // Room 201 (Suite) Items
  {
    id: 'INV-1015',
    sku: 'APP-MFR-050',
    itemName: 'Silent Absorption Mini Fridge 40L',
    category: 'Kitchen',
    locationType: 'Room',
    roomNumber: '201',
    location: 'Room 201 - Living Bar',
    quantity: 1,
    unitPrice: 220.00,
    totalValue: 220.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Dometic Hospitality Tech',
    purchaseDate: '2025-12-01',
    lastUpdated: '2026-09-10',
    description: 'Silent cooling 0dB mini bar refrigerator with glass door.',
    notes: 'Stocked with beverages.'
  },
  {
    id: 'INV-1016',
    sku: 'BTH-RBE-008',
    itemName: 'Waffle Weave Bathrobe (L)',
    category: 'Bathroom',
    locationType: 'Room',
    roomNumber: '201',
    location: 'Room 201 - Master Bath',
    quantity: 0,
    unitPrice: 35.00,
    totalValue: 0.00,
    minimumStock: 2,
    condition: 'Fair',
    status: 'Missing',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: '2026-05-18',
    lastUpdated: '2026-09-15',
    description: '100% natural cotton luxury waffle robe with belt.',
    notes: 'Missing after checkout. Incident MI-00025 filed.'
  },
  {
    id: 'INV-1017',
    sku: 'FUR-LMP-062',
    itemName: 'Dimmable Bedside Lamp',
    category: 'Furniture',
    locationType: 'Room',
    roomNumber: '201',
    location: 'Room 201 - Bedside Tables',
    quantity: 2,
    unitPrice: 42.00,
    totalValue: 84.00,
    minimumStock: 2,
    condition: 'Good',
    status: 'Available',
    supplier: 'Luceo Lighting Design',
    purchaseDate: '2026-02-10',
    lastUpdated: '2026-08-20',
    description: 'Brushed brass base with integrated USB-C charging ports.',
    notes: 'Touch sensors functional.'
  },

  // Room 205 Items
  {
    id: 'INV-1018',
    sku: 'BTH-DRY-015',
    itemName: 'Ionic Hair Dryer 1800W',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '205',
    location: 'Room 205 - Bathroom Cabinet',
    quantity: 1,
    unitPrice: 38.00,
    totalValue: 38.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Philips Pro Appliances',
    purchaseDate: '2026-02-14',
    lastUpdated: '2026-09-05',
    description: 'Foldable wall-mounted ionic hair dryer.',
    notes: 'Inspected.'
  },
  {
    id: 'INV-1019',
    sku: 'BED-ST3-014',
    itemName: 'King Luxury Fitted Bedsheet Set',
    category: 'Linens',
    locationType: 'Room',
    roomNumber: '205',
    location: 'Room 205 - Master Bed',
    quantity: 1,
    unitPrice: 48.00,
    totalValue: 48.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'SlumberLux Bedding Co.',
    purchaseDate: '2026-04-01',
    lastUpdated: '2026-09-14',
    description: '400 thread count sateen stripe white bedsheet set.',
    notes: 'Freshly laundered.'
  },

  // Room 301 Items
  {
    id: 'INV-1020',
    sku: 'ELC-SPK-035',
    itemName: 'Bluetooth Alarm Clock & Speaker',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '301',
    location: 'Room 301 - Bedside Desk',
    quantity: 1,
    unitPrice: 65.00,
    totalValue: 65.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'JBL Commercial Audio',
    purchaseDate: '2026-03-25',
    lastUpdated: '2026-09-12',
    description: 'Wireless Qi charging bedside alarm clock speaker.',
    notes: 'Firmware updated.'
  },
  {
    id: 'INV-1021',
    sku: 'BTH-GLS-044',
    itemName: 'Crystal Whiskey Tumbler Set (2pc)',
    category: 'Kitchen',
    locationType: 'Room',
    roomNumber: '301',
    location: 'Room 301 - Mini Bar Cabinet',
    quantity: 0,
    unitPrice: 16.00,
    totalValue: 0.00,
    minimumStock: 1,
    condition: 'Broken',
    status: 'Missing',
    supplier: 'Schott Zwiesel Glassware',
    purchaseDate: '2026-05-10',
    lastUpdated: '2026-09-13',
    description: 'Lead-free crystal whiskey glasses with etched hotel insignia.',
    notes: 'Reported missing/broken on checkout. Incident MI-00026.'
  },

  // Central Storage / Hotel-Wide Items
  {
    id: 'INV-2001',
    sku: 'BLK-TWL-101',
    itemName: 'Bath Towels Bulk Reserve (600 GSM)',
    category: 'Linens',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Central Linen Storage (Basement)',
    quantity: 120,
    unitPrice: 10.50,
    totalValue: 1260.00,
    minimumStock: 40,
    condition: 'New',
    status: 'Available',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: '2026-07-01',
    lastUpdated: '2026-09-14',
    description: 'Bulk boxed bath towels for floor replenishment.',
    notes: '6 cartons on Shelf B2.'
  },
  {
    id: 'INV-2002',
    sku: 'BLK-PLW-105',
    itemName: 'Extra Goose Down Pillows',
    category: 'Bedroom',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Central Linen Storage (Basement)',
    quantity: 24,
    unitPrice: 24.00,
    totalValue: 576.00,
    minimumStock: 10,
    condition: 'New',
    status: 'Available',
    supplier: 'SlumberLux Bedding Co.',
    purchaseDate: '2026-07-01',
    lastUpdated: '2026-09-02',
    description: 'Individually vacuum-sealed guest request pillows.',
    notes: 'Shelf C1.'
  },
  {
    id: 'INV-2003',
    sku: 'CLN-DIS-200',
    itemName: 'Hospital-Grade Disinfectant Concentrate (5L)',
    category: 'Cleaning',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Housekeeping Closet (Floor 2)',
    quantity: 6,
    unitPrice: 34.00,
    totalValue: 204.00,
    minimumStock: 4,
    condition: 'New',
    status: 'Available',
    supplier: 'Diversey Hygiene Systems',
    purchaseDate: '2026-08-10',
    lastUpdated: '2026-09-15',
    description: 'Broad-spectrum sanitizing chemical for room touchpoints.',
    notes: 'Proper dilution instructions posted.'
  },
  {
    id: 'INV-2004',
    sku: 'CLN-VAC-210',
    itemName: 'Commercial HEPA Backpack Vacuum',
    category: 'Cleaning',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Housekeeping Closet (Floor 2)',
    quantity: 3,
    unitPrice: 310.00,
    totalValue: 930.00,
    minimumStock: 2,
    condition: 'Good',
    status: 'Available',
    supplier: 'Kärcher Professional',
    purchaseDate: '2025-11-20',
    lastUpdated: '2026-09-05',
    description: 'Quiet lightweight commercial backpack vacuum with filter bags.',
    notes: 'Filters changed Sep 1.'
  },
  {
    id: 'INV-2005',
    sku: 'AMN-KIT-305',
    itemName: 'Bamboo Dental & Shaving Kits (50/pack)',
    category: 'Amenities',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Housekeeping Closet (Floor 1)',
    quantity: 8,
    unitPrice: 22.00,
    totalValue: 176.00,
    minimumStock: 12,
    condition: 'New',
    status: 'Low Stock',
    supplier: 'EcoSpa Amenities Ltd.',
    purchaseDate: '2026-06-20',
    lastUpdated: '2026-09-15',
    description: 'Eco-friendly biodegradable dental kits with kraft packaging.',
    notes: 'Reorder triggered with supplier.'
  },
  {
    id: 'INV-2006',
    sku: 'ELC-BLB-400',
    itemName: 'Warm White LED Spotlight Bulbs 7W (Pack of 10)',
    category: 'Electronics',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Main Maintenance Depot',
    quantity: 5,
    unitPrice: 18.50,
    totalValue: 92.50,
    minimumStock: 8,
    condition: 'New',
    status: 'Low Stock',
    supplier: 'Philips Lighting Solutions',
    purchaseDate: '2026-05-30',
    lastUpdated: '2026-09-14',
    description: 'GU10 2700K warm spotlight replacement bulbs.',
    notes: 'Low stock notification sent to procurement.'
  },
  {
    id: 'INV-2007',
    sku: 'BTH-PAP-500',
    itemName: '3-Ply Embossed Toilet Rolls (48 Rolls/Case)',
    category: 'Bathroom',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Central Linen Storage (Basement)',
    quantity: 14,
    unitPrice: 28.00,
    totalValue: 392.00,
    minimumStock: 5,
    condition: 'New',
    status: 'Available',
    supplier: 'Kimberly-Clark Professional',
    purchaseDate: '2026-08-25',
    lastUpdated: '2026-09-10',
    description: 'FSC-certified soft embossed 3-ply guest bathroom paper.',
    notes: 'Adequate stock.'
  },
  {
    id: 'INV-2008',
    sku: 'ELC-TVR-021',
    itemName: 'Spare Smart TV Remotes (Sony/Samsung)',
    category: 'Electronics',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Front Desk Supply Cabinet',
    quantity: 4,
    unitPrice: 24.00,
    totalValue: 96.00,
    minimumStock: 5,
    condition: 'New',
    status: 'Low Stock',
    supplier: 'Sony Hospitality Solutions',
    purchaseDate: '2026-07-15',
    lastUpdated: '2026-09-14',
    description: 'Pre-programmed replacement remotes for fast front desk dispatch.',
    notes: 'Need 10 more units.'
  },
  {
    id: 'INV-2009',
    sku: 'APP-COF-600',
    itemName: 'Nespresso Espresso Capsule Pods (Box of 100)',
    category: 'Kitchen',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Kitchen & Dining Pantry',
    quantity: 12,
    unitPrice: 62.00,
    totalValue: 744.00,
    minimumStock: 4,
    condition: 'New',
    status: 'Available',
    supplier: 'Nespresso Professional',
    purchaseDate: '2026-09-01',
    lastUpdated: '2026-09-15',
    description: 'Ristretto and Lungo assorted gourmet coffee capsules.',
    notes: 'Stocked in all Suite rooms.'
  },
  {
    id: 'INV-2010',
    sku: 'BTH-SLP-700',
    itemName: 'Velvet Open-Toe Guest Slippers (Pair)',
    category: 'Amenities',
    locationType: 'Storage',
    roomNumber: '-',
    location: 'Housekeeping Closet (Floor 3)',
    quantity: 0,
    unitPrice: 3.50,
    totalValue: 0.00,
    minimumStock: 30,
    condition: 'New',
    status: 'Out of Stock',
    supplier: 'EcoSpa Amenities Ltd.',
    purchaseDate: '2026-07-20',
    lastUpdated: '2026-09-15',
    description: 'Thick sole anti-slip luxury guest bedroom slippers.',
    notes: 'Shipment delayed at customs. Expected next Monday.'
  },

  // Additional Room Items
  {
    id: 'INV-1022',
    sku: 'FUR-HNG-080',
    itemName: 'Anti-Theft Wooden Suit Hangers (Set of 6)',
    category: 'Furniture',
    locationType: 'Room',
    roomNumber: '104',
    location: 'Room 104 - Wardrobe Closet',
    quantity: 6,
    unitPrice: 4.50,
    totalValue: 27.00,
    minimumStock: 6,
    condition: 'Good',
    status: 'Available',
    supplier: 'Hotel Supplies International',
    purchaseDate: '2026-01-10',
    lastUpdated: '2026-08-15',
    description: 'Solid lotus wood anti-theft ring hangers with skirt clips.',
    notes: 'All securely locked to wardrobe rail.'
  },
  {
    id: 'INV-1023',
    sku: 'ELC-SAF-090',
    itemName: 'Digital Electronic Laptop Safe 17"',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '104',
    location: 'Room 104 - Wardrobe Shelf',
    quantity: 1,
    unitPrice: 160.00,
    totalValue: 160.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Elsafe Hospitality Security',
    purchaseDate: '2025-08-12',
    lastUpdated: '2026-09-02',
    description: 'Keypad digital safe with master emergency audit key override.',
    notes: 'Master pin validated.'
  },
  {
    id: 'INV-1024',
    sku: 'BED-DVT-018',
    itemName: 'All-Season Microfiber Duvet Insert (Queen)',
    category: 'Linens',
    locationType: 'Room',
    roomNumber: '105',
    location: 'Room 105 - Bed',
    quantity: 1,
    unitPrice: 52.00,
    totalValue: 52.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'SlumberLux Bedding Co.',
    purchaseDate: '2026-04-10',
    lastUpdated: '2026-09-11',
    description: '300 GSM breathable box-stitched hypoallergenic duvet insert.',
    notes: 'Inspected.'
  },
  {
    id: 'INV-1025',
    sku: 'BTH-MAT-003',
    itemName: 'Embossed Foot Bath Mat',
    category: 'Bathroom',
    locationType: 'Room',
    roomNumber: '202',
    location: 'Room 202 - Shower Exit',
    quantity: 2,
    unitPrice: 8.50,
    totalValue: 17.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: '2026-06-15',
    lastUpdated: '2026-09-14',
    description: '800 GSM heavy-weight textured absorbent floor mat.',
    notes: 'Replaced daily.'
  },
  {
    id: 'INV-1026',
    sku: 'ELC-TVR-021',
    itemName: 'Smart TV Remote Controller',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '204',
    location: 'Room 204 - Bedside Table',
    quantity: 1,
    unitPrice: 24.00,
    totalValue: 24.00,
    minimumStock: 1,
    condition: 'Good',
    status: 'Available',
    supplier: 'Sony Hospitality Solutions',
    purchaseDate: '2026-01-20',
    lastUpdated: '2026-09-13',
    description: 'Voice remote with Netflix and HDMI quick buttons.',
    notes: 'Checked.'
  },
  {
    id: 'INV-1027',
    sku: 'BTH-DRY-015',
    itemName: 'Ionic Hair Dryer 1800W',
    category: 'Electronics',
    locationType: 'Room',
    roomNumber: '302',
    location: 'Room 302 - Vanity Mirror',
    quantity: 0,
    unitPrice: 38.00,
    totalValue: 0.00,
    minimumStock: 1,
    condition: 'Fair',
    status: 'Missing',
    supplier: 'Philips Pro Appliances',
    purchaseDate: '2026-02-14',
    lastUpdated: '2026-09-13',
    description: 'Foldable wall-mounted ionic hair dryer.',
    notes: 'Missing post guest checkout. Incident MI-00027.'
  }
];

export const INITIAL_MISSING_INCIDENTS = [
  {
    id: 'MI-00024',
    incidentNumber: 'MI-00024',
    inventoryItemId: 'INV-1007',
    itemName: 'Smart TV Remote Controller',
    category: 'Electronics',
    roomNumber: '203',
    quantity: 1,
    unitValue: 24.00,
    totalLoss: 24.00,
    reportedDate: '2026-09-14',
    reportedBy: 'Housekeeping (Jane Smith)',
    reason: 'Not found in room during post-checkout inspection',
    status: 'Under Investigation',
    assignedTo: 'Housekeeping Supervisor (Sarah M.)',
    guestName: 'Robert Vance (Res #RES-409)',
    notes: 'Checked behind bed frame, under sofa, and drawers. Front desk contacted guest to inquire.',
    resolutionType: null,
    resolutionDate: null,
    resolutionNotes: null,
    timeline: [
      { date: '2026-09-14 11:30 AM', action: 'Incident Reported', user: 'Jane Smith (Housekeeper)', detail: 'Missing remote noticed while preparing room for next check-in.' },
      { date: '2026-09-14 01:15 PM', action: 'Under Investigation', user: 'Sarah M. (Supervisor)', detail: 'Assigned inspection team to double check laundry hampers and luggage carts.' },
      { date: '2026-09-14 03:40 PM', action: 'Guest Inquired', user: 'Front Desk Team', detail: 'Sent courteous email to guest inquiring if accidentally packed.' }
    ]
  },
  {
    id: 'MI-00025',
    incidentNumber: 'MI-00025',
    inventoryItemId: 'INV-1016',
    itemName: 'Waffle Weave Bathrobe (L)',
    category: 'Bathroom',
    roomNumber: '201',
    quantity: 1,
    unitValue: 35.00,
    totalLoss: 35.00,
    reportedDate: '2026-09-15',
    reportedBy: 'Housekeeping (Bilal K.)',
    reason: 'Bathrobe missing from wardrobe after checkout',
    status: 'Reported',
    assignedTo: 'Duty Manager (Farhan A.)',
    guestName: 'David Miller (Res #RES-415)',
    notes: 'Only 1 out of 2 suite bathrobes was present during checkout inventory count.',
    resolutionType: null,
    resolutionDate: null,
    resolutionNotes: null,
    timeline: [
      { date: '2026-09-15 10:15 AM', action: 'Incident Logged', user: 'Bilal K. (Housekeeper)', detail: 'Discovered during 10:00 AM turnaround cleaning.' }
    ]
  },
  {
    id: 'MI-00026',
    incidentNumber: 'MI-00026',
    inventoryItemId: 'INV-1021',
    itemName: 'Crystal Whiskey Tumbler Set (2pc)',
    category: 'Kitchen',
    roomNumber: '301',
    quantity: 1,
    unitValue: 16.00,
    totalLoss: 16.00,
    reportedDate: '2026-09-13',
    reportedBy: 'Housekeeping (Ali R.)',
    reason: 'Broken in trash bin / missing glass',
    status: 'Replaced',
    assignedTo: 'Housekeeping Supervisor (Sarah M.)',
    guestName: 'Elena Rostova (Res #RES-398)',
    notes: 'Glass was accidentally broken by guest, charged to incidental folio $16.00 and replaced from storage.',
    resolutionType: 'Replaced',
    resolutionDate: '2026-09-14',
    resolutionNotes: 'New boxed crystal glasses retrieved from central bar store and placed in 301.',
    timeline: [
      { date: '2026-09-13 02:20 PM', action: 'Incident Reported', user: 'Ali R. (Housekeeper)', detail: 'Broken pieces found in bin during room service cleaning.' },
      { date: '2026-09-13 04:00 PM', action: 'Under Investigation', user: 'Sarah M.', detail: 'Verified with guest account. Charge applied with guest consent.' },
      { date: '2026-09-14 09:30 AM', action: 'Replacement Provided', user: 'Sarah M.', detail: 'Replaced from Central Pantry stock. Incident closed.' }
    ]
  },
  {
    id: 'MI-00027',
    incidentNumber: 'MI-00027',
    inventoryItemId: 'INV-1027',
    itemName: 'Ionic Hair Dryer 1800W',
    category: 'Electronics',
    roomNumber: '302',
    quantity: 1,
    unitValue: 38.00,
    totalLoss: 38.00,
    reportedDate: '2026-09-13',
    reportedBy: 'Housekeeping (Jane Smith)',
    reason: 'Bathroom bracket empty',
    status: 'Recovered',
    assignedTo: 'Security Head (Tariq M.)',
    guestName: 'Marcus Aurel (Res #RES-401)',
    notes: 'Found in hotel lost & found holding bag, was placed in wrong housekeeping cart during floor turn.',
    resolutionType: 'Recovered',
    resolutionDate: '2026-09-14',
    resolutionNotes: 'Hair dryer verified, tested, sanitized, and returned to Room 302 bracket.',
    timeline: [
      { date: '2026-09-13 09:00 AM', action: 'Reported Missing', user: 'Jane Smith', detail: 'Noted empty dryer bracket on wall.' },
      { date: '2026-09-13 11:00 AM', action: 'Under Investigation', user: 'Tariq M. (Security)', detail: 'Reviewing cart logs.' },
      { date: '2026-09-14 08:45 AM', action: 'Item Recovered', user: 'Tariq M.', detail: 'Found in cart 3B storage compartment and reinstalled.' }
    ]
  },
  {
    id: 'MI-00028',
    incidentNumber: 'MI-00028',
    inventoryItemId: 'INV-1014',
    itemName: 'Steam Iron & Stand Set',
    category: 'Amenities',
    roomNumber: '102',
    quantity: 1,
    unitValue: 55.00,
    totalLoss: 55.00,
    reportedDate: '2026-09-10',
    reportedBy: 'Housekeeping (Alice Green)',
    reason: 'Power cord damaged and detached',
    status: 'Written Off',
    assignedTo: 'General Manager (Hassan K.)',
    guestName: 'Internal Maintenance',
    notes: 'Excessive wear and tear beyond economical repair. Deemed obsolete.',
    resolutionType: 'Written Off',
    resolutionDate: '2026-09-12',
    resolutionNotes: 'Approved for electronic scrap write-off. Replaced with newer model in 102.',
    timeline: [
      { date: '2026-09-10 03:10 PM', action: 'Damage / Loss Logged', user: 'Alice Green', detail: 'Cord burnt out.' },
      { date: '2026-09-11 10:00 AM', action: 'Inspected by Tech', user: 'Maintenance Lead', detail: 'Repairs exceed replacement cost.' },
      { date: '2026-09-12 02:00 PM', action: 'Written Off', user: 'Hassan K.', detail: 'Formally written off asset ledger.' }
    ]
  }
];

// LocalStorage helpers with automatic initialization
const STORAGE_KEY_ITEMS = 'hotel_inventory_items_v2';
const STORAGE_KEY_INCIDENTS = 'hotel_inventory_incidents_v2';

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

  // Determine status automatically if not manually forced
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
      const merged = { ...item, ...updates, lastUpdated: new Date().toISOString().split('T')[0] };
      merged.quantity = Number(merged.quantity) || 0;
      merged.unitPrice = Number(merged.unitPrice) || 0;
      merged.totalValue = merged.quantity * merged.unitPrice;
      
      if (!updates.status) {
        if (merged.quantity === 0) {
          merged.status = item.status === 'Missing' ? 'Missing' : 'Out of Stock';
        } else if (merged.quantity <= merged.minimumStock) {
          merged.status = 'Low Stock';
        } else {
          merged.status = 'Available';
        }
      }
      return merged;
    }
    return item;
  });
  saveInventoryItems(updated);
};

export const deleteInventoryItem = (id) => {
  const items = getInventoryItems();
  const updated = items.filter(item => item.id !== id);
  saveInventoryItems(updated);
};

// Incidents Management
export const addMissingIncident = (incidentData) => {
  const incidents = getMissingIncidents();
  const newIncident = {
    ...incidentData,
    id: `MI-${String(incidents.length + 29).padStart(5, '0')}`,
    incidentNumber: `MI-${String(incidents.length + 29).padStart(5, '0')}`,
    quantity: Number(incidentData.quantity) || 1,
    unitValue: Number(incidentData.unitValue) || 0,
    totalLoss: (Number(incidentData.quantity) || 1) * (Number(incidentData.unitValue) || 0),
    reportedDate: incidentData.reportedDate || new Date().toISOString().split('T')[0],
    status: incidentData.status || 'Reported',
    timeline: [
      {
        date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        action: 'Incident Logged',
        user: incidentData.reportedBy || 'Staff',
        detail: incidentData.reason || 'Missing item logged.'
      }
    ]
  };

  const updatedIncidents = [newIncident, ...incidents];
  saveMissingIncidents(updatedIncidents);

  // If tied to an inventory item, update its status
  if (incidentData.inventoryItemId) {
    updateInventoryItem(incidentData.inventoryItemId, { status: 'Missing' });
  }

  return newIncident;
};

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

  // Update underlying inventory item if found / resolved
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
  // Look for storage records with same SKU or matching category/name
  const storageItems = allItems.filter(i => i.locationType === 'Storage');
  const exactMatch = storageItems.find(i => i.sku === item.sku);
  if (exactMatch) {
    return {
      availableUnits: exactMatch.quantity,
      location: exactMatch.location,
      status: exactMatch.status
    };
  }
  // Category match fallback
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

