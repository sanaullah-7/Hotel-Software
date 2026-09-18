import { useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Debounced search bar.
 * @param {{ value: string, onChange: (v:string)=>void, placeholder?: string, debounce?: number }} props
 */
export default function SearchBar({ value, onChange, placeholder = 'Search…', debounce = 350 }) {
  const timerRef = useRef(null);

  const handleChange = useCallback((e) => {
    const v = e.target.value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), debounce);
  }, [onChange, debounce]);

  const handleClear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange('');
  }, [onChange]);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search size={15} style={{ position: 'absolute', left: 10, color: 'var(--color-text-muted)', pointerEvents: 'none', flexShrink: 0 }} />
      <input
        type="search"
        className="sa-input"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ paddingLeft: 34, paddingRight: value ? 34 : 10, minWidth: 220 }}
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          style={{ position: 'absolute', right: 8, color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
