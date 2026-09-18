const fs = require('fs');

const files = [
  'Client/src/pages/Housekeeping/CleaningSchedule.jsx',
  'Client/src/pages/Housekeeping/LostAndFound.jsx',
  'Client/src/pages/Housekeeping/InspectionChecklist.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /<div className="p-2\.5 flex items-center justify-between border-b border-gray-100 gap-4 overflow-x-auto">/g,
    '<div className="p-2.5 flex items-center justify-between border-b border-gray-100 gap-4">'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Removed overflow-x-auto from ${file}`);
});
