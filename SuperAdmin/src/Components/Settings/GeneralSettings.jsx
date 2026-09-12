import { useState } from 'react';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import { Sun, Moon, Globe } from 'lucide-react';

export default function GeneralSettings() {
  const { theme, toggleTheme } = useSuperAdmin();
  const [siteName, setSiteName] = useState('Explore Pakistan');
  const [supportEmail, setSupportEmail] = useState('support@explorepakistan.pk');
  const [currency, setCurrency] = useState('PKR');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>General Platform Configuration</h3>

      {/* Theme Appearance */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
          Appearance Theme
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => theme === 'dark' && toggleTheme()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 8,
              border: theme === 'light' ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
              background: theme === 'light' ? 'rgba(99,102,241,0.1)' : 'var(--bg-card-hover)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Sun size={16} />
            Light Mode
          </button>
          <button
            type="button"
            onClick={() => theme === 'light' && toggleTheme()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 8,
              border: theme === 'dark' ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
              background: theme === 'dark' ? 'rgba(99,102,241,0.1)' : 'var(--bg-card-hover)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Moon size={16} />
            Dark Mode
          </button>
        </div>
      </div>

      {/* Platform Name */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Platform Title
        </label>
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="search-input"
          style={{ width: '100%', maxWidth: 400 }}
        />
      </div>

      {/* Support Contact */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Support Contact Email
        </label>
        <input
          type="email"
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          className="search-input"
          style={{ width: '100%', maxWidth: 400 }}
        />
      </div>

      {/* Currency */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Default Currency
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="filter-select"
          style={{ width: '100%', maxWidth: 240 }}
        >
          <option value="PKR">PKR — Pakistani Rupee</option>
          <option value="USD">USD — US Dollar</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
        <button type="submit" className="btn btn-primary">
          Save Settings
        </button>
        {saved && <span style={{ color: '#10b981', fontSize: 13, fontWeight: 500 }}>Saved successfully!</span>}
      </div>
    </form>
  );
}
