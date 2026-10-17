import PageHeader from '../../Components/Common/pageHeader.jsx';
import HotelGrowthChart from '../../Components/Dashboard/HotelGrowthChart.jsx';
import ReportButton from '../../Components/Reports/ReportButton.jsx';
import { useReports } from '../../Hooks/useReports.js';
import LoadingState from '../../Components/Common/LaodingState.jsx';
import { Building2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function HotelReports() {
  const { hotelReport, loading } = useReports();

  if (loading) return <LoadingState message="Compiling hotel reports..." />;

  const byCityData = hotelReport?.byCity || [];

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Hotel Analytics & Distribution"
        subtitle="Regional performance, property verification trends, and geographic metrics across Pakistan"
        action={
          <ReportButton
            data={byCityData}
            filename={`hotel_regional_report_${new Date().toISOString().split('T')[0]}.csv`}
            label="Export Regional CSV"
          />
        }
      />

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(99,102,241,0.1)',
              color: 'var(--accent-purple, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Properties
            </div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{hotelReport?.totalHotels ?? '—'}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(16,185,129,0.1)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Operational
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>
              {hotelReport?.activeHotels ?? '—'}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(59,130,246,0.1)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pending Review
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6' }}>
              {hotelReport?.pendingApproval ?? '—'}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(245,158,11,0.1)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Suspended Access
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>
              {hotelReport?.suspendedHotels ?? '—'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Hotel Geographic Density</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byCityData.map((item) => (
              <div key={item.city}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{item.city}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {item.count} hotels ({item.percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--bg-card-hover)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>
            Monthly Registration & Active Trend
          </h3>
          <HotelGrowthChart data={hotelReport?.monthlyGrowth || []} />
        </div>
      </div>
    </div>
  );
}
