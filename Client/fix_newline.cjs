const fs = require('fs');
let file = 'src/pages/Housekeeping/CleaningSchedule.jsx';

let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\n/g, '\n');
fs.writeFileSync(file, content);
