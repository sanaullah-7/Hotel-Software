const fs = require('fs');

let content = fs.readFileSync('Sidebar.jsx', 'utf8');

// 1. Add OccupancyIcon
if (!content.includes('OccupancyIcon')) {
    content = content.replace(
        /EventNote as BookingIcon,/,
        "EventNote as BookingIcon,\n  Domain as OccupancyIcon,"
    );
}

// 2. Add Occupancy Path
if (!content.includes('isOccupancyPath')) {
    content = content.replace(
        /const isFrontOfficePath = location\.pathname\.startsWith\('\/front-office'\);/,
        "const isFrontOfficePath = location.pathname.startsWith('/front-office');\n  const isOccupancyPath = location.pathname.startsWith('/occupancy');"
    );
}

// 3. Add Occupancy Active
if (!content.includes('isOccupancyActive')) {
    content = content.replace(
        /const isFrontOfficeActive = isFrontOfficePath;/,
        "const isFrontOfficeActive = isFrontOfficePath;\n  const isOccupancyActive = isOccupancyPath;"
    );
}

// 4. Update Front Office SubItems
const foNew = `  const frontOfficeSubItems = [
    { label: 'Operations Alerts', id: 'operations-alerts', path: '/front-office/operations-alerts' },
    { label: 'Check-in/Check-out', id: 'check-in-out', path: '/front-office/check-in-out' },
    { label: 'Guest Complaint', id: 'guest-complaint', path: '/front-office/guest-complaint' },
  ];`;
content = content.replace(/const frontOfficeSubItems = \[[\s\S]*?\];/, foNew);

// 5. Update Reservation SubItems to Bookings
const bookNew = `  const reservationSubItems = [
    { label: 'All Booking', id: 'all-bookings', path: '/reservation/all' },
    { label: 'Add Booking', id: 'add-booking', path: '/reservation/new' },
    { label: 'Edit Booking', id: 'edit-booking', path: '/reservation/edit' },
    { label: 'Cancel Booking', id: 'cancel-booking', path: '/reservation/cancelled' },
    { label: 'Group Booking', id: 'group-booking', path: '/reservation/group' },
  ];`;
content = content.replace(/const reservationSubItems = \[[\s\S]*?\];/, bookNew);

// 6. Rename "Reservation" Dropdown header to "Bookings"
content = content.replace(/\{!isOpen \? "Reservation" : undefined\}/, '{!isOpen ? "Bookings" : undefined}');
content = content.replace(
    /Reservation\n\s*<\/span>/,
    "Bookings\n                </span>"
);

// 7. Inject Occupancy Tab after Dashboard Tab
const occupancyTab = `
          {/* Occupancy Tab */}
          <li>
            <Link 
              to="/occupancy"
              title={!isOpen ? "Occupancy" : undefined}
              className={\`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group \${
                isOccupancyActive 
                  ? 'bg-[#f4f9f6] text-[#1b7f43]' 
                  : 'hover:bg-gray-50 text-gray-600'
              } \${isOpen ? 'justify-between' : 'justify-center'}\`}
            >
              <div className="flex items-center min-w-0">
                <div className={\`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors \${
                  isOccupancyActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }\`}>
                  <OccupancyIcon sx={{ fontSize: 19 }} />
                </div>
                
                <span className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } \${isOccupancyActive ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-900 font-medium'}\`}>
                  Occupancy
                </span>
              </div>
            </Link>
          </li>
`;

if (!content.includes('to="/occupancy"')) {
    // Insert after Dashboard Tab
    content = content.replace(/(Dashboard\s*<\/span>\s*<\/div>\s*<\/Link>\s*<\/li>)/, "$1\n" + occupancyTab);
}

fs.writeFileSync('Sidebar.jsx', content);
console.log('Fixed');
