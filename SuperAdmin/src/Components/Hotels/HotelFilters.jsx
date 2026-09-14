import SearchBar from '../Common/SearchBar.jsx';
import FilterDropdown from '../Common/FilterDropdown.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'APPROVED', label: 'Approved & Active' },
  { value: 'PENDING', label: 'Pending Verification' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'REJECTED', label: 'Rejected' },
];

const CITY_OPTIONS = [
  { value: '', label: 'All Cities' },
  { value: 'Lahore', label: 'Lahore' },
  { value: 'Islamabad', label: 'Islamabad' },
  { value: 'Karachi', label: 'Karachi' },
  { value: 'Multan', label: 'Multan' },
  { value: 'Faisalabad', label: 'Faisalabad' },
  { value: 'Rawalpindi', label: 'Rawalpindi' },
  { value: 'Peshawar', label: 'Peshawar' },
];

export default function HotelFilters({
  search = '',
  onSearchChange,
  status = '',
  onStatusChange,
  city = '',
  onCityChange,
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
          placeholder="Search by hotel name or registration NTN..."
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

      <div style={{ minWidth: 150 }}>
        <FilterDropdown
          value={city}
          onChange={onCityChange}
          options={CITY_OPTIONS}
          placeholder="City"
        />
      </div>
    </div>
  );
}
