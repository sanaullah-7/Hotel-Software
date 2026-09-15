import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '../../utils/constants.js';

/**
 * Pagination controls.
 * @param {{ page: number, total: number, pageSize: number, onPageChange: (p:number)=>void, onPageSizeChange?: (s:number)=>void }} props
 */
export default function Pagination({ page, total, pageSize = DEFAULT_PAGE_SIZE, onPageChange, onPageSizeChange }) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const pages = buildPageArray(page, totalPages);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 12 }}>
      {/* Count info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
        </span>
        {onPageSizeChange && (
          <select
            className="sa-input sa-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Rows per page"
            style={{ width: 'auto', padding: '3px 28px 3px 8px', fontSize: 12 }}
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} / page</option>)}
          </select>
        )}
      </div>

      {/* Page buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <PageBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft size={15} />
        </PageBtn>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} style={{ color: 'var(--color-text-muted)', padding: '0 4px', fontSize: 13 }}>…</span>
          ) : (
            <PageBtn key={p} onClick={() => onPageChange(p)} active={p === page} aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined}>
              {p}
            </PageBtn>
          )
        )}

        <PageBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          <ChevronRight size={15} />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active, ...rest }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...rest}
      style={{
        minWidth: 32, height: 32, padding: '0 6px',
        borderRadius: 6, border: '1px solid',
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
        background: active ? 'var(--color-primary)' : 'transparent',
        color: active ? '#fff' : disabled ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13, fontWeight: active ? 600 : 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all var(--transition-fast)',
      }}
    >
      {children}
    </button>
  );
}

function buildPageArray(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', total);
  } else if (current >= total - 3) {
    pages.push(1, '…', total-4, total-3, total-2, total-1, total);
  } else {
    pages.push(1, '…', current-1, current, current+1, '…', total);
  }
  return pages;
}
