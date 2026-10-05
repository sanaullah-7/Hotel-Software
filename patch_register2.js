const fs = require('fs');
const file = 'Client/src/pages/Auth/Register.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add Snackbar and Alert to imports
content = content.replace(
  /import \{ TextField, Checkbox, FormControlLabel, Button, InputAdornment, IconButton \} from '@mui\/material';/,
  `import { TextField, Checkbox, FormControlLabel, Button, InputAdornment, IconButton, Snackbar, Alert } from '@mui/material';`
);

// Add state for emailError and success
content = content.replace(
  /const \[showPassword, setShowPassword\] = useState\(false\);/,
  `const [showPassword, setShowPassword] = useState(false);\n  const [emailError, setEmailError] = useState('');\n  const [successMsg, setSuccessMsg] = useState(false);`
);

// Update handleRegister logic
const newHandleRegister = `
  const handleRegister = (e) => {
    e.preventDefault();
    setEmailError('');
    
    const existingReqs = getSharedReqs();
    
    // 1. Check if email already exists
    if (existingReqs.some(req => req.managerEmail && req.managerEmail.toLowerCase() === formData.email.trim().toLowerCase())) {
      setEmailError('Email already exists');
      return;
    }
    
    if (formData.hotelName) {
      localStorage.setItem('hotelName', formData.hotelName);
    }
    if (formData.fullName) {
      localStorage.setItem('fullName', formData.fullName);
    }
    
    // Create new registration request
    const newReq = {
      id: 'req-' + Date.now(),
      hotelName: formData.hotelName,
      managerName: formData.fullName,
      managerEmail: formData.email,
      password: formData.password, // Only for frontend simulation
      status: 'PENDING',
      registeredAt: new Date().toISOString().split('T')[0],
      totalRooms: 100, // Default for mock
      subscriptionPlan: 'STANDARD',
      city: 'Unknown',
      phone: 'Unknown'
    };
    existingReqs.push(newReq);
    
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

    // 2. Show success popup and delay navigation
    setSuccessMsg(true);
    setTimeout(() => {
      navigate('/login', { state: { registeredEmail: formData.email } });
    }, 4000);
  };
`;

content = content.replace(
  /const handleRegister = \(e\) => \{[\s\S]*?navigate\('\/login', \{ state: \{ registeredEmail: formData\.email \} \}\);\s*\};/,
  newHandleRegister.trim()
);

// In the render, hook up the email error text
content = content.replace(
  /<TextField\s*fullWidth\s*placeholder="Email"\s*name="email"\s*type="email"/,
  `<TextField fullWidth placeholder="Email" name="email" type="email" error={!!emailError} helperText={emailError}`
);

// Also we need to inject the Snackbar into the JSX before the closing div of the return
content = content.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/,
  `    {/* Success Toast */}
      <Snackbar open={successMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%', mb: 2, fontSize: '15px' }} variant="filled">
          Registration is pending, your request has been sent to the admin. After approval, you can login.
        </Alert>
      </Snackbar>
    </div>
  </div>
</div>
  );
}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Register.jsx');
