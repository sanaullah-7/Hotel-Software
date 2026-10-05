const fs = require('fs');

// Fix AddReservation.jsx
let file = 'Client/src/features/reservations/pages/AddReservation.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix CNIC upload div onClick to prevent form interference
content = content.replace(
  /onClick=\{(\(\) => fileInputRef\.current\?\.click\(\))\}/,
  'onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}'
);

// 2. Fix profile image upload div onClick 
content = content.replace(
  /onClick=\{(\(\) => profileImageInputRef\.current\?\.click\(\))\}/,
  'onClick={(e) => { e.preventDefault(); e.stopPropagation(); profileImageInputRef.current?.click(); }}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed AddReservation.jsx');

// Fix EditReservation.jsx too
file = 'Client/src/features/reservations/pages/EditReservation.jsx';
if (fs.existsSync(file)) {
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /onClick=\{(\(\) => fileInputRef\.current\?\.click\(\))\}/,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}'
  );
  content = content.replace(
    /onClick=\{(\(\) => profileImageInputRef\.current\?\.click\(\))\}/,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); profileImageInputRef.current?.click(); }}'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed EditReservation.jsx');
}
