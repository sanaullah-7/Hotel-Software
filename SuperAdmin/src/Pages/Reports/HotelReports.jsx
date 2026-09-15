import PageHeader from '../../Components/Common/pageHeader.jsx';
import HotelGrowthChart from '../../Components/Dashboard/HotelGrowthChart.jsx';
import ReportButton from '../../Components/Reports/ReportButton.jsx';
import { useReports } from '../../Hooks/useReports.js';
import LoadingState from '../../Components/Common/LaodingState.jsx';

export default function HotelReports() {
  const { hotelReport, loading } = useReports();

  if (loading) return <LoadingState message="Compiling hotel reports..." />;

  const byCityData = hotelReport?.byCity || [];

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Hotel Analytics & Distribution"
        subtitle="Regional performance, property verification trends, and geographic metrics across Pakistan"
        action={<ReportButton data={byCityData} filename="hotel_regional_report.csv" />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Hotel Geographic Density</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byCityData.map((item) => (
              <div key={item.city}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{item.city}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.count} hotels ({item.percentage}%)</span>
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
          <HotelGrowthChart />
        </div>
      </div>
    </div>
  );
}
