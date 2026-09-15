/**
 * FilterDropdown — a labelled select filter.
 * @param {{ label: string, value: string, onChange: (v:string)=>void, options: {value:string, label:string}[] }} props
 */
export default function FilterDropdown({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {label && <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>}
      <select
        className="sa-input sa-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minWidth: 130, padding: '0.4rem 2rem 0.4rem 0.65rem', fontSize: 13 }}
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
