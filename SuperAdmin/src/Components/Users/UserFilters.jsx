import SearchBar from '../Common/SearchBar.jsx';
import FilterDropdown from '../Common/FilterDropdown.jsx';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'MANAGER', label: 'Hotel Manager' },
  { value: 'RECEPTIONIST', label: 'Receptionist' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export default function UserFilters({
  search = '',
  onSearchChange,
  role = '',
  onRoleChange,
  status = '',
  onStatusChange,
  hideRoleFilter = false,
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
          placeholder="Search by name, email, or hotel..."
        />
      </div>

      {!hideRoleFilter && (
        <div style={{ minWidth: 160 }}>
          <FilterDropdown
            value={role}
            onChange={onRoleChange}
            options={ROLE_OPTIONS}
            placeholder="Role"
          />
        </div>
      )}

      <div style={{ minWidth: 150 }}>
        <FilterDropdown
          value={status}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          placeholder="Status"
        />
      </div>
    </div>
  );
}
