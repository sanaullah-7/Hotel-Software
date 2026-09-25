const fs = require('fs');
let file = 'src/features/settings/pages/HotelProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add Person as UserIcon to the imports
content = content.replace(/import \{([\s\S]*?)CheckCircle as SuccessIcon\s*\} from '@mui\/icons-material';/, `import {$1CheckCircle as SuccessIcon,
  Person as UserIcon
} from '@mui/icons-material';`);

// Update the field to use UserIcon
content = content.replace(/<FormField readOnly=\{\!isEditing\}\s*label="Hotel Owner Name"\s*name="shayan"\s*icon=\{TaglineIcon\}/, `<FormField readOnly={!isEditing}
   label="Hotel Owner Name"
   name="shayan"
   icon={UserIcon}`);

fs.writeFileSync(file, content, 'utf8');
