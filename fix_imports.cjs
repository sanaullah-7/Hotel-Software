const fs = require('fs');

['Client/src/pages/FrontOffice/OperationsAlerts.jsx', 'Client/src/pages/FrontOffice/CheckInOut.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Simple hack to remove duplicate react imports
  // Just find lines starting with import React and remove all but the first.
  let lines = content.split('\n');
  let firstReact = false;
  lines = lines.filter(line => {
    if (line.includes('from "react"') || line.includes("from 'react'")) {
      if (line.includes('import React')) {
        if (!firstReact) {
          firstReact = true;
          return true; // keep first
        }
        return false; // remove duplicates
      }
    }
    return true;
  });
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
});
console.log('Fixed imports');
