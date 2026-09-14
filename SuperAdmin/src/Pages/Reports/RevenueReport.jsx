import PageHeader from '../../Components/Common/pageHeader.jsx';
import RevenueChart from '../../Components/Dashboard/RevenueChart.jsx';
import ReportButton from '../../Components/Reports/ReportButton.jsx';
import { useReports } from '../../Hooks/useReports.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import LoadingState from '../../Components/Common/LaodingState.jsx';

export default function RevenueReport() {
  const { revenueReport, loading } = useReports();

  if (loading) return <LoadingState message="Compiling revenue report..." />;

  const topCities = revenueReport?.topEarningCities || [];

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Revenue & MRR Financial Report"
        subtitle="SaaS subscription cash flow, average revenue per hotel, and regional earnings"
        action={<ReportButton data={topCities} filename="revenue_by_city.csv" />}
      />

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monthly Recurring (MRR)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-purple)', marginTop: 4 }}>
            {formatCurrency(revenueReport?.mrr || 245000)}
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annual Run Rate (ARR)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
            {formatCurrency(revenueReport?.arr || 2940000)}
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Revenue / Hotel</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {formatCurrency(revenueReport?.avgRevenuePerHotel || 5975)}
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Churn Rate</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
            {revenueReport?.churnRate || '1.2%'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <RevenueChart />
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Top Earning Cities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topCities.map((item) => (
              <div key={item.city} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-card-hover)' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{item.city}</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
