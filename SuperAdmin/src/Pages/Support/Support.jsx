import PageHeader from '../../Components/Common/pageHeader.jsx';
import { MessageSquare, Mail, Phone } from 'lucide-react';

export default function Support() {
  return (
    <div className="animate-fadein" style={{ maxWidth: 680 }}>
      <PageHeader title="Support Center" subtitle="Get help with the Super Admin dashboard." />
      <div className="sa-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
          <MessageSquare size={22} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Contact Support</h3>
        </div>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Subject</label>
            <input className="sa-input" placeholder="Describe the issue briefly…" type="text" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Message</label>
            <textarea className="sa-input sa-textarea" rows={5} placeholder="Describe the issue in detail…" />
          </div>
          <div>
            <button className="btn btn-primary" type="submit">Send Message</button>
          </div>
        </form>
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Email</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>support@explorepakistan.com</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Phone size={16} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Phone</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>+92-21-111-000-000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
