const fs = require('fs');
let file = 'Client/src/layouts/DashboardLayout/Sidebar.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className=\{`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mr-3 \$\{\s*isSelected \? 'bg-\[#e5f4eb\] text-\[#1b7f43\]' : 'bg-white text-gray-400'\s*\}`\}>\s*<subItem\.icon sx=\{\{ fontSize: 16 \}\} \/>\s*<\/div>/g;

const bulletBlock = `{isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0 transition-all duration-200"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#3b82f6] mr-3 shrink-0 ml-0.5 transition-all duration-200"></div>
                        )}`;

content = content.replace(regex, bulletBlock);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed icon rendering');
