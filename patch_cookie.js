const fs = require('fs');

// The shared helper to inject
const sharedHelpers = `
// Cross-port shared storage helper
const getSharedReqs = () => {
  try {
    const match = document.cookie.match(new RegExp('(^| )hotel_registration_requests=([^;]+)'));
    if (match) return JSON.parse(decodeURIComponent(match[2]));
  } catch(e) {}
  return JSON.parse(localStorage.getItem('hotel_registration_requests') || '[]');
};

const setSharedReqs = (reqs) => {
  const val = JSON.stringify(reqs);
  localStorage.setItem('hotel_registration_requests', val);
  document.cookie = "hotel_registration_requests=" + encodeURIComponent(val) + "; path=/; max-age=31536000";
};
`;


// 1. Patch Register.jsx
let registerFile = 'Client/src/pages/Auth/Register.jsx';
let registerContent = fs.readFileSync(registerFile, 'utf8');

// Insert helpers before component
registerContent = registerContent.replace(
  /export default function Register\(\) \{/,
  sharedHelpers + '\nexport default function Register() {'
);

// Replace get
registerContent = registerContent.replace(
  /const existingReqs = JSON\.parse\(localStorage\.getItem\('hotel_registration_requests'\) \|\| '\[\]'\);/g,
  'const existingReqs = getSharedReqs();'
);

// Replace set and try/catch block
const newSetBlock = `
    try {
      setSharedReqs(existingReqs);
    } catch (err) {
      console.warn("Storage quota exceeded, trying to free space...");
      try {
        setSharedReqs([newReq]);
      } catch (err2) {
        alert("Browser storage is full. Please clear your browser local storage.");
        return;
      }
    }
`;

registerContent = registerContent.replace(
  /try \{\s*localStorage\.setItem\('hotel_registration_requests', JSON\.stringify\(existingReqs\)\);\s*\} catch \(err\) \{[\s\S]*?return;\s*\}\s*\}/,
  newSetBlock.trim()
);

fs.writeFileSync(registerFile, registerContent, 'utf8');


// 2. Patch Login.jsx
let loginFile = 'Client/src/pages/Auth/Login.jsx';
let loginContent = fs.readFileSync(loginFile, 'utf8');

loginContent = loginContent.replace(
  /export default function Login\(\) \{/,
  sharedHelpers + '\nexport default function Login() {'
);

loginContent = loginContent.replace(
  /const reqs = JSON\.parse\(localStorage\.getItem\('hotel_registration_requests'\) \|\| '\[\]'\);/,
  'const reqs = getSharedReqs();'
);

fs.writeFileSync(loginFile, loginContent, 'utf8');


// 3. Patch ApprovlService.js
let approvalFile = 'SuperAdmin/src/Services/ApprovlService.js';
let approvalContent = fs.readFileSync(approvalFile, 'utf8');

const approvalHelpers = `
const getSharedReqs = () => {
  try {
    const match = document.cookie.match(new RegExp('(^| )hotel_registration_requests=([^;]+)'));
    if (match) return JSON.parse(decodeURIComponent(match[2]));
  } catch(e) {}
  return JSON.parse(localStorage.getItem('hotel_registration_requests') || '[]');
};

const setSharedReqs = (reqs) => {
  const val = JSON.stringify(reqs);
  localStorage.setItem('hotel_registration_requests', val);
  document.cookie = "hotel_registration_requests=" + encodeURIComponent(val) + "; path=/; max-age=31536000";
};
`;

approvalContent = approvalContent.replace(
  /const getLocalApprovals = \(\) => \{[\s\S]*?return \[\];\n\};/,
  approvalHelpers + '\nconst getLocalApprovals = () => getSharedReqs();'
);

approvalContent = approvalContent.replace(
  /const saveLocalApprovals = \(data\) => \{\s*localStorage\.setItem\('hotel_registration_requests', JSON\.stringify\(data\)\);\s*\};/,
  'const saveLocalApprovals = (data) => setSharedReqs(data);'
);

fs.writeFileSync(approvalFile, approvalContent, 'utf8');

console.log('Patched all files to use shared cookie storage');
