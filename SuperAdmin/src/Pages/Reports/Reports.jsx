import PageHeader from '../../Components/Common/pageHeader.jsx';
import HotelGrowthChart from '../../Components/Dashboard/HotelGrowthChart.jsx';
import UserGrowthChart from '../../Components/Dashboard/UserGrowthChart.jsx';
import RevenueChart from '../../Components/Dashboard/RevenueChart.jsx';
import SubscriptionChart from '../../Components/Dashboard/SubscriptionChart.jsx';
import { useState, useEffect } from 'react';
import { AnalyticsService } from '../../Services/RevenueService.js';


const Chart = ({ title, subtitle, children, loading }) => (
  <div className="sa-card">
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>{subtitle}</p>}
    </div>
    {loading ? <div className="skeleton" style={{ height: 220, borderRadius: 8 }} /> : children}
  </div>
);

export default function Reports() {
  const [hotelGrowth, setHotelGrowth] = useState([]);
  const [userGrowth,  setUserGrowth]  = useState([]);
  const [revenue,     setRevenue]     = useState([]);
  const [subs,        setSubs]        = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      AnalyticsService.getHotelGrowth(),
      AnalyticsService.getUserGrowth(),
      AnalyticsService.getRevenueData(),
      AnalyticsService.getSubscriptionDistribution(),
    ]).then(([hg, ug, rv, sd]) => {
      setHotelGrowth(hg); setUserGrowth(ug); setRevenue(rv); setSubs(sd);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);


  return (
    <div className="animate-fadein">
      <PageHeader title="Reports & Analytics" subtitle="Platform performance metrics and trend analysis." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))', gap: 16 }}>
        <Chart title="Hotel Growth"         subtitle="Monthly registrations vs active hotels" loading={loading}><HotelGrowthChart data={hotelGrowth} /></Chart>
        <Chart title="User Growth"          subtitle="Manager and receptionist growth" loading={loading}><UserGrowthChart data={userGrowth} /></Chart>
        <Chart title="Revenue Trends"       subtitle="Revenue and subscription trends" loading={loading}><RevenueChart data={revenue} /></Chart>
        <Chart title="Subscription Status"  subtitle="Distribution by subscription status" loading={loading}><SubscriptionChart data={subs} /></Chart>
      </div>
    </div>
  );
}
