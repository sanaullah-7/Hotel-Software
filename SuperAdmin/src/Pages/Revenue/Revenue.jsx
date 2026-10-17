import { useNavigate } from 'react-router-dom';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import RevenueChart from '../../Components/Dashboard/RevenueChart.jsx';
import TransactionTable from '../../Components/Revenue/TransactionTable.jsx';
import { useRevenue } from '../../Hooks/useRevenue.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { DollarSign, TrendingUp, CreditCard, Wallet, ArrowRight, Layers } from 'lucide-react';

const STAT = ({ icon: Icon, color, label, value, subtext }) => (
  <div className="sa-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${color}1a`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
      {subtext && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{subtext}</div>}
    </div>
  </div>
);

export default function Revenue() {
  const navigate = useNavigate();
  const { overview, revenueHistory, transactions, loading, error } = useRevenue({ limit: 5 });

  const isPositiveGrowth = (overview?.revenueGrowth || 0) >= 0;

  return (
    <div className="animate-fadein">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <PageHeader
          title="Revenue & Platform Financial Telemetry"
          subtitle="Real-time aggregation of recurring subscription revenue, tenant onboarding fees, and cash flow."
        />
        <button
          onClick={() => navigate('/revenue/transactions')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}
        >
          <span>View Ledger Transactions</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <STAT
          icon={DollarSign}
          color="#10b981"
          label="Current Month Revenue"
          value={formatCurrency(overview?.monthlyRevenue || 0)}
          subtext="Total collected this month"
        />
        <STAT
          icon={TrendingUp}
          color={isPositiveGrowth ? '#6366f1' : '#ef4444'}
          label="Revenue Growth (MoM)"
          value={`${isPositiveGrowth ? '+' : ''}${overview?.revenueGrowth ?? 0}%`}
          subtext={`vs last month (${formatCurrency(overview?.prevMonthRevenue || 0)})`}
        />
        <STAT
          icon={CreditCard}
          color="#f59e0b"
          label="Subscription Recurring"
          value={formatCurrency(overview?.subscriptionRevenue || 0)}
          subtext="Monthly SaaS recurring revenue"
        />
        <STAT
          icon={Wallet}
          color="#8b5cf6"
          label="One-Time Setup & Audits"
          value={formatCurrency(overview?.oneTimeRevenue || 0)}
          subtext="Tenant provisioning & setup"
        />
      </div>

      {/* Charts */}
      <div className="sa-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Revenue Progression (Current Year)</h3>
            <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
              Monthly comparison between SaaS recurring licenses and setup fees
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
            All-Time Total: {formatCurrency(overview?.totalRevenue || 0)}
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 240, borderRadius: 8 }} />
        ) : (
          <RevenueChart data={revenueHistory} />
        )}
      </div>

      {/* Recent Transactions Preview */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Ledger Transactions</h3>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Latest processed payments and subscription renewals
            </span>
          </div>
          <button
            onClick={() => navigate('/revenue/transactions')}
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: '4px 10px', border: '1px solid var(--border-color)' }}
          >
            See All Transactions ({overview ? 'Live' : '...'})
          </button>
        </div>

        <TransactionTable transactions={transactions.slice(0, 5)} loading={loading} />
      </div>
    </div>
  );
}
