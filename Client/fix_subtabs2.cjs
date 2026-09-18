const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

const targetRender = `                      return (
                        <Link
                          key={subItem.id}
                          to={subItem.path}
                          className={\`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline \${
                            isSelected 
                              ? 'bg-[#dcefe5] text-[#1b7f43]' 
                              : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
                          }\`}
                        >
                          {/* Left Dot Bullet */}
                          {isSelected ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-[#1b7f43] mr-3 shrink-0 ml-0.5 transition-all duration-200 opacity-60"></div>
                          )}
                          
                          <span className={\`text-[12.5px] whitespace-nowrap transition-all duration-200 \${
                            isSelected ? 'font-bold' : 'font-medium'
                          }\`}>
                            {subItem.label}
                          </span>
                        </Link>
                      );`;

// We have 4 dropdowns (Front Office, Bookings, Rooms, Housekeeping)
// We will replace all 4 instances of the return (<Link...>) to ensure absolute consistency.

content = content.replace(/return \(\s*<Link\s*key=\{subItem\.id\}[\s\S]*?<\/Link>\s*\);/g, targetRender);

fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', content);
console.log('Fixed styles');
