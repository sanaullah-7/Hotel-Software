import authBg from '../../assets/images/auth-bg.jpg';
import authCardBg from '../../assets/images/authcard.jpg';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TextField, Checkbox, FormControlLabel, Button, InputAdornment, IconButton, Alert, Snackbar } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Hotel } from '@mui/icons-material';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setError('');
      setSuccessMessage(location.state.message);
    }
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) setEmail(savedEmail);
    }
  }, [location]);

  const handleLogin = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const registeredUserRaw = localStorage.getItem('registeredUser');
    let registeredUser = null;
    if (registeredUserRaw) {
      try {
        registeredUser = JSON.parse(registeredUserRaw);
      } catch (err) {
        console.error(err);
      }
    }

    const savedPassword = localStorage.getItem('userPassword');
    const isRegisteredAccount = registeredUser 
      ? (registeredUser.email.toLowerCase() === email.toLowerCase() && registeredUser.password === password)
      : (localStorage.getItem('userEmail')?.toLowerCase() === email.toLowerCase() && savedPassword === password);

    const isDemoAccount = (email.toLowerCase() === 'admin@hotel.com' && password === 'admin123');

    if (isDemoAccount || isRegisteredAccount || (email && password)) {
      if (registeredUser && registeredUser.email.toLowerCase() === email.toLowerCase()) {
        if (registeredUser.fullName) localStorage.setItem('fullName', registeredUser.fullName);
        if (registeredUser.hotelName) localStorage.setItem('hotelName', registeredUser.hotelName);
      }
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
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
        <img src={authBg} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Card */}
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
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <TextField fullWidth size="small" sx={{ 
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
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
              <TextField fullWidth size="small" sx={{ 
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
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
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
    </div>
  );
}
