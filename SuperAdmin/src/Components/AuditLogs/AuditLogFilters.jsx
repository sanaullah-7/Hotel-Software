import SearchBar from '../Common/SearchBar.jsx';
import FilterDropdown from '../Common/FilterDropdown.jsx';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'HOTEL_APPROVED', label: 'Hotel Approved' },
  { value: 'HOTEL_REJECTED', label: 'Hotel Rejected' },
  { value: 'HOTEL_SUSPENDED', label: 'Hotel Suspended' },
  { value: 'HOTEL_ACTIVATED', label: 'Hotel Activated' },
  { value: 'USER_SUSPENDED', label: 'User Suspended' },
  { value: 'USER_ACTIVATED', label: 'User Activated' },
  { value: 'SETTINGS_CHANGED', label: 'Settings Changed' },
  { value: 'LOGIN', label: 'Login' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'Hotel', label: 'Hotels' },
  { value: 'User', label: 'Users & Staff' },
  { value: 'Subscription', label: 'Subscriptions' },
  { value: 'System', label: 'System Settings' },
];

export default function AuditLogFilters({
  search = '',
  onSearchChange,
  action = '',
  onActionChange,
  entity = '',
  onEntityChange,
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
          placeholder="Search by admin name or target entity..."
        />
      </div>

      <div style={{ minWidth: 170 }}>
        <FilterDropdown
          value={action}
          onChange={onActionChange}
          options={ACTION_OPTIONS}
          placeholder="Action Type"
        />
      </div>

      <div style={{ minWidth: 150 }}>
        <FilterDropdown
          value={entity}
          onChange={onEntityChange}
          options={ENTITY_OPTIONS}
          placeholder="Entity"
        />
      </div>
    </div>
  );
}
