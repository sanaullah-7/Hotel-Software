const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

const replacement = `
          {/* Front Office Dropdown Menu Item */}
          <li>
            <button onClick={handleToggleFrontOffice} title={!isOpen ? "Front Office" : undefined} className={\`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \${isFrontOfficeActive ? 'bg-[#f0f9f4] text-[#1b7f43]' : 'hover:bg-gray-50 text-gray-600'} \${isOpen ? 'justify-between' : 'justify-center'}\`}>
              <div className="flex items-center min-w-0">
                <div className={\`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors \${isFrontOfficeActive ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}\`}>
                  <FrontOfficeIcon sx={{ fontSize: 20 }} />
                </div>
                <span className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'} \${isFrontOfficeActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}\`}>Front Office</span>
              </div>
              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon fontSize="small" className={\`transition-transform duration-300 ease-in-out \${isFrontOfficeActive ? 'text-[#1b7f43]' : 'text-gray-400'} \${isFrontOfficeOpen ? 'rotate-90' : 'rotate-0'}\`} />
                </div>
              )}
            </button>
            <div className={\`grid transition-all duration-300 ease-in-out \${isOpen && isFrontOfficeOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'}\`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {frontOfficeSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path || (subItem.id === 'operations-alerts' && location.pathname === '/front-office') || (subItem.id === 'registration-forms' && location.pathname.startsWith('/front-office/registration-forms'));
                    return (
                      <Link key={subItem.id} to={subItem.path} className={\`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline \${isSelected ? 'bg-[#dcefe5] text-[#1b7f43]' : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'}\`}>
                        {isSelected ? <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div> : <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>}
                        <span className={\`text-[13px] whitespace-nowrap truncate \${isSelected ? 'font-bold text-[#1b7f43]' : 'font-semibold'}\`}>{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>

          {/* Reservation Dropdown Menu Item */}
          <li>
            <button onClick={handleToggleReservation} title={!isOpen ? "Reservation" : undefined} className={\`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \${isReservationActive ? 'bg-[#f0f9f4] text-[#1b7f43]' : 'hover:bg-gray-50 text-gray-600'} \${isOpen ? 'justify-between' : 'justify-center'}\`}>
              <div className="flex items-center min-w-0">
                <div className={\`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors \${isReservationActive ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}\`}>
                  <BookingIcon sx={{ fontSize: 20 }} />
                </div>
                <span className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'} \${isReservationActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}\`}>Reservation</span>
              </div>
              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon fontSize="small" className={\`transition-transform duration-300 ease-in-out \${isReservationActive ? 'text-[#1b7f43]' : 'text-gray-400'} \${isReservationOpen ? 'rotate-90' : 'rotate-0'}\`} />
                </div>
              )}
            </button>
            <div className={\`grid transition-all duration-300 ease-in-out \${isOpen && isReservationOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'}\`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {reservationSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path || (subItem.id === 'add-new-reservation' && location.pathname.startsWith('/reservation/new'));
                    return (
                      <Link key={subItem.id} to={subItem.path} className={\`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline \${isSelected ? 'bg-[#dcefe5] text-[#1b7f43]' : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'}\`}>
                        {isSelected ? <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div> : <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>}
                        <span className={\`text-[13px] whitespace-nowrap truncate \${isSelected ? 'font-bold text-[#1b7f43]' : 'font-semibold'}\`}>{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>
`;

let s = content.indexOf('          {/* Front Office Dropdown Menu Item */}');
let e = content.indexOf('          {/* Rooms Dropdown Menu Item */}');
if (s !== -1 && e !== -1) {
  content = content.substring(0, s) + replacement + '\n' + content.substring(e);
  fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', content);
  console.log('Fixed Front Office and Reservation blocks!');
} else {
  console.error('Could not find start or end block');
}

const esbuild = require('esbuild');
async function test() {
  try {
    const c = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');
    await esbuild.transform(c, { loader: 'jsx' });
    console.log('Sidebar: Valid JSX!');
  } catch (e) {
    console.error('Sidebar Error:', e.errors[0].text);
    console.error('Line:', e.errors[0].location.line);
  }
}
test();
