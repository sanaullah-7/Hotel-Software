import authBg from '../../assets/images/auth-bg.webp';
import authCardBg from '../../assets/images/authcard.webp';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Checkbox, FormControlLabel, Button, InputAdornment, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Business, Phone } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { registerHotel } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    hotelName: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setEmailError('');
    setErrorMessage('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password || !formData.hotelName.trim()) {
      setErrorMessage('Please fill in all required fields including your hotel name.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.phone && !/^03[0-9]{9}$/.test(formData.phone.trim())) {
      setErrorMessage('Phone must be a valid Pakistani number (03XXXXXXXXX)');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerHotel({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        password: formData.password,
        hotelName: formData.hotelName?.trim(),
      });

      if (formData.hotelName?.trim()) {
        localStorage.setItem('hotelName', formData.hotelName.trim());
      }
      if (formData.fullName?.trim()) {
        localStorage.setItem('fullName', formData.fullName.trim());
      }

      setIsSubmitted(true);
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('already exists')) {
        setEmailError(msg);
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
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
              Register your hotel property and start managing five-star guest experiences today.
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
            {isSubmitted ? (
              <div className="text-center py-6 animate-fadein">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-200">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                  Pending Super Admin Review
                </span>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Application Received!</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Thank you for registering <strong className="text-gray-900 font-semibold">{formData.hotelName}</strong>.
                </p>
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-left text-xs text-gray-600 space-y-2 mb-6 shadow-sm">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-gray-400">Hotel Property:</span>
                    <span className="font-semibold text-gray-800">{formData.hotelName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-gray-400">Admin Account:</span>
                    <span className="font-semibold text-gray-800">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Review Status:</span>
                    <span className="font-bold text-amber-600">Pending Approval</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-6">
                  For platform safety and dedicated database isolation, all new hotel requests are verified by our Super Admin. You will be able to log in as soon as your hotel is approved.
                </p>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{
                    bgcolor: 'var(--primary-main)',
                    color: 'white',
                    py: 1.2,
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'var(--primary-dark, #0f172a)' }
                  }}
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3 text-3xl">Create account</h2>

                {errorMessage && (
                  <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {errorMessage}
                  </p>
                )}

                <form onSubmit={handleRegister} className="space-y-2.5">
                  <div>
                    <label htmlFor="register-full-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                    <TextField
                  id="register-full-name"
                  fullWidth
                  size="small"
                  required
                  sx={{ 
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
                  placeholder="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isSubmitting}
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
                <TextField
                  id="register-email"
                  fullWidth
                  size="small"
                  required
                  type="email"
                  sx={{ 
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  error={!!emailError}
                  helperText={emailError}
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

              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="register-phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone</label>
                  <TextField
                    id="register-phone"
                    fullWidth
                    size="small"
                    sx={{ 
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
                    placeholder="03001234567"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone className="text-gray-400" fontSize="small" />
                        </InputAdornment>
                      ),
                      className: "bg-gray-50 rounded-xl",
                      sx: { '& fieldset': { borderColor: '#e5e7eb' } }
                    }}
                  />
                </div>

                <div className="flex-1">
                  <label htmlFor="register-hotel-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Hotel Property</label>
                  <TextField
                    id="register-hotel-name"
                    fullWidth
                    size="small"
                    sx={{ 
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
                    placeholder="Hotel Name"
                    name="hotelName"
                    value={formData.hotelName}
                    onChange={handleChange}
                    disabled={isSubmitting}
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
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="register-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                  <TextField
                    id="register-password"
                    fullWidth
                    size="small"
                    required
                    sx={{ 
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
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
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
                  <label htmlFor="register-confirm-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Confirm</label>
                  <TextField
                    id="register-confirm-password"
                    fullWidth
                    size="small"
                    required
                    sx={{ 
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
                    disabled={isSubmitting}
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

              <div className="flex items-center mt-1 mb-2">
                <FormControlLabel
                  control={<Checkbox required sx={{ color: "#d1d5db", p: 0.5, pr: 1, "&.Mui-checked": { color: "#22c55e" } }} />}
                  label={
                    <span className="text-[12px] text-gray-600 font-medium">
                      I agree to the <a href="#" className="text-[var(--primary-main)] hover:underline font-bold">Terms</a> & <a href="#" className="text-[var(--primary-main)] hover:underline font-bold">Privacy Policy</a>
                    </span>
                  }
                />
              </div>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                disableElevation
                sx={{
                  bgcolor: 'var(--primary-main)',
                  '&:hover': { bgcolor: 'var(--primary-dark)' },
                  py: 1.2,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {isSubmitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
              </Button>
            </form>
          </>
        )}
      </div>

      <Snackbar open={Boolean(errorMessage)} autoHideDuration={4000} onClose={() => setErrorMessage('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" sx={{ width: '100%', mb: 2, fontSize: '15px' }} variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  </div>
</div>
  );
}
