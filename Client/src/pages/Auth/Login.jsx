import authBg from '../../assets/images/auth-bg.webp';
import authCardBg from '../../assets/images/authcard.webp';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TextField, Checkbox, FormControlLabel, Button, InputAdornment, IconButton, Snackbar, Alert } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Hotel, AccessTime, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';


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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [awaitingApproval, setAwaitingApproval] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  
  const handleLogin = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check hotel_registration_requests from localStorage
    const reqs = getSharedReqs();
    const userReq = reqs.find(r => r.managerEmail && r.managerEmail.toLowerCase() === cleanEmail && r.password === cleanPassword);

    if (userReq) {
      if (userReq.status === 'PENDING') {
        setAwaitingApproval(true);
        return;
      } else if (userReq.status === 'APPROVED') {
        setError('');
        // Update hotelName for Sidebar
        if (userReq.hotelName) localStorage.setItem('hotelName', userReq.hotelName);
        if (userReq.managerName) localStorage.setItem('fullName', userReq.managerName);
        
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
      localStorage.setItem('hotelName', 'Luxuria Hotel');
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


  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-900">
      {/* Top Center Toast Notifications */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3500}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          variant="filled"
          sx={{ width: '100%', boxShadow: 4, fontWeight: 'bold', borderRadius: '12px' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={3500}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError('')}
          severity="error"
          variant="filled"
          sx={{ width: '100%', boxShadow: 4, fontWeight: 'bold', borderRadius: '12px' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Outer Background */}
      <div className="absolute inset-0 z-0">
        <img src={authBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      
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
      <div className="z-10 flex w-[95%] max-w-[1000px] h-[90vh] max-h-[700px] bg-black rounded-2xl shadow-2xl overflow-hidden border border-white/40 ring-1 ring-white/20">

      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 bg-[#EFF4F8] relative overflow-y-auto no-scrollbar py-4">
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-main)] flex items-center justify-center text-white font-bold text-xl">
            H
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Hotel</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Management System</p>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto mt-10">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-5">Sign in to manage reservations, rooms and guests.</p>
          {error && <p id="login-error" role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <TextField id="login-email" fullWidth size="small" sx={{ 
                  backgroundColor: "white", 
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#22c55e",
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#22c55e"
                  }
                }}
                variant="outlined"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email className="text-gray-400" fontSize="small" />
                    </InputAdornment>
                  ),
                  className: "bg-gray-50 rounded-xl",
                  sx: { '& fieldset': { borderColor: '#e5e7eb' } }
                }}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
              <TextField id="login-password" fullWidth size="small" sx={{ 
                  backgroundColor: "white", 
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#22c55e",
                    }
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#22c55e"
                  }
                }}
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="text-gray-400" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} edge="end" size="small">
                        {showPassword ? <VisibilityOff className="text-gray-400" fontSize="small" /> : <Visibility className="text-gray-400" fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  className: "bg-gray-50 rounded-xl",
                  sx: { '& fieldset': { borderColor: '#e5e7eb' } }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <FormControlLabel
                control={<Checkbox sx={{ color: "#d1d5db", "&.Mui-checked": { color: "#22c55e" } }} />}
                label={<span className="text-sm text-gray-600 font-medium">Remember me</span>}
              />
              <a href="#" className="text-sm font-semibold text-[var(--primary-main)] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              sx={{
                bgcolor: 'var(--primary-main)',
                '&:hover': { bgcolor: 'var(--primary-dark)' },
                py: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-3 bg-[#f8f9fa] border border-gray-100 rounded-xl flex gap-3">
            <Hotel className="text-[var(--primary-main)] mt-0.5" fontSize="small" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Demo credentials</p>
              <p className="text-xs text-gray-500 mt-1">Email: admin@hotel.com • Password: admin123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img src={authCardBg} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
        
        <div className="relative z-20 w-full flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-6">
            <svg className="w-12 h-12 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-4xl font-serif text-white font-bold mb-4 drop-shadow-lg">Hotel Admin Panel</h2>
          <p className="text-lg text-white/90 mb-10 max-w-md drop-shadow-md">
            Where every stay becomes a story. Sign in to your admin dashboard to manage your property.
          </p>
          
          <Link to="/register" className="inline-block">
            <Button
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                px: 6,
                py: 1.5,
                borderRadius: '30px',
                textTransform: 'none',
                fontWeight: 'bold',
                backdropFilter: 'blur(4px)'
              }}
            >
              Create Account
            </Button>
          </Link>
        </div>
      </div>
          </div>
      )}
    </div>
  );
}
