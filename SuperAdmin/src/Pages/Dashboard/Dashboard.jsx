import { useState, useEffect } from 'react';
import { Hotel, CheckSquare, Users, CreditCard, DollarSign, TrendingUp, AlertTriangle, UserCheck } from 'lucide-react';
import { AnalyticsService } from '../../Services/RevenueService.js';
import { HotelService } from '../../Services/HotelService.js';
import StatCard from '../../Components/Dashboard/statCard.jsx';
import HotelTable from '../../Components/Hotels/HotelTable.jsx';
import RevenueChart from '../../Components/Dashboard/RevenueChart.jsx';
import SubscriptionChart from '../../Components/Dashboard/SubscriptionChart.jsx';
import RecentActivities from '../../Components/Dashboard/RecentActivities.jsx';
import RecentRegistration from '../../Components/Dashboard/RecentRegistration.jsx';
import PendingActions from '../../Components/Dashboard/pendingActions.jsx';
import { SkeletonCard } from '../../Components/Common/Skeleton.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

// =============================================================================
// Dashboard Page
// =============================================================================
export default function Dashboard() {
  const [stats,         setStats]         = useState(null);
  const [hotelsData,    setHotelsData]    = useState([]);
  const [revenueData,   setRevenueData]   = useState([]);
  const [subData,       setSubData]       = useState([]);
  const [recentActs,    setRecentActs]    = useState([]);
  const [recentRegs,    setRecentRegs]    = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      AnalyticsService.getDashboardStats(),
      AnalyticsService.getRevenueData(),
      AnalyticsService.getSubscriptionDistribution(),
      AnalyticsService.getRecentActivity(),
      AnalyticsService.getRecentRegistrations(),
      HotelService.getHotels({ page: 1, limit: 10 })
    ]).then(([s, rv, sd, ra, rr, hotelsRes]) => {
      if (cancelled) return;
      setStats(s);
      setRevenueData(rv);
      setSubData(sd);
      setRecentActs(ra);
      setRecentRegs(rr);
      setHotelsData(hotelsRes?.data || []);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const KPI_CARDS = stats ? [
    { title: 'Total Hotels',      value: stats.totalHotels,       trend: stats.hotelGrowth,        icon: Hotel,      color: '#6366f1', to: '/hotels' },
    { title: 'Pending Approvals', value: stats.pendingApprovals,  trend: null,                     icon: CheckSquare,color: '#f59e0b', to: '/approvals/pending' },
    { title: 'Active Hotels',     value: stats.activeHotels,      trend: stats.hotelGrowth,        icon: TrendingUp, color: '#10b981', to: '/hotels' },
    { title: 'Suspended Hotels',  value: stats.suspendedHotels,   trend: null,                     icon: AlertTriangle,color:'#ef4444',to: '/hotels' },
    { title: 'Total Managers',    value: stats.totalManagers,     trend: stats.userGrowth,         icon: Users,      color: '#3b82f6', to: '/users/managers' },
    { title: 'Receptionists',     value: stats.totalReceptionists,trend: stats.userGrowth,         icon: UserCheck,  color: '#8b5cf6', to: '/users/receptionists' },
    { title: 'Active Subscriptions',value:stats.activeSubscriptions,trend:stats.subscriptionGrowth,icon: CreditCard, color: '#06b6d4', to: '/subscriptions' },
    { title: 'Monthly Revenue',   value: formatCurrency(stats.monthlyRevenue), trend: stats.revenueGrowth, icon: DollarSign, color: '#10b981', to: '/revenue' },
  ] : [];

  return (
    <div className="animate-fadein" style={{ marginTop: '-8px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0,1fr))', gap: 8, marginBottom: 16 }}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : KPI_CARDS.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
      </div>

      {/* Hotels Table */}
      <div style={{ marginBottom: 16 }}>
        <div className="sa-card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>All Hotels</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>Recent hotel registrations and status</p>
          </div>
          <HotelTable data={hotelsData} loading={loading} onRefresh={() => {}} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="sa-card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Revenue Trends</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>Total revenue & subscription revenue monthly</p>
          </div>
          {loading ? <div className="skeleton" style={{ height: 220, borderRadius: 8 }} /> : <RevenueChart data={revenueData} />}
        </div>
        <div className="sa-card">
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Subscriptions</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>Distribution by status</p>
          </div>
          {loading ? <div className="skeleton" style={{ height: 220, borderRadius: 8 }} /> : <SubscriptionChart data={subData} />}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
        {/* Recent Registrations */}
        <div className="sa-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Recent Registrations</h3>
          {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton" style={{height:44,borderRadius:8}}/>)}</div>
            : <RecentRegistration data={recentRegs} />}
        </div>

        {/* Recent Activity */}
        <div className="sa-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Recent Activity</h3>
          {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton" style={{height:44,borderRadius:8}}/>)}</div>
            : <RecentActivities data={recentActs} />}
        </div>

        {/* Pending Actions */}
        <div className="sa-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Pending Actions</h3>
          <PendingActions pendingCount={stats?.pendingApprovals || 0} />
        </div>
      </div>
    </div>
  );
}
