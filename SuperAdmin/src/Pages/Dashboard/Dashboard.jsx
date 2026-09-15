import { useState, useEffect } from 'react';
import { Hotel, CheckSquare, Users, CreditCard, DollarSign, TrendingUp, AlertTriangle, UserCheck, Search } from 'lucide-react';
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

  // Filters for Hotels table
  const [searchQuery,   setSearchQuery]   = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');
  const [hotelStats,    setHotelStats]    = useState(null);

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
      HotelService.getHotels({ page: 1, limit: 10 }),
      HotelService.getStats()
    ]).then(([s, rv, sd, ra, rr, hotelsRes, hStats]) => {
      if (cancelled) return;
      setStats(s);
      setRevenueData(rv);
      setSubData(sd);
      setRecentActs(ra);
      setRecentRegs(rr);
      setHotelsData(hotelsRes?.data || []);
      setHotelStats(hStats);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Handle dynamic filtering for the table
  useEffect(() => {
    // Skip initial render since the first useEffect handles it
    if (loading) return;
    
    let cancelled = false;
    const fetchFiltered = async () => {
      try {
        const res = await HotelService.getHotels({ page: 1, limit: 10, search: searchQuery, status: filterStatus });
        if (!cancelled) setHotelsData(res.data || []);
      } catch (err) {}
    };

    const timer = setTimeout(fetchFiltered, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, filterStatus, loading]);

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
    <div className="animate-fadein" style={{ marginTop: '-8px',}}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0,1fr))', gap: 7, marginBottom: 16 }}>
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
        <div className="sa-card" style={{ padding: '5px 5px 5px 5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '12px 15px 0', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>All Hotels</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>Recent registrations and status</p>
            </div>
            
            {/* Right Side: Filters + Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              
              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[
                  { label: 'All', value: '', count: hotelStats?.total || 0, color: 'var(--color-primary)' },
                  { label: 'Active', value: 'ACTIVE', count: hotelStats?.active || 0, color: 'var(--color-success)' },
                  { label: 'Pending', value: 'PENDING', count: hotelStats?.pending || 0, color: 'var(--color-warning)' },
                  { label: 'Suspended', value: 'SUSPENDED', count: hotelStats?.suspended || 0, color: 'var(--color-error)' },
                  { label: 'Rejected', value: 'REJECTED', count: hotelStats?.rejected || 0, color: 'var(--color-text-muted)' }
                ].map(st => {
                  const isActive = filterStatus === st.value;
                  return (
                    <button
                      key={st.label}
                      onClick={() => setFilterStatus(st.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 500,
                        border: `1px solid ${isActive ? st.color : 'var(--color-border)'}`,
                        backgroundColor: isActive ? `${st.color}15` : 'var(--color-surface)',
                        color: isActive ? st.color : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {st.label}
                      <span style={{ 
                        backgroundColor: isActive ? st.color : 'var(--color-surface-3)', 
                        color: isActive ? '#fff' : 'var(--color-text-primary)', 
                        padding: '2px 6px', 
                        borderRadius: 10, 
                        fontSize: 10,
                        fontWeight: 600
                      }}>{st.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search hotels..."
                  className="sa-input"
                  style={{ paddingLeft: 32, width: 200, height: 32, fontSize: 12 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <HotelTable data={hotelsData} loading={loading} onRefresh={() => {}} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
        <div className="sa-card">
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Registrations</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>Latest hotels joined the platform</p>
          </div>
          {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 4 }}>{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton" style={{height:44,borderRadius:8}}/>)}</div>
            : <div style={{ padding: '0 4px' }}><RecentRegistration data={recentRegs} /></div>}
        </div>
        <div className="sa-card" style={{ padding: 8, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 4, padding: '4px 4px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Subscriptions</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>Distribution by status</p>
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: 140, borderRadius: 8, margin: 4 }} />
          ) : (
            <>
              <div style={{ margin: '0 -8px' }}>
                <SubscriptionChart data={subData} />
              </div>
              {/* Detailed Breakdown to Fill Space */}
              <div style={{ padding: '16px 12px 8px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'flex-end' }}>
                {subData.map(item => {
                  const total = subData.reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }}></div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.value}</span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', width: 36, textAlign: 'right', fontWeight: 500 }}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>

        {/* Recent Activity */}
        <div className="sa-card" style={{ padding: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '4px 4px 12px' }}>Recent Activity</h3>
          {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton" style={{height:44,borderRadius:8}}/>)}</div>
            : <RecentActivities data={recentActs} />}
        </div>

        {/* Pending Actions */}
        <div className="sa-card" style={{ padding: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '4px 4px 12px' }}>Pending Actions</h3>
          <PendingActions pendingCount={stats?.pendingApprovals || 0} />
        </div>
      </div>
    </div>
  );
}
