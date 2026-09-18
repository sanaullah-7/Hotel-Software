const fs = require('fs');
let content = fs.readFileSync('Client/src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

const regex = /<button\s*onClick=\{handleToggleHR\}[\s\S]*?\{restaurantSubItems\.map\(\(subItem\) => \{[\s\S]*?<\/div>\s*<\/div>\s*<\/li>/;

const replacement = `
          {/* Human Resources Dropdown Menu Item */}
          <li>
            <button
              onClick={handleToggleHR}
              title={!isOpen ? "Human Resources" : undefined}
              className={\`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \${
                isHRActive
                  ? 'bg-[#f0f9f4]'
                  : 'hover:bg-gray-50'
              } \${isOpen ? 'justify-between' : 'justify-center'}\`}
            >
              <div className="flex items-center min-w-0">
                <div className={\`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors \${
                  isHRActive
                    ? 'bg-[#e5f4eb] text-[#1b7f43]'
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }\`}>
                  <HRIcon sx={{ fontSize: 20 }} />
                </div>
                <span className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } \${isHRActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}\`}>
                  Human Resources
                </span>
              </div>
              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon
                    fontSize="small"
                    className={\`transition-transform duration-300 ease-in-out \${
                      isHRActive ? 'text-[#1b7f43]' : 'text-gray-400'
                    } \${isHROpen ? 'rotate-90' : 'rotate-0'}\`}
                  />
                </div>
              )}
            </button>
            <div className={\`grid transition-all duration-300 ease-in-out \${
                isOpen && isHROpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }\`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {hrSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path;
                    return (
                      <Link key={subItem.id} to={subItem.path} className={\`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline \${
                          isSelected
                            ? 'bg-white shadow-sm text-gray-900 font-bold'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                        }\`}>
                        <div className={\`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mr-3 \${
                          isSelected ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'bg-white text-gray-400'
                        }\`}>
                          <subItem.icon sx={{ fontSize: 16 }} />
                        </div>
                        <span className="text-[12px] whitespace-nowrap">{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>

          {/* Restaurant Dropdown Menu Item */}
          <li>
            <button
              onClick={handleToggleRestaurant}
              title={!isOpen ? "Restaurant" : undefined}
              className={\`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \${
                isRestaurantActive
                  ? 'bg-[#f0f9f4]'
                  : 'hover:bg-gray-50'
              } \${isOpen ? 'justify-between' : 'justify-center'}\`}
            >
              <div className="flex items-center min-w-0">
                <div className={\`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors \${
                  isRestaurantActive
                    ? 'bg-[#e5f4eb] text-[#1b7f43]'
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }\`}>
                  <RestaurantIcon sx={{ fontSize: 20 }} />
                </div>
                <span className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } \${isRestaurantActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}\`}>
                  Restaurant
                </span>
              </div>
              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon
                    fontSize="small"
                    className={\`transition-transform duration-300 ease-in-out \${
                      isRestaurantActive ? 'text-[#1b7f43]' : 'text-gray-400'
                    } \${isRestaurantOpen ? 'rotate-90' : 'rotate-0'}\`}
                  />
                </div>
              )}
            </button>
            <div className={\`grid transition-all duration-300 ease-in-out \${
                isOpen && isRestaurantOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }\`}>
              <div className="overflow-hidden">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {restaurantSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path;
                    return (
                      <Link key={subItem.id} to={subItem.path} className={\`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline \${
                          isSelected
                            ? 'bg-white shadow-sm text-gray-900 font-bold'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                        }\`}>
                        <div className={\`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mr-3 \${
                          isSelected ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'bg-white text-gray-400'
                        }\`}>
                          <subItem.icon sx={{ fontSize: 16 }} />
                        </div>
                        <span className="text-[12px] whitespace-nowrap">{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>`;

content = content.replace(regex, replacement);
fs.writeFileSync('Client/src/layouts/DashboardLayout/Sidebar.jsx', content, 'utf8');
