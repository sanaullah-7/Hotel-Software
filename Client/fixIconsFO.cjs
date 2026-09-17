const fs = require('fs');

const missingIcons = {
  'src/pages/FrontOffice/OperationsAlerts.jsx': ['Search', 'FileDownload', 'AddAlert', 'MoreHoriz', 'CheckCircle', 'Person', 'Edit', 'ChevronLeft', 'ChevronRight'],
  'src/pages/FrontOffice/CheckInOut.jsx': ['Search', 'FileDownload', 'MoreHoriz', 'Edit', 'Delete', 'Login', 'Logout', 'HourglassEmpty', 'BookmarkBorder', 'Phone']
};

for (const [file, icons] of Object.entries(missingIcons)) {
  let content = fs.readFileSync(file, 'utf8');
  let imports = '';
  for (const icon of icons) {
    imports += `import ${icon} from '@mui/icons-material/${icon}';\n`;
  }
  
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImport = content.indexOf('\n', lastImportIndex);
    content = content.substring(0, endOfImport + 1) + imports + content.substring(endOfImport + 1);
  } else {
    content = imports + '\n' + content;
  }
  fs.writeFileSync(file, content);
}
console.log('Icons fixed for FrontOffice!');
