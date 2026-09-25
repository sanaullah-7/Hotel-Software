const fs = require('fs');
let file = 'src/routes/AppRoutes.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<Route path="\/admin\/profile" element=\{<DashboardLayout><AdminProfile \/><\/DashboardLayout>\} \/>/g, '');
content = content.replace(/import AdminProfile from '..\/features\/admin\/pages\/AdminProfile';/g, '');
fs.writeFileSync(file, content, 'utf8');
