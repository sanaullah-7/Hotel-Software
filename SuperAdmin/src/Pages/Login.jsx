import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../Context/SuperAdminContext.jsx';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Users2,
  Layers,
  ArrowRight,
  Sparkles,
  AlertCircle,
  KeyRound,
  X,
  FileCheck2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Secure Platform Management',
    desc: 'Enterprise-grade encryption and active audit telemetry.',
  },
  {
    icon: Building2,
    title: 'Multi-Hotel Management',
    desc: 'Centralized governance for nationwide resort portfolios.',
  },
  {
    icon: Users2,
    title: 'Role-Based Access Control',
    desc: 'Tiered authorization for Super Admins and Managers.',
  },
  {
    icon: FileCheck2,
    title: 'Hotel Registration Approval',
    desc: 'Fast property verification with automated sign-offs.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Live financial telemetry, MRR tracking, and growth curves.',
  },
  {
    icon: Layers,
    title: 'Scalable SaaS Architecture',
    desc: 'High-availability multi-tenant cloud framework.',
  },
];

export default function Login() {
  const { login } = useSuperAdmin();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Fast developer autofill helper
  const handleAutofill = () => {
    setEmail('admin@explorepakistan.com');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      // Simulated secure authentication verification
      await new Promise((r) => setTimeout(r, 650));

      if (email.trim().toLowerCase() === 'admin@explorepakistan.com' && password === 'admin123') {
        login('mock-jwt-token-super-admin', {
          name: 'Super Admin',
          email: email.trim(),
          role: 'SUPER_ADMIN',
          rememberMe,
        });
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid credentials. Please use admin@explorepakistan.com / admin123');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to authentication gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2200);
  };

  return (
    <div className="ep-login-container">
      {/* ─────────────────────────────────────────────────────────────────────────
          LEFT BRANDING PANEL (Fixed 100vh, Zero Page Scroll)
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="ep-brand-panel" aria-label="Explore Pakistan Platform Overview">
        {/* Subtle geometric & gradient elements */}
        <div className="ep-brand-glow ep-glow-1" aria-hidden="true" />
        <div className="ep-brand-glow ep-glow-2" aria-hidden="true" />
        <div className="ep-brand-grid" aria-hidden="true" />

        <div className="ep-brand-inner">
          {/* Top Logo & Identity */}
          <div className="ep-brand-header">
            <div className="ep-brand-logo-group">
              <div className="ep-brand-logo-box">
                <Building2 size={22} color="#ffffff" strokeWidth={2.2} />
              </div>
              <div>
                <div className="ep-brand-name">Explore Pakistan</div>
                <div className="ep-brand-title">Hotel Management SaaS Platform</div>
              </div>
            </div>
            <div className="ep-admin-badge">SUPER ADMIN PORTAL</div>
          </div>

          {/* Main Hero & Description */}
          <div className="ep-brand-hero">
            <div className="ep-tagline-pill">Enterprise Hospitality Cloud</div>
            <h1 className="ep-hero-tagline">
              Smart Hotel Operations. <br />
              Secure Administration. <br />
              <span className="ep-highlight-text">Scalable Hospitality Management.</span>
            </h1>
            <p className="ep-hero-desc">
              Explore Pakistan Hotel Management SaaS helps hotels manage operations, staff, bookings, guests, and business administration through one centralized platform.
            </p>
          </div>

          {/* 6 Feature Highlights Cards */}
          <div className="ep-features-grid">
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="ep-feature-card">
                  <div className="ep-feature-icon-box">
                    <Icon size={16} />
                  </div>
                  <div className="ep-feature-content">
                    <h2 className="ep-feature-title">{item.title}</h2>
                    <p className="ep-feature-desc">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Security / Status Row */}
          <div className="ep-brand-footer">
            <div className="ep-status-pill">
              <span className="ep-pulse-dot" />
              <span>System Status: <strong>Operational</strong></span>
            </div>
            <div className="ep-footer-sep" />
            <div className="ep-sec-badge">
              <ShieldCheck size={14} style={{ color: '#10b981' }} />
              <span>TLS 1.3 / 256-Bit Encrypted</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          RIGHT LOGIN CARD SECTION (Centered, 100vh Locked)
          ───────────────────────────────────────────────────────────────────────── */}
      <main className="ep-auth-panel">
        <div className="ep-auth-card animate-fadein">
          {/* Mobile-only Branding Header */}
          <div className="ep-mobile-header">
            <div className="ep-brand-logo-box ep-mobile-logo">
              <Building2 size={22} color="#ffffff" />
            </div>
            <div className="ep-mobile-title">Explore Pakistan</div>
            <div className="ep-mobile-sub">Hotel Management SaaS Platform</div>
          </div>

          {/* Welcome & Subtitle */}
          <div className="ep-card-header">
            <h2 className="ep-welcome-title">Welcome Back</h2>
            <p className="ep-welcome-subtitle">
              Sign in to access the Explore Pakistan Super Admin Portal.
            </p>
          </div>

          {/* Quick Demo Autofill Pill */}
          <div className="ep-autofill-wrap">
            <button
              type="button"
              onClick={handleAutofill}
              className="ep-autofill-btn"
              title="Click to autofill super admin test credentials"
            >
              <span className="ep-autofill-left">
                <Sparkles size={13} className="ep-sparkle" />
                <span>Quick Fill Admin Credentials</span>
              </span>
              <span className="ep-key-chip">admin123</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="ep-error-alert" role="alert">
              <AlertCircle size={15} className="ep-error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="ep-login-form">
            {/* Email Address */}
            <div className="ep-form-field">
              <label htmlFor="ep-email" className="ep-field-label">
                Email Address
              </label>
              <div className="ep-input-wrap">
                <Mail size={15} className="ep-input-icon" />
                <input
                  id="ep-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="admin@explorepakistan.com"
                  className="ep-text-input"
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="ep-form-field">
              <div className="ep-label-split">
                <label htmlFor="ep-password" className="ep-field-label">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="ep-forgot-btn"
                >
                  Forgot password?
                </button>
              </div>
              <div className="ep-input-wrap">
                <Lock size={15} className="ep-input-icon" />
                <input
                  id="ep-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  className="ep-text-input ep-has-toggle"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="ep-toggle-pw"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="ep-remember-wrap">
              <label className="ep-checkbox-label" htmlFor="ep-remember">
                <input
                  id="ep-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="ep-custom-checkbox"
                />
                <span className="ep-checkbox-text">Remember Me</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`ep-submit-btn ${loading ? 'ep-loading' : ''}`}
            >
              {loading ? (
                <span className="ep-btn-loading-content">
                  <span className="ep-spinner" />
                  <span>Signing In…</span>
                </span>
              ) : (
                <span className="ep-btn-content">
                  <span>Sign In</span>
                  <ArrowRight size={15} className="ep-btn-icon" />
                </span>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="ep-security-note">
            <ShieldCheck size={14} className="ep-sec-icon" />
            <span>Protected by secure authentication and role-based access control.</span>
          </div>

          {/* Footer */}
          <footer className="ep-auth-footer">
            <p>© Explore Pakistan Hotel Management SaaS</p>
          </footer>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────────────────
          FORGOT PASSWORD MODAL (Accessible Dialog)
          ───────────────────────────────────────────────────────────────────────── */}
      {showForgotModal && (
        <div className="sa-overlay" role="dialog" aria-modal="true" aria-label="Password Reset Request">
          <div className="sa-modal" style={{ maxWidth: 440 }}>
            <div className="sa-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(30, 58, 138, 0.12)', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0f172a' }}>Reset Password</h3>
                  <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0' }}>Super Admin security recovery</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="btn btn-ghost btn-icon"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="sa-modal-body">
              {forgotSent ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Recovery Link Dispatched</h4>
                  <p style={{ fontSize: 12.5, color: '#475569', margin: 0 }}>
                    If an administrator account matches <strong>{forgotEmail}</strong>, password reset instructions have been sent.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                    Enter your registered Super Administrator email address to receive a secure, time-limited password reset link.
                  </p>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 5 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@explorepakistan.com"
                      className="ep-text-input"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="btn btn-secondary"
                      style={{ fontSize: 12 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn"
                      style={{ background: '#1e3a8a', color: '#ffffff', fontSize: 12 }}
                      disabled={!forgotEmail}
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          STYLES (Strictly Zero-Scroll Viewport Layout)
          ───────────────────────────────────────────────────────────────────────── */}
      <style>{`
        /* Viewport Lock */
        .ep-login-container {
          display: flex;
          height: 100vh;
          max-height: 100vh;
          width: 100vw;
          max-width: 100vw;
          background-color: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
          overflow: hidden;
          position: fixed;
          inset: 0;
          margin: 0;
          padding: 0;
        }

        /* ── Left Branding Panel (No scroll) ─────────────────────────────────── */
        .ep-brand-panel {
          position: relative;
          width: 54%;
          height: 100vh;
          max-height: 100vh;
          background: linear-gradient(150deg, #0b1528 0%, #0f244a 45%, #132d5e 100%);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(20px, 3.2vh, 40px) clamp(24px, 3.2vw, 44px);
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          box-sizing: border-box;
        }

        .ep-brand-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .ep-glow-1 {
          top: -10%;
          left: -10%;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%);
        }

        .ep-glow-2 {
          bottom: -10%;
          right: -10%;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(30, 58, 138, 0.3) 0%, transparent 70%);
        }

        .ep-brand-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.5;
          pointer-events: none;
        }

        .ep-brand-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
          gap: clamp(12px, 2vh, 24px);
        }

        /* Branding Header */
        .ep-brand-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-shrink: 0;
        }

        .ep-brand-logo-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ep-brand-logo-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.35);
          flex-shrink: 0;
        }

        .ep-brand-name {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          line-height: 1.15;
        }

        .ep-brand-title {
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.02em;
        }

        .ep-admin-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(37, 99, 235, 0.16);
          border: 1px solid rgba(59, 130, 246, 0.3);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #93c5fd;
          flex-shrink: 0;
        }

        /* Hero */
        .ep-brand-hero {
          max-width: 540px;
          flex-shrink: 0;
        }

        .ep-tagline-pill {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #60a5fa;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .ep-hero-tagline {
          font-size: clamp(20px, 2.7vh, 26px);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0 0 8px;
        }

        .ep-highlight-text {
          background: linear-gradient(135deg, #93c5fd 0%, #bfdbfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ep-hero-desc {
          font-size: clamp(12px, 1.4vh, 13px);
          line-height: 1.5;
          color: #94a3b8;
          margin: 0;
        }

        /* Features Grid */
        .ep-features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(8px, 1.2vh, 12px);
          flex: 1;
          align-content: center;
        }

        .ep-feature-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: clamp(8px, 1.1vh, 11px) 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(8px);
          transition: all 180ms ease;
        }

        .ep-feature-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(96, 165, 250, 0.35);
          transform: translateY(-1px);
        }

        .ep-feature-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(37, 99, 235, 0.2);
          color: #93c5fd;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ep-feature-content {
          flex: 1;
          min-width: 0;
        }

        .ep-feature-title {
          font-size: 11.5px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ep-feature-desc {
          font-size: 10.5px;
          color: #94a3b8;
          line-height: 1.35;
          margin: 0;
        }

        /* Branding Footer */
        .ep-brand-footer {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: clamp(10px, 1.5vh, 14px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11.5px;
          color: #94a3b8;
          flex-shrink: 0;
        }

        .ep-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ep-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          display: inline-block;
        }

        .ep-footer-sep {
          width: 1px;
          height: 12px;
          background: rgba(255, 255, 255, 0.15);
        }

        .ep-sec-badge {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* ── Right Auth Panel (No scroll) ────────────────────────────────────── */
        .ep-auth-panel {
          flex: 1;
          height: 100vh;
          max-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 2.5vh, 32px) clamp(16px, 2.5vw, 32px);
          background-color: #f8fafc;
          overflow: hidden;
          box-sizing: border-box;
        }

        .ep-auth-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.02);
          padding: clamp(22px, 3vh, 32px) clamp(22px, 2.8vw, 30px);
          box-sizing: border-box;
        }

        /* Mobile Header */
        .ep-mobile-header {
          display: none;
          text-align: center;
          margin-bottom: 16px;
        }

        .ep-mobile-logo {
          margin: 0 auto 8px;
        }

        .ep-mobile-title {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
        }

        .ep-mobile-sub {
          font-size: 11px;
          color: #64748b;
        }

        /* Welcome header */
        .ep-welcome-title {
          font-size: clamp(20px, 2.6vh, 23px);
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0 0 4px;
        }

        .ep-welcome-subtitle {
          font-size: clamp(11.5px, 1.4vh, 12.5px);
          color: #64748b;
          line-height: 1.45;
          margin: 0 0 clamp(10px, 1.5vh, 16px);
        }

        /* Autofill Helper Button */
        .ep-autofill-wrap {
          margin-bottom: clamp(10px, 1.5vh, 14px);
        }

        .ep-autofill-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          background: #eff6ff;
          border: 1px dashed #bfdbfe;
          border-radius: 8px;
          color: #1e40af;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 160ms ease;
        }

        .ep-autofill-btn:hover {
          background: #dbeafe;
          border-color: #3b82f6;
          transform: translateY(-1px);
        }

        .ep-autofill-left {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .ep-sparkle {
          color: #2563eb;
        }

        .ep-key-chip {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 10.5px;
          font-family: monospace;
          color: #475569;
        }

        /* Error alert */
        .ep-error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 11px;
          border-radius: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #ef4444;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: clamp(10px, 1.5vh, 14px);
        }

        .ep-error-icon {
          flex-shrink: 0;
        }

        /* Form elements */
        .ep-login-form {
          display: flex;
          flex-direction: column;
          gap: clamp(10px, 1.6vh, 14px);
        }

        .ep-form-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ep-field-label {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
        }

        .ep-label-split {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ep-forgot-btn {
          font-size: 11.5px;
          font-weight: 600;
          color: #1e40af;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 150ms ease;
        }

        .ep-forgot-btn:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .ep-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .ep-input-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          pointer-events: none;
          transition: color 150ms ease;
        }

        .ep-text-input {
          width: 100%;
          height: clamp(38px, 4.8vh, 40px);
          padding: 0 12px 0 38px;
          font-size: 13px;
          font-family: inherit;
          color: #0f172a;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          transition: all 160ms ease;
        }

        .ep-text-input.ep-has-toggle {
          padding-right: 36px;
        }

        .ep-text-input:hover {
          border-color: #94a3b8;
        }

        .ep-text-input:focus {
          background: #ffffff;
          border-color: #1e40af;
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.12);
        }

        .ep-input-wrap:focus-within .ep-input-icon {
          color: #1e40af;
        }

        .ep-toggle-pw {
          position: absolute;
          right: 10px;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 3px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 150ms ease;
        }

        .ep-toggle-pw:hover {
          color: #334155;
        }

        /* Remember me */
        .ep-remember-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1px;
        }

        .ep-checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #475569;
          cursor: pointer;
          user-select: none;
        }

        .ep-custom-checkbox {
          width: 15px;
          height: 15px;
          accent-color: #1e3a8a;
          cursor: pointer;
          border-radius: 4px;
        }

        /* Submit Button */
        .ep-submit-btn {
          width: 100%;
          height: clamp(38px, 4.8vh, 42px);
          border-radius: 8px;
          background: #1e3a8a;
          color: #ffffff;
          font-size: 13.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
          transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ep-submit-btn:hover:not(:disabled) {
          background: #1e40af;
          box-shadow: 0 6px 16px rgba(30, 58, 138, 0.35);
          transform: translateY(-1px);
        }

        .ep-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .ep-submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .ep-btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .ep-btn-icon {
          transition: transform 150ms ease;
        }

        .ep-submit-btn:hover .ep-btn-icon {
          transform: translateX(3px);
        }

        .ep-btn-loading-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ep-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: epSpin 650ms linear infinite;
        }

        @keyframes epSpin {
          to { transform: rotate(360deg); }
        }

        /* Security Note */
        .ep-security-note {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: clamp(10px, 1.8vh, 16px);
          padding: 7px 10px;
          border-radius: 7px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 11px;
          color: #64748b;
          line-height: 1.35;
        }

        .ep-sec-icon {
          color: #10b981;
          flex-shrink: 0;
        }

        /* Footer */
        .ep-auth-footer {
          margin-top: clamp(10px, 1.6vh, 16px);
          text-align: center;
          font-size: 11.5px;
          color: #94a3b8;
        }

        /* ── Responsive Rules ────────────────────────────────────────────────── */
        @media (max-width: 1200px) {
          .ep-brand-panel {
            width: 50%;
            padding: 24px 28px;
          }
          .ep-hero-tagline {
            font-size: 20px;
          }
          .ep-features-grid {
            grid-template-columns: 1fr;
            gap: 6px;
          }
        }

        @media (max-width: 960px) {
          .ep-login-container {
            position: relative;
            height: 100vh;
            overflow-y: auto;
          }
          .ep-brand-panel {
            display: none;
          }
          .ep-mobile-header {
            display: block;
          }
          .ep-auth-panel {
            height: 100%;
            padding: 20px 16px;
          }
          .ep-auth-card {
            padding: 24px 20px;
            box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
          }
        }
      `}</style>
    </div>
  );
}
