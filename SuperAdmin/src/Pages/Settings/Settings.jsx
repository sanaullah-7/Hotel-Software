import PageHeader from '../../Components/Common/pageHeader.jsx';
import { useSuperAdmin } from '../../Context/SuperAdminContext.jsx';
import { Sun, Moon, Bell, Shield, Globe } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useSuperAdmin();

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="sa-card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
        <Icon size={18} style={{ color: 'var(--color-primary)' }} />
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        style={{
          width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--color-primary)' : 'var(--color-border)',
          position: 'relative', transition: 'background var(--transition-base)', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'left var(--transition-base)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );

  return (
    <div className="animate-fadein" style={{ maxWidth: 640 }}>
      <PageHeader title="Settings" subtitle="Manage platform preferences and configurations." />

      <SectionCard title="Appearance" icon={Sun}>
        <Toggle
          label="Dark Mode"
          desc="Use the dark color theme across the dashboard."
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
      </SectionCard>

      <SectionCard title="Notifications" icon={Bell}>
        <Toggle label="Hotel Registration Alerts"  desc="Get notified when a new hotel registers."       checked={true}  onChange={() => {}} />
        <Toggle label="Subscription Expiry Alerts" desc="Alert when subscriptions are about to expire."  checked={true}  onChange={() => {}} />
        <Toggle label="System Health Alerts"       desc="Receive platform health and uptime alerts."     checked={false} onChange={() => {}} />
      </SectionCard>

      <SectionCard title="Security" icon={Shield}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Session Timeout</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Auto-logout after inactivity.</div>
          </div>
          <select className="sa-input sa-select" style={{ width: 140, fontSize: 13 }} defaultValue="60">
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="480">8 hours</option>
          </select>
        </div>
      </SectionCard>

      <SectionCard title="Platform" icon={Globe}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Platform Name</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Displayed across the platform.</div>
          </div>
          <input className="sa-input" defaultValue="Explore Pakistan" style={{ width: 220, fontSize: 13 }} readOnly />
        </div>
      </SectionCard>
    </div>
  );
}
