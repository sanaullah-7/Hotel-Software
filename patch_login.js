const fs = require('fs');

const file = 'Client/src/pages/Auth/Login.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add Clock/Check icons import
content = content.replace(
  /import { Visibility, VisibilityOff, Email, Lock, Hotel } from '@mui\/icons-material';/,
  `import { Visibility, VisibilityOff, Email, Lock, Hotel, AccessTime, ArrowBack } from '@mui/icons-material';`
);

// Add awaitingApproval state
content = content.replace(
  /const \[error, setError\] = useState\(''\);/,
  `const [error, setError] = useState('');\n  const [awaitingApproval, setAwaitingApproval] = useState(false);`
);

// Modify handleLogin
const newHandleLogin = `
  const handleLogin = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check hotel_registration_requests from localStorage
    const reqs = JSON.parse(localStorage.getItem('hotel_registration_requests') || '[]');
    const userReq = reqs.find(r => r.managerEmail && r.managerEmail.toLowerCase() === cleanEmail && r.password === cleanPassword);

    if (userReq) {
      if (userReq.status === 'PENDING') {
        setAwaitingApproval(true);
        return;
      } else if (userReq.status === 'APPROVED') {
        setError('');
        login({
          email: userReq.managerEmail,
          role: 'Admin',
          name: userReq.managerName || 'Admin',
        });
        navigate('/dashboard');
        return;
      }
    }

    if (cleanEmail === 'admin@hotel.com' && cleanPassword === 'admin123') {
      setError('');
      login({
        email: 'admin@hotel.com',
        role: 'Admin',
        name: localStorage.getItem('fullName') || 'Admin',
      });
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };
`;

content = content.replace(
  /const handleLogin = \(e\) => \{[\s\S]*?setError\('Invalid email or password'\);\s*\}\s*\};/,
  newHandleLogin
);

// The Awaiting Approval UI
const awaitingUI = `
      {awaitingApproval ? (
        <div className="z-10 flex flex-col items-center justify-center w-full max-w-md p-8 rounded-2xl relative" style={{ backgroundColor: '#1a2332' }}>
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <AccessTime sx={{ fontSize: 48, color: '#f97316' }} />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            Awaiting Admin<br/>Approval
          </h2>
          
          <p className="text-slate-400 text-center mb-8 text-sm leading-relaxed px-4">
            Your email has been verified. Your hotel account is now pending approval from the administrator. You will receive an email notification once approved.
          </p>

          <div className="bg-[#fff9ed] rounded-xl p-6 w-full mb-8 text-[#925f24]">
            <h3 className="font-semibold text-lg mb-3">What happens next?</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="mr-2">&bull;</span>
                Admin reviews your registration details
              </li>
              <li className="flex items-start">
                <span className="mr-2">&bull;</span>
                Approval usually takes 24-48 hours
              </li>
              <li className="flex items-start">
                <span className="mr-2">&bull;</span>
                You'll receive an email notification
              </li>
              <li className="flex items-start">
                <span className="mr-2">&bull;</span>
                Then you can log in to your dashboard
              </li>
            </ul>
          </div>

          <button 
            onClick={() => setAwaitingApproval(false)}
            className="flex items-center text-blue-500 hover:text-blue-400 font-medium transition-colors"
          >
            <ArrowBack sx={{ fontSize: 18, mr: 1 }} />
            Back to Login
          </button>
        </div>
      ) : (
      {/* Main Card */}
      <div className="z-10 flex w-[95%] max-w-[1000px] h-[90vh] max-h-[700px] bg-black rounded-2xl shadow-2xl overflow-hidden border border-white/40 ring-1 ring-white/20">
`;

content = content.replace(
  /\{\/\* Main Card \*\/\}\s*<div className="z-10 flex w-\[95%\] max-w-\[1000px\] h-\[90vh\] max-h-\[700px\] bg-black rounded-2xl shadow-2xl overflow-hidden border border-white\/40 ring-1 ring-white\/20">/,
  awaitingUI
);

// close the conditional rendering for the main card
content = content.replace(
  /<\/div>\s*<\/div>\s*\);\s*\}\s*$/,
  `</div>\n      )}\n    </div>\n  );\n}\n`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Login.jsx');

