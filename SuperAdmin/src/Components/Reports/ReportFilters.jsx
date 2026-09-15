import FilterDropdown from '../Common/FilterDropdown.jsx';

const RANGE_OPTIONS = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last 1 Year' },
];

const CITY_OPTIONS = [
  { value: '', label: 'All Cities' },
  { value: 'Lahore', label: 'Lahore' },
  { value: 'Islamabad', label: 'Islamabad' },
  { value: 'Karachi', label: 'Karachi' },
  { value: 'Multan', label: 'Multan' },
  { value: 'Peshawar', label: 'Peshawar' },
];

export default function ReportFilters({
  range = '30d',
  onRangeChange,
  city = '',
  onCityChange,
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 160 }}>
        <FilterDropdown
          value={range}
          onChange={onRangeChange}
          options={RANGE_OPTIONS}
          placeholder="Time Range"
        />
      </div>

      <div style={{ minWidth: 150 }}>
        <FilterDropdown
          value={city}
          onChange={onCityChange}
          options={CITY_OPTIONS}
          placeholder="Location"
        />
      </div>
    </div>
  );
}
