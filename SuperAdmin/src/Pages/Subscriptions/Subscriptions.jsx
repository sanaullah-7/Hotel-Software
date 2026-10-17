import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import Modal from '../../Components/Common/Model.jsx';
import SubscriptionTable from '../../Components/Subscriptions/SubscriptionTable.jsx';
import SubscriptionFilters from '../../Components/Subscriptions/SubscriptionFilters.jsx';
import { useSubscription } from '../../Hooks/useSubscription.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  Layers,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export default function Subscriptions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [page, setPage] = useState(1);

  const {
    subscriptions,
    plans,
    stats,
    total,
    loading,
    error,
    setParams,
    updateSubscription,
  } = useSubscription({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    plan: '',
  });

  const [selectedSub, setSelectedSub] = useState(null);
  const [subFormData, setSubFormData] = useState({
    status: 'ACTIVE',
    planTier: 'PRO',
    amount: 12999,
    endDate: '',
    paymentMethod: 'Direct Bank Transfer',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Handle filter changes
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    setParams((prev) => ({ ...prev, search: val, page: 1 }));
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
    setParams((prev) => ({ ...prev, status: val, page: 1 }));
  };

  const handlePlanChange = (val) => {
    setPlan(val);
    setPage(1);
    setParams((prev) => ({ ...prev, plan: val, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  // Open Manage Modal
  const handleOpenManage = (sub) => {
    setSelectedSub(sub);
    setUpdateSuccess('');
    const rawDate = sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : '';
    setSubFormData({
      status: sub.status || 'ACTIVE',
      planTier: sub.planTier || 'PRO',
      amount: sub.amount || 12999,
      endDate: rawDate,
      paymentMethod: sub.paymentMethod || 'Direct Bank Transfer',
    });
  };

  // Quick Date Extension helpers
  const handleExtendDays = (days) => {
    const current = subFormData.endDate ? new Date(subFormData.endDate) : new Date();
    current.setDate(current.getDate() + days);
    setSubFormData((prev) => ({
      ...prev,
      endDate: current.toISOString().split('T')[0],
    }));
  };

  // Handle saving subscription changes
  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    try {
      setIsUpdating(true);
      await updateSubscription(selectedSub.id || selectedSub._id, subFormData);
      setUpdateSuccess('Subscription updated successfully!');
      setTimeout(() => {
        setSelectedSub(null);
        setUpdateSuccess('');
      }, 1000);
    } catch (err) {
      alert(err.message || 'Failed to update subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="animate-fadein">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <PageHeader
          title="Hotel Subscriptions & SaaS Billing"
          subtitle="Oversee commercial agreements, recurring SaaS rent, tier allotments, and payment renewals."
        />
        <button
          onClick={() => navigate('/subscriptions/plans')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}
        >
          <Layers size={16} />
          <span>Configure Pricing Plans</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* KPI Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="sa-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{stats?.active ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Active Subscriptions
            </div>
          </div>
        </div>

        <div className="sa-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{stats?.trial ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Free Trial Period
            </div>
          </div>
        </div>

        <div className="sa-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <XCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{stats?.expired ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Expired / Overdue
            </div>
          </div>
        </div>

        <div className="sa-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple, #6366f1)',
            }}
          >
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-purple, #6366f1)' }}>
              {formatCurrency(stats?.totalRevenueMonthly || 0)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Monthly Recurring (MRR)
            </div>
          </div>
        </div>
      </div>

      {/* Main Subscriptions Table */}
      <div className="card" style={{ padding: 20 }}>
        <SubscriptionFilters
          search={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
          plan={plan}
          onPlanChange={handlePlanChange}
        />

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <SubscriptionTable
          subscriptions={subscriptions}
          loading={loading}
          onViewDetails={handleOpenManage}
        />

        <div style={{ marginTop: 16 }}>
          <Pagination
            page={page}
            total={total}
            pageSize={10}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Manage / Renewal Subscription Modal */}
      {selectedSub && (
        <Modal
          isOpen={Boolean(selectedSub)}
          onClose={() => setSelectedSub(null)}
          title={`Manage Agreement: ${selectedSub.hotelName}`}
          maxWidth={540}
        >
          <form onSubmit={handleSaveSubscription} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
            {updateSuccess && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {updateSuccess}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                  Subscription Tier
                </label>
                <select
                  value={subFormData.planTier}
                  onChange={(e) => {
                    const tier = e.target.value;
                    const matchedPlan = plans.find((p) => p.tier === tier);
                    setSubFormData((prev) => ({
                      ...prev,
                      planTier: tier,
                      amount: matchedPlan ? matchedPlan.price : prev.amount,
                    }));
                  }}
                  className="search-input"
                  style={{ width: '100%', height: 40 }}
                >
                  <option value="BASIC">Basic Starter</option>
                  <option value="PRO">Business Pro</option>
                  <option value="PREMIUM">Premium Suite</option>
                  <option value="ENTERPRISE">Enterprise Elite</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                  Agreement Status
                </label>
                <select
                  value={subFormData.status}
                  onChange={(e) => setSubFormData({ ...subFormData, status: e.target.value })}
                  className="search-input"
                  style={{ width: '100%', height: 40 }}
                >
                  <option value="ACTIVE">ACTIVE (Paid & Authorized)</option>
                  <option value="TRIAL">TRIAL (Evaluation Period)</option>
                  <option value="EXPIRED">EXPIRED (Overdue Renewal)</option>
                  <option value="SUSPENDED">SUSPENDED (Locked Access)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                Monthly Fee (PKR)
              </label>
              <input
                type="number"
                min="0"
                value={subFormData.amount}
                onChange={(e) => setSubFormData({ ...subFormData, amount: e.target.value })}
                className="search-input"
                style={{ width: '100%', height: 40 }}
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, margin: 0 }}>
                  Renewal / Expiry Date
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleExtendDays(30)}
                    className="btn btn-ghost"
                    style={{ fontSize: 11, padding: '2px 8px', height: 'auto', border: '1px solid var(--border-color)' }}
                  >
                    +30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtendDays(365)}
                    className="btn btn-ghost"
                    style={{ fontSize: 11, padding: '2px 8px', height: 'auto', border: '1px solid var(--border-color)' }}
                  >
                    +1 Year
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={subFormData.endDate}
                onChange={(e) => setSubFormData({ ...subFormData, endDate: e.target.value })}
                className="search-input"
                style={{ width: '100%', height: 40 }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                Payment Method & Instrument
              </label>
              <input
                type="text"
                value={subFormData.paymentMethod}
                onChange={(e) => setSubFormData({ ...subFormData, paymentMethod: e.target.value })}
                placeholder="e.g. Meezan Bank Transfer, JazzCash, Visa"
                className="search-input"
                style={{ width: '100%', height: 40 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="btn btn-ghost"
                style={{ border: '1px solid var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save & Update Agreement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
