const fs = require('fs');

const file = 'SuperAdmin/src/Services/ApprovlService.js';
let content = fs.readFileSync(file, 'utf8');

// Remove the seeding
content = content.replace(
  /  \/\/ If no local data, seed it with mock\n  localStorage\.setItem\('hotel_registration_requests', JSON\.stringify\(MOCK_APPROVALS\)\);\n  return MOCK_APPROVALS;/,
  `  // If no local data, return empty array to show no dummy data
  return [];`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed dummy data in ApprovlService.js');
