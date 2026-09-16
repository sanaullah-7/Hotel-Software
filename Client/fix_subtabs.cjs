const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

const targetRender = 
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
                            <div className="w-2 h-2 rounded-full bg-[var(--primary-main)] mr-3 shrink-0 ml-0.5 transition-all duration-200 opacity-60"></div>
                          )}
                          
                          <span className={\	ext-[12.5px] whitespace-nowrap transition-all duration-200 \\}>
                            {subItem.label}
                          </span>
                        </Link>
                      );
;

// Regex for roomsSubItems.map replace
content = content.replace(
  /return \(\s*<Link\s*key=\{subItem\.id\}[\s\S]*?<\/Link>\s*\);/,
  targetRender
);
// Doing it again for Housekeeping (which will be the next one in the file because it matches first available)
content = content.replace(
  /return \(\s*<Link\s*key=\{subItem\.id\}[\s\S]*?<\/Link>\s*\);/,
  targetRender
);
// Doing it again if there are more
content = content.replace(
  /return \(\s*<Link\s*key=\{subItem\.id\}[\s\S]*?<\/Link>\s*\);/,
  targetRender
);
content = content.replace(
  /return \(\s*<Link\s*key=\{subItem\.id\}[\s\S]*?<\/Link>\s*\);/,
  targetRender
);

fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', content);
console.log('Fixed styles');
