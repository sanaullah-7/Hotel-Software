const fs = require('fs');

let lines = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8').split('\n');
let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Inventory Dropdown Menu Item */}')) {
    start = i;
  }
  if (lines[i].includes('{/* Smooth Animated Sub-Items Dropdown List */}')) {
    if (start !== -1 && lines[i+5] && lines[i+5].includes('inventorySubItems')) {
      // Actually, wait, the Sub-Items Dropdown List part is also mangled?
      // Let's just find the end of the HR/Restaurant sub-items.
    }
  }
}

// I will just use regex to replace everything from Inventory Dropdown to the end of Restaurant map block.
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

const replacement = `
          {/* Inventory Dropdown Menu Item */}
          <li>
            <button
              onClick={handleToggleInventory}
              title={!isOpen ? "Inventory" : undefined}
              className={\`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \${
                isInventoryActive 
                  ? 'bg-[#f0f9f4] text-[#1b7f43]' 
                  : 'hover:bg-gray-50 text-gray-600'
              } \${isOpen ? 'justify-between' : 'justify-center'}\`}
            >
              <div className="flex items-center min-w-0">
                <div className={\`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors \${
                  isInventoryActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }\`}>
                  <InventoryIcon sx={{ fontSize: 20 }} />
                </div>
                <span className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } \${isInventoryActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}\`}>
                  Inventory
                </span>
              </div>
              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    fontSize="small" 
                    className={\`transition-transform duration-300 ease-in-out \${
                      isInventoryActive ? 'text-[#1b7f43]' : 'text-gray-400'
                    } \${isInventoryOpen ? 'rotate-90' : 'rotate-0'}\`} 
                  />
                </div>
              )}
            </button>
            <div className={\`grid transition-all duration-300 ease-in-out \${
                isOpen && isInventoryOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }\`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {inventorySubItems.map((subItem) => {
                    const isSelected = (subItem.id === 'all-inventory' && location.pathname === '/inventory') || (subItem.id === 'add-inventory' && location.pathname === '/inventory/add') || location.pathname === subItem.path;
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

          {/* HR Dropdown Menu Item */}
          <li>
            <button onClick={handleToggleHR} title={!isOpen ? "Human Resources" : undefined} className={\`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \${isHRActive ? 'bg-[#f0f9f4] text-[#1b7f43]' : 'hover:bg-gray-50 text-gray-600'} \${isOpen ? 'justify-between' : 'justify-center'}\`}>
              <div className="flex items-center min-w-0">
                <div className={\`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors \${isHRActive ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}\`}>
                  <HRIcon sx={{ fontSize: 20 }} />
                </div>
                <span className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'} \${isHRActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}\`}>Human Resources</span>
              </div>
            </button>
            <div className={\`grid transition-all duration-300 ease-in-out \${isOpen && isHROpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'}\`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {hrSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path;
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

          {/* Restaurant Dropdown Menu Item */}
          <li>
            <button onClick={handleToggleRestaurant} title={!isOpen ? "Restaurant" : undefined} className={\`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \${isRestaurantActive ? 'bg-[#f0f9f4] text-[#1b7f43]' : 'hover:bg-gray-50 text-gray-600'} \${isOpen ? 'justify-between' : 'justify-center'}\`}>
              <div className="flex items-center min-w-0">
                <div className={\`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors \${isRestaurantActive ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}\`}>
                  <RestaurantIcon sx={{ fontSize: 20 }} />
                </div>
                <span className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'} \${isRestaurantActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}\`}>Restaurant</span>
              </div>
            </button>
            <div className={\`grid transition-all duration-300 ease-in-out \${isOpen && isRestaurantOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'}\`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {restaurantSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path;
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

// Now find the start and end indices for replacing
let s = content.indexOf('          {/* Inventory Dropdown Menu Item */}');
let e = content.indexOf('          {/* Rates & Pricing Dropdown Menu Item */}');
if (s !== -1 && e !== -1) {
  content = content.substring(0, s) + replacement + '\n' + content.substring(e);
  fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', content);
  console.log('Fixed mangled Inventory, HR, and Restaurant blocks!');
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
