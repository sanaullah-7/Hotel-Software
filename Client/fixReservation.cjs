const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');
content = content.replace(
  '          </li>\n\n            >\n              <div className="flex items-center min-w-0">',
  `          </li>\n\n          {/* Reservation Dropdown Menu Item */}\n          <li>\n            <button\n              onClick={handleToggleReservation}\n              title={!isOpen ? "Reservation" : undefined}\n              className={\`w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border-none text-left \${isReservationActive ? 'bg-[#f0f9f4]' : 'hover:bg-gray-50'} \${isOpen ? 'justify-between' : 'justify-center'}\`}\n            >\n              <div className="flex items-center min-w-0">`
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
