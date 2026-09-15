import { useState } from 'react';
import {  RefreshCw, Server } from 'lucide-react';

export default function SystemSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Server size={18} color="var(--accent-purple)" />
        System Health & Server Controls
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>System Status</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>Operational (99.98%)</div>
        </div>

        <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>API Version</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>v2.4.0-prod</div>
        </div>

        <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Database Engine</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>MongoDB Cluster</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: maintenanceMode ? '#ef4444' : 'inherit' }}>
              Maintenance Mode
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Temporarily show a maintenance landing page to all clients
            </div>
          </div>
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#ef4444' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Flush Server Redis Cache</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Invalidates all cached analytics, query results, and hotel previews
            </div>
          </div>
          <button
            onClick={handleClearCache}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 6,
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <RefreshCw size={13} />
            {cacheCleared ? 'Cleared!' : 'Flush Cache'}
          </button>
        </div>
      </div>
    </div>
  );
}
