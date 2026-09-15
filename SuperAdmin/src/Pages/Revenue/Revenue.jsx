import PageHeader from '../../Components/Common/pageHeader.jsx';
import RevenueChart from '../../Components/Dashboard/RevenueChart.jsx';
import { useState, useEffect } from 'react';
import { AnalyticsService } from '../../Services/RevenueService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { DollarSign, TrendingUp, CreditCard, Wallet } from 'lucide-react';

const STAT = ({ icon: Icon, color, label, value }) => (
  <div className="sa-stat-card">
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
    <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{label}</div>
  </div>
);

export default function Revenue() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AnalyticsService.getRevenueData().then(setData).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  return (
    <div className="animate-fadein">
      <PageHeader title="Revenue" subtitle="Platform financial overview and subscription revenue." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        <STAT icon={DollarSign}  color="#10b981" label="Monthly Revenue"  value={formatCurrency(485000)} />
        <STAT icon={TrendingUp}  color="#6366f1" label="Revenue Growth"   value="+12.4%" />
        <STAT icon={CreditCard}  color="#f59e0b" label="Subscription Revenue" value={formatCurrency(320000)} />
        <STAT icon={Wallet}      color="#8b5cf6" label="One-Time Revenue"  value={formatCurrency(165000)} />
      </div>
      <div className="sa-card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Revenue Trends</h3>
        {loading ? <div className="skeleton" style={{ height: 220, borderRadius: 8 }} /> : <RevenueChart data={data} />}
      </div>
    </div>
  );
}
