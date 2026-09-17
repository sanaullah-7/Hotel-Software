import re

with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The mess starts with:
#                     {/* Rooms Dropdown Menu Item */}
#           <li>
#             {/* Rooms Header Button */}
#             <button
#               onClick={handleToggleRooms}
#               title={!isOpen ? "Rooms" : undefined}
#               className={w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left +{/* Rooms Tab */}

# Let's find exactly           {/* Rooms Tab */} and everything after it down to           {/* Housekeeping Dropdown Menu Item */}
# Wait, let's just find the first occurrence of           {/* Rooms Dropdown Menu Item */}
# and replace everything from there up to           {/* Housekeeping Dropdown Menu Item */} 
# with our perfect new Rooms Menu!

pattern = r'(\s*\{/\* Rooms Dropdown Menu Item \*\/\}.*?|\s*\{/\* Rooms Tab \*\/\}.*?)(?=\s*\{/\* Housekeeping Dropdown Menu Item \*\/\})'

new_menu = '''
          {/* Rooms Dropdown Menu Item */}
          <li>
            {/* Rooms Header Button */}
            <button
              onClick={handleToggleRooms}
              title={!isOpen ? "Rooms" : undefined}
              className={w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left  }
            >
              <div className="flex items-center min-w-0">
                <div className={lex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors }>
                  <RoomIcon sx={{ fontSize: 20 }} />
                </div>

                <span className={ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200  }>
                  Rooms
                </span>
              </div>

              {isOpen && (
                <div className="pr-1 shrink-0">
                  <ChevronRightIcon 
                    sx={{ fontSize: 18 }} 
                    className={	ext-gray-400 transition-transform duration-300 }
                  />
                </div>
              )}
            </button>

            {/* Sub-menu container */}
            <div 
              className={overflow-hidden transition-all duration-300 ease-in-out }
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
                        className={lex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline }
                      >
                        <span className={	ext-[12.5px] whitespace-nowrap transition-all duration-200 }>
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>
'''

fixed_content = re.sub(pattern, new_menu, content, flags=re.DOTALL)

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(fixed_content)
print("Done")
