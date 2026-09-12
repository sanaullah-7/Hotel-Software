import SearchBar from '../Common/SearchBar.jsx';
import FilterDropdown from '../Common/FilterDropdown.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'EXPIRED', label: 'Expired' },
];

const PLAN_OPTIONS = [
  { value: '', label: 'All Plans' },
  { value: 'plan_basic', label: 'Basic Starter' },
  { value: 'plan_pro', label: 'Business Pro' },
  { value: 'plan_enterprise', label: 'Enterprise Elite' },
];

export default function SubscriptionFilters({
  search = '',
  onSearchChange,
  status = '',
  onStatusChange,
  plan = '',
  onPlanChange,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
      }}
    >
      <div style={{ flex: '1 1 240px', minWidth: 200 }}>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search by hotel name..."
        />
      </div>

      <div style={{ minWidth: 160 }}>
        <FilterDropdown
          value={status}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          placeholder="Status"
        />
      </div>

      <div style={{ minWidth: 170 }}>
        <FilterDropdown
          value={plan}
          onChange={onPlanChange}
          options={PLAN_OPTIONS}
          placeholder="Plan Tier"
        />
      </div>
    </div>
  );
}
