import { useState } from 'react';

export default function NotifictionSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [hotelRegistrations, setHotelRegistrations] = useState(true);
  const [approvalRequests, setApprovalRequests] = useState(true);
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Notification & Alert Preferences</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Email Notifications</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Send urgent security alerts to admin email</div>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-purple)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>New Hotel Submissions</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Instant alert when a hotel registers for verification</div>
          </div>
          <input
            type="checkbox"
            checked={hotelRegistrations}
            onChange={(e) => setHotelRegistrations(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-purple)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Pending Approval Reminders</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Daily summary of unreviewed hotel applications</div>
          </div>
          <input
            type="checkbox"
            checked={approvalRequests}
            onChange={(e) => setApprovalRequests(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-purple)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Subscription Expirations</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Notify 7 days prior to hotel subscription expiry</div>
          </div>
          <input
            type="checkbox"
            checked={subscriptionAlerts}
            onChange={(e) => setSubscriptionAlerts(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-purple)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
        <button onClick={handleSave} className="btn btn-primary">
          Save Preferences
        </button>
        {saved && <span style={{ color: '#10b981', fontSize: 13, fontWeight: 500 }}>Preferences saved!</span>}
      </div>
    </div>
  );
}
