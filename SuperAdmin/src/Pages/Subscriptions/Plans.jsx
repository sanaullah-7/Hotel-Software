import { useState } from 'react';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import PlanCard from '../../Components/Subscriptions/PlanCard.jsx';
import Model from '../../Components/Common/Model.jsx';
import { useSubscription } from '../../Hooks/useSubscription.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function Plans() {
  const { plans, loading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Subscription Plans"
        subtitle="Manage commercial SaaS subscription pricing tiers, feature allotments, and limits for Explore Pakistan"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          alignItems: 'stretch',
        }}
      >
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelectPlan={(p) => setSelectedPlan(p)}
          />
        ))}
      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <Model
          isOpen={Boolean(selectedPlan)}
          onClose={() => setSelectedPlan(null)}
          title={`Edit ${selectedPlan.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Plan Name
              </label>
              <input
                type="text"
                defaultValue={selectedPlan.name}
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Monthly Price (PKR)
              </label>
              <input
                type="number"
                defaultValue={selectedPlan.price}
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Maximum Allowed Rooms
              </label>
              <input
                type="number"
                defaultValue={selectedPlan.maxRooms}
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="btn"
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Model>
      )}
    </div>
  );
}
