import SearchBar from '../Common/SearchBar.jsx';
import FilterDropdown from '../Common/FilterDropdown.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
];

const PERIOD_OPTIONS = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

export default function RevenueFilters({
  search = '',
  onSearchChange,
  status = '',
  onStatusChange,
  period = '30d',
  onPeriodChange,
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
          placeholder="Search by hotel or transaction ID..."
        />
      </div>

      <div style={{ minWidth: 150 }}>
        <FilterDropdown
          value={status}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          placeholder="Status"
        />
      </div>

      <div style={{ minWidth: 160 }}>
        <FilterDropdown
          value={period}
          onChange={onPeriodChange}
          options={PERIOD_OPTIONS}
          placeholder="Timeframe"
        />
      </div>
    </div>
  );
}
