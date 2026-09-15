import { ChevronUp, ChevronDown } from 'lucide-react';
import LoadingSkeleton from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';
import ErrorState from './ErrorState.jsx';
import { Database } from 'lucide-react';

/**
 * Generic data table.
 * @param {{
 *   columns: { key: string, label: string, sortable?: boolean, render?: (row)=>ReactNode, width?: string|number }[],
 *   data: object[],
 *   loading?: boolean,
 *   error?: string,
 *   onRetry?: ()=>void,
 *   sortKey?: string,
 *   sortDir?: 'asc'|'desc',
 *   onSort?: (key:string)=>void,
 *   emptyTitle?: string,
 *   emptyDesc?: string,
 * }} props
 */
export default function DataTable({ columns, data, loading, error, onRetry, sortKey, sortDir, onSort, emptyTitle = 'No records found', emptyDesc = 'There is nothing to display here yet.' }) {
  return (
    <div className="sa-table-wrap">
      <table className="sa-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                style={col.width ? { width: col.width } : undefined}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {col.label}
                  {col.sortable && (
                    <span style={{ display: 'flex', flexDirection: 'column', opacity: sortKey === col.key ? 1 : 0.35 }}>
                      <ChevronUp size={10} style={{ marginBottom: -2, color: sortKey === col.key && sortDir === 'asc' ? 'var(--color-primary)' : 'inherit' }} />
                      <ChevronDown size={10} style={{ color: sortKey === col.key && sortDir === 'desc' ? 'var(--color-primary)' : 'inherit' }} />
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {loading ? (
          <LoadingSkeleton rows={5} cols={columns.length} />
        ) : error ? (
          <tbody>
            <tr>
              <td colSpan={columns.length} style={{ padding: 0 }}>
                <ErrorState message={error} onRetry={onRetry} />
              </td>
            </tr>
          </tbody>
        ) : data.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={columns.length} style={{ padding: 0 }}>
                <EmptyState icon={Database} title={emptyTitle} description={emptyDesc} />
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
