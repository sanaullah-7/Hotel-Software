import authBg from '../../assets/images/auth-bg.webp';
import authCardBg from '../../assets/images/authcard.webp';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Checkbox, FormControlLabel, Button, InputAdornment, IconButton, Snackbar, Alert } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Business } from '@mui/icons-material';


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

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    hotelName: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
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
    if (formData.email) {
      localStorage.setItem('userEmail', formData.email);
    }
    if (formData.password) {
      localStorage.setItem('userPassword', formData.password);
    }
    localStorage.setItem('registeredUser', JSON.stringify({
      fullName: formData.fullName,
      email: formData.email,
      hotelName: formData.hotelName,
      password: formData.password
    }));

    // Create new registration request for superadmin approvals
    const newReq = {
      id: 'req-' + Date.now(),
      hotelName: formData.hotelName,
      managerName: formData.fullName,
      managerEmail: formData.email,
      password: formData.password,
      status: 'PENDING',
      registeredAt: new Date().toISOString().split('T')[0],
      totalRooms: 100,
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

    setSuccessMsg(true);
    setTimeout(() => {
      navigate('/login', { 
        state: { 
          message: 'Account created successfully! Please sign in with your credentials.', 
          email: formData.email,
          registeredEmail: formData.email
        } 
      });
    }, 2000);
  };


  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-900">
      {/* Outer Background */}
      <div className="absolute inset-0 z-0">
        <img src={authBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Card */}
      <div className="z-10 flex w-[95%] max-w-[1000px] h-[90vh] max-h-[700px] rounded-2xl shadow-2xl overflow-hidden border border-white/40 ring-1 ring-white/20">
      {/* Left Image Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">  
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img src={authCardBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        
        <div className="relative z-20 w-full flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-6">
            <svg className="w-12 h-12 text-[var(--primary-main)] mx-auto drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-4xl font-serif text-white font-bold mb-4 drop-shadow-lg">Join the Grand Team</h2>
          <p className="text-lg text-white/90 mb-10 max-w-md drop-shadow-md">
            Create your staff account and start managing five-star experiences today.
          </p>
          
          <Link to="/login" className="inline-block">
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
                py: 1,
                borderRadius: '30px',
                textTransform: 'none',
                fontWeight: 'bold',
                backdropFilter: 'blur(4px)'
              }}
            >
              Sign In Instead
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 bg-[#EFF4F8] relative overflow-y-auto no-scrollbar py-4">
        <div className="max-w-md w-full mx-auto my-4">
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-5 text-3xl">Create account</h2>


          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label htmlFor="register-full-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
              <TextField id="register-full-name" fullWidth size="small" sx={{ 
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
                placeholder="full name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person className="text-gray-400" fontSize="small" />
                    </InputAdornment>
                  ),
                  className: "bg-gray-50 rounded-xl",
                  sx: { '& fieldset': { borderColor: '#e5e7eb' } }
                }}
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <TextField id="register-email" fullWidth size="small" sx={{ 
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
                name="email" value={formData.email} onChange={handleChange} error={!!emailError} helperText={emailError}
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
              <label htmlFor="register-hotel-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Hotel Name</label>
              <TextField id="register-hotel-name" fullWidth size="small" sx={{ 
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
                placeholder="hotel name"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business className="text-gray-400" fontSize="small" />
                    </InputAdornment>
                  ),
                  className: "bg-gray-50 rounded-xl",
                  sx: { '& fieldset': { borderColor: '#e5e7eb' } }
                }}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="register-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                <TextField id="register-password" fullWidth size="small" sx={{ 
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
                  placeholder="new password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" fontSize="small" />
                      </InputAdornment>
                    ),
                    className: "bg-gray-50 rounded-xl",
                    sx: { '& fieldset': { borderColor: '#e5e7eb' } }
                  }}
                />
              </div>

              <div className="flex-1">
                <label htmlFor="register-confirm-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Confirm Password</label>
                <TextField id="register-confirm-password" fullWidth size="small" sx={{ 
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
                  placeholder="Repeat"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide passwords' : 'Show passwords'} aria-pressed={showPassword} edge="end" size="small">
                          {showPassword ? <VisibilityOff className="text-gray-400" fontSize="small" /> : <Visibility className="text-gray-400" fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    className: "bg-gray-50 rounded-xl",
                    sx: { '& fieldset': { borderColor: '#e5e7eb' } }
                  }}
                />
              </div>
            </div>

            <div className="flex  items-center mt-1 mb-3">
              <FormControlLabel
                control={<Checkbox required sx={{ color: "#d1d5db", p: 0.5, pr: 1, "&.Mui-checked": { color: "#22c55e" } }} />}
                label={
                  <span className="text-[13px] text-gray-600 font-medium">
                    I agree to the <a href="#" className="text-[var(--primary-main)] hover:underline font-bold">Terms of Service</a> & <a href="#" className="text-[var(--primary-main)] hover:underline font-bold">Privacy Policy</a>
                  </span>
                }
              />
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              sx={{
                bgcolor: 'var(--primary-main)',
                '&:hover': { bgcolor: 'var(--primary-dark)' },
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Create Account
            </Button>
          </form>
        </div>
          {/* Success Toast */}
      <Snackbar open={successMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%', mb: 2, fontSize: '15px' }} variant="filled">
          Registration is pending, your request has been sent to the admin. After approval, you can login.
        </Alert>
      </Snackbar>
    </div>
  </div>
</div>
  );
}
