import SearchBar from '../Common/SearchBar.jsx';
import FilterDropdown from '../Common/FilterDropdown.jsx';

const DEFAULT_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

const DEFAULT_PLAN_OPTIONS = [
  { value: '', label: 'All Plans' },
  { value: 'BASIC', label: 'Basic Starter' },
  { value: 'PRO', label: 'Business Pro' },
  { value: 'PREMIUM', label: 'Premium Suite' },
  { value: 'ENTERPRISE', label: 'Enterprise Elite' },
];

export default function SubscriptionFilters({
  search = '',
  onSearchChange,
  status = '',
  onStatusChange,
  plan = '',
  onPlanChange,
  planOptions = null,
}) {
  const options = planOptions && planOptions.length > 0 ? planOptions : DEFAULT_PLAN_OPTIONS;

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
          options={DEFAULT_STATUS_OPTIONS}
          placeholder="Status"
        />
      </div>

      <div style={{ minWidth: 170 }}>
        <FilterDropdown
          value={plan}
          onChange={onPlanChange}
          options={options}
          placeholder="Plan Tier"
        />
      </div>
    </div>
  );
}
