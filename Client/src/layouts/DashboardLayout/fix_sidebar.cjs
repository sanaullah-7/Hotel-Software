const fs = require('fs');

let content = fs.readFileSync('Sidebar.jsx', 'utf8');

const newRoomsMenu = `
          {/* Rooms Dropdown Menu Item */}
          <li>
            {/* Rooms Header Button */}
            <button
              onClick={handleToggleRooms}
              title={!isOpen ? "Rooms" : undefined}
              className={\`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \${
                isRoomsActive 
                  ? 'bg-[#f0f9f4]' 
                  : 'hover:bg-gray-50'
              } \${isOpen ? 'justify-between' : 'justify-center'}\`}
            >
              <div className="flex items-center min-w-0">
                <div className={\`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors \${
                  isRoomsActive 
                    ? 'bg-[#e5f4eb] text-[#1b7f43]' 
                    : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                }\`}>
                  <RoomIcon sx={{ fontSize: 20 }} />
                </div>

                <span className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${
                  isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                } \${isRoomsActive ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}\`}>
                  Rooms
                </span>
              </div>

              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    sx={{ fontSize: 18 }} 
                    className={\`text-gray-400 transition-transform duration-300 \${
                      isRoomsOpen ? 'rotate-90' : ''
                    }\`}
                  />
                </div>
              )}
            </button>

            {/* Sub-menu container */}
            <div 
              className={\`overflow-hidden transition-all duration-300 ease-in-out \${
                isOpen && isRoomsOpen ? 'max-h-[400px] opacity-100 mt-1' : 'max-h-0 opacity-0'
              }\`}
            >
              <div className="px-2">
                <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
                  {roomsSubItems.map((subItem) => {
                    const isSelected = location.pathname === subItem.path || 
                      (subItem.id === 'all-rooms' && location.pathname === '/rooms');
                    
                    return (
                      <Link
                        key={subItem.id}
                        to={subItem.path}
                        className={\`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline \${
                          isSelected 
                            ? 'bg-[#dcefe5] text-[#1b7f43]' 
                            : 'text-gray-600 hover:bg-white hover:text-[#1b7f43] hover:shadow-sm hover:translate-x-0.5'
                        }\`}
                      >
                        <span className={\`text-[12.5px] whitespace-nowrap transition-all duration-200 \${
                          isSelected ? 'font-bold' : 'font-medium'
                        }\`}>
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>
`;

const re = /(\s*\{\/\* Rooms Dropdown Menu Item \*\/\}.*?|\s*\{\/\* Rooms Tab \*\/\}.*?)(?=\s*\{\/\* Housekeeping Dropdown Menu Item \*\/\})/s;

content = content.replace(re, "\n" + newRoomsMenu + "\n");

fs.writeFileSync('Sidebar.jsx', content);
console.log('Fixed completely via Node script with regex replace');
