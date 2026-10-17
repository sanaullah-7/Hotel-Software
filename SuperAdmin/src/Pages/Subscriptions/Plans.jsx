import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import PlanCard from '../../Components/Subscriptions/PlanCard.jsx';
import Model from '../../Components/Common/Model.jsx';
import { useSubscription } from '../../Hooks/useSubscription.js';
import { SubscriptionService } from '../../Services/SubscriptionService.js';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function Plans() {
  const navigate = useNavigate();
  const { plans, loading, error, refetch } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    maxRooms: 50,
    maxStaff: 10,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setSaveSuccess(false);
    setSaveError(null);
    setFormData({
      name: plan.name || '',
      price: plan.price || 0,
      maxRooms: plan.maxRooms || 50,
      maxStaff: plan.maxStaff || 10,
    });
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      await SubscriptionService.updatePlan(selectedPlan.id || selectedPlan._id, {
        name: formData.name,
        price: Number(formData.price),
        maxRooms: Number(formData.maxRooms),
        maxStaff: Number(formData.maxStaff),
      });
      setSaveSuccess(true);
      await refetch();
      setTimeout(() => {
        setSelectedPlan(null);
        setSaveSuccess(false);
      }, 1200);
    } catch (err) {
      setSaveError(err.message || 'Failed to update plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fadein">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <PageHeader
          title="Subscription Pricing Tiers"
          subtitle="Configure commercial SaaS pricing tiers, room capacity allotments, and staff quotas for hotel partners."
        />
        <button
          onClick={() => navigate('/subscriptions')}
          className="btn btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, border: '1px solid var(--border-color)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Subscriptions</span>
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

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading subscription tiers...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id || plan._id}
              plan={plan}
              onSelectPlan={() => handleOpenEdit(plan)}
            />
          ))}
        </div>
      )}

      {/* Plan Details Modal */}
      {selectedPlan && (
        <Model
          isOpen={Boolean(selectedPlan)}
          onClose={() => setSelectedPlan(null)}
          title={`Edit ${selectedPlan.name} (${selectedPlan.tier})`}
          maxWidth={480}
        >
          <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
            {saveSuccess && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Check size={16} /> Plan updated successfully!
              </div>
            )}

            {saveError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={16} /> {saveError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Plan Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="search-input"
                style={{ width: '100%', height: 40 }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Monthly Price (PKR)
              </label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="search-input"
                style={{ width: '100%', height: 40 }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Max Allowed Rooms
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxRooms}
                  onChange={(e) => setFormData({ ...formData, maxRooms: e.target.value })}
                  className="search-input"
                  style={{ width: '100%', height: 40 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  Max Staff Logins
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxStaff}
                  onChange={(e) => setFormData({ ...formData, maxStaff: e.target.value })}
                  className="search-input"
                  style={{ width: '100%', height: 40 }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="btn btn-ghost"
                style={{ border: '1px solid var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Model>
      )}
    </div>
  );
}
