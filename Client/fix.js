const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');
content = content.replace(
  '                      </Link>\n                    );\n            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && isRoomsOpen',
  '                      </Link>\n                    );\n                  })}\n                </div>\n              </div>\n            </div>\n          </li>\n\n          {/* Rooms Tab */}\n          <li>\n            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && isRoomsOpen'
);
fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', content);

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
