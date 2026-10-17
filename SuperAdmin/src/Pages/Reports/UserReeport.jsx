import PageHeader from '../../Components/Common/pageHeader.jsx';
import UserGrowthChart from '../../Components/Dashboard/UserGrowthChart.jsx';
import ReportButton from '../../Components/Reports/ReportButton.jsx';
import { useReports } from '../../Hooks/useReports.js';
import LoadingState from '../../Components/Common/LaodingState.jsx';
import { Users, UserCheck, ShieldCheck } from 'lucide-react';

export default function UserReport() {
  const { userReport, loading } = useReports();

  if (loading) return <LoadingState message="Compiling staff & user reports..." />;

  const demographicsData = [
    { category: 'Hotel Managers', count: userReport?.activeManagers || 0 },
    { category: 'Front Desk Receptionists', count: userReport?.activeReceptionists || 0 },
    { category: 'Platform Administrators', count: userReport?.superAdmins || 0 },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Staff & User Demographics"
        subtitle="Growth velocity of managers, receptionists, and active accounts on the platform"
        action={
          <ReportButton
            data={demographicsData}
            filename={`user_demographics_${new Date().toISOString().split('T')[0]}.csv`}
            label="Export Staff CSV"
          />
        }
      />

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
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Users
            </div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{userReport?.totalUsers || 0}</div>
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
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Managers
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>
              {userReport?.activeManagers || 0}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(6,182,212,0.1)',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Front Desk
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#06b6d4' }}>
              {userReport?.activeReceptionists || 0}
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
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Rate
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>
              {userReport?.activeRate || '100%'}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>
          Monthly User Growth Velocity
        </h3>
        <UserGrowthChart data={userReport?.monthlyGrowth || []} />
      </div>
    </div>
  );
}
