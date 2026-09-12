import SearchBar from '../Common/SearchBar.jsx';
import FilterDropdown from '../Common/FilterDropdown.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export default function ManagerFilters({
  search = '',
  onSearchChange,
  status = '',
  onStatusChange,
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
      <div style={{ flex: '1 1 260px', minWidth: 200 }}>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search manager name, email, or hotel..."
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
    </div>
  );
}
