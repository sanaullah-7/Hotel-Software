import { useState } from 'react';
import { Shield, Key, Lock } from 'lucide-react';

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [statusMsg, setStatusMsg] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setStatusMsg('Please fill in password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg('New passwords do not match.');
      return;
    }
    setStatusMsg('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Password Change Form */}
      <form onSubmit={handlePasswordChange} className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={18} color="var(--accent-purple)" />
          Change Admin Password
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="search-input"
              style={{ width: '100%' }}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="search-input"
              style={{ width: '100%' }}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="search-input"
              style={{ width: '100%' }}
              placeholder="••••••••"
            />
          </div>

          {statusMsg && (
            <div style={{ fontSize: 13, color: statusMsg.includes('success') ? '#10b981' : '#ef4444' }}>
              {statusMsg}
            </div>
          )}

          <div style={{ paddingTop: 8 }}>
            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </div>
        </div>
      </form>

      {/* 2FA & Session */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} color="var(--accent-purple)" />
          Session & Two-Factor Authentication
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Require Two-Factor Authentication (2FA)</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Require SMS / Authenticator app OTP code upon admin sign-in</div>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-purple)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Auto Session Inactivity Timeout</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Automatically invalidate session after idle duration</div>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="filter-select"
              style={{ width: 160 }}
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="240">4 Hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
