const fs = require('fs');
let sidebar = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

// Add Housekeeping icon import
sidebar = sidebar.replace(/Domain as OccupancyIcon\n\}/, 'Domain as OccupancyIcon,\n  CleaningServices as HousekeepingIcon\n}');

// Add Housekeeping paths and states
sidebar = sidebar.replace(/const isReservationPath = location\.pathname\.startsWith\('\/reservation'\);/, 
  "const isReservationPath = location.pathname.startsWith('/reservation');\n  const isHousekeepingPath = location.pathname.startsWith('/housekeeping');");

sidebar = sidebar.replace(/const \[isReservationOpen, setIsReservationOpen\] = useState\(isReservationPath\);/, 
  "const [isReservationOpen, setIsReservationOpen] = useState(isReservationPath);\n  const [isHousekeepingOpen, setIsHousekeepingOpen] = useState(isHousekeepingPath);");

sidebar = sidebar.replace(/const isReservationActive = isReservationPath;/, 
  "const isReservationActive = isReservationPath;\n  const isHousekeepingActive = isHousekeepingPath;");

sidebar = sidebar.replace(/const reservationSubItems = \[[\s\S]*?\];/, 
  "$&" + "\n\n  const housekeepingSubItems = [\n    { label: 'Room Cleaning', id: 'rooms-cleaning', path: '/housekeeping/rooms-cleaning' },\n  ];");

sidebar = sidebar.replace(/const handleToggleReservation = \(\) => \{[\s\S]*?\};\n/, 
  "$&" + "\n  const handleToggleHousekeeping = () => {\n    if (!isOpen) {\n      setIsOpen(true);\n      setIsHousekeepingOpen(true);\n    } else {\n      setIsHousekeepingOpen(prev => !prev);\n    }\n  };\n");

// Add Housekeeping block before Guests Tab
const housekeepingUI = 
          {/* Housekeeping Dropdown Menu Item */}
          <li>
            <button
              onClick={handleToggleHousekeeping}
              title={!isOpen ? "Housekeeping" : undefined}
              className={\w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \ \\}
            >
              <div className="flex items-center min-w-0">
                <div className={\lex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors \\}>
                  <HousekeepingIcon sx={{ fontSize: 20 }} />
                </div>

                <span className={\ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \ \\}>
                  Housekeeping
                </span>
              </div>

              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    fontSize="small" 
                    className={\	ransition-transform duration-300 ease-in-out \ \\} 
                  />
                </div>
              )}
            </button>

            {/* Smooth Animated Sub-Items Dropdown List */}
            <div 
              className={\grid transition-all duration-300 ease-in-out \\}
            >
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {housekeepingSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path || 
                      (subItem.id === 'rooms-cleaning' && location.pathname.startsWith('/housekeeping/rooms-cleaning'));
                    
                    return (
                      <Link
                        key={subItem.id}
                        to={subItem.path}
                        className={\lex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline \\}
                      >
                        {/* Left Dot Bullet */}
                        {isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>
                        )}

                        {/* Sub-item Label */}
                        <span className={\	ext-[13px] whitespace-nowrap truncate \\}>
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>
;

sidebar = sidebar.replace(/\s*\{\/\* Guests Tab \*\/\}/, '\n' + housekeepingUI + '\n          {/* Guests Tab */}');
fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', sidebar);

// Now handle AppRoutes.jsx
let appRoutes = fs.readFileSync('src/routes/AppRoutes.jsx', 'utf8');
appRoutes = appRoutes.replace(/\/\/ Guests Module/, 
  "// Housekeeping Module Pages\nimport RoomsAndCleaning from '../pages/Housekeeping/RoomsAndCleaning';\n\n// Guests Module");

const housekeepingRoutes = 
        {/* Housekeeping Sub-Routes */}
        <Route 
          path="/housekeeping" 
          element={<Navigate to="/housekeeping/rooms-cleaning" replace />} 
        />
        <Route 
          path="/housekeeping/rooms-cleaning" 
          element={
            <DashboardLayout>
              <RoomsAndCleaning />
            </DashboardLayout>
          } 
        />
;
appRoutes = appRoutes.replace(/\s*\{\/\* Guests Sub-Routes \*\/\}/, '\n' + housekeepingRoutes + '\n        {/* Guests Sub-Routes */}');
fs.writeFileSync('src/routes/AppRoutes.jsx', appRoutes);
