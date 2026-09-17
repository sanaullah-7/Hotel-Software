const fs = require('fs');
let lines = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</Link>') && lines[i+1] && lines[i+1].includes(');') && lines[i+2] && lines[i+2].includes('<div className={`overflow-hidden transition-all duration-300 ease-in-out')) {
    lines.splice(i + 2, 0, '                  })}');
    lines.splice(i + 3, 0, '                </div>');
    lines.splice(i + 4, 0, '              </div>');
    lines.splice(i + 5, 0, '            </div>');
    lines.splice(i + 6, 0, '          </li>');
    lines.splice(i + 7, 0, '');
    lines.splice(i + 8, 0, '          {/* Rooms Tab */}');
    lines.splice(i + 9, 0, '          <li>');
    console.log('Fixed missing reservationSubItems close tags');
    break;
  }
}
fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', lines.join('\n'));

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
