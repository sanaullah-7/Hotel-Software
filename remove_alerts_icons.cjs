const fs = require('fs');
let file = 'Client/src/pages/FrontOffice/OperationsAlerts.jsx';
let content = fs.readFileSync(file, 'utf8');

const blocksToRemove = [
  /<div className="w-\[38px\] h-\[38px\] rounded-\[12px\] flex items-center justify-center shrink-0" style=\{\{ backgroundColor: theme\.bg \}\}>\s*<Icon sx=\{\{ fontSize: 20 \}\} style=\{\{ color: theme\.color \}\} \/>\s*<\/div>/g,
  /<ScheduleIcon sx=\{\{ fontSize: 13 \}\} className="text-gray-400" \/>/g,
  /<RoomIcon sx=\{\{ fontSize: 13 \}\} className="text-gray-400" \/>/g,
  /<PersonIcon sx=\{\{ fontSize: 13 \}\} className="text-gray-400" \/>/g,
  /<ForumIcon sx=\{\{ fontSize: 13 \}\} className="text-gray-400" \/>/g,
  /<RestartAltIcon sx=\{\{ fontSize: 14 \}\} \/>\s/g,
  /<NotificationsIcon sx=\{\{ fontSize: 18 \}\} \/>\s/g,
  /<AddAlert sx=\{\{ fontSize: 20, mb: 1, color: 'text.secondary' \}\} \/>/g,
  /<SearchIcon sx=\{.*\} \/>/g,
  /<TaskAltIcon sx=\{\{ fontSize: 14 \}\} \/>\s/g,
  /<PendingActionsIcon sx=\{\{ fontSize: 14 \}\} \/>\s/g,
  /<Edit sx=\{\{ fontSize: 16 \}\} \/>/g,
  /<Delete sx=\{\{ fontSize: 16 \}\} \/>/g,
  /<SendIcon sx=\{\{ fontSize: 16 \}\} \/>\s/g,
  /<FileDownload sx=\{\{ fontSize: 18 \}\} \/>\s/g
];

blocksToRemove.forEach(regex => {
  content = content.replace(regex, '');
});

fs.writeFileSync(file, content, 'utf8');
console.log('Icons removed');
