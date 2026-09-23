import React from 'react';

// Default universal fallback colors for common status strings across HMS
const DEFAULT_STATUS_STYLES = {
  // Positive / Active
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Checked In': 'bg-[#dcfce7] text-[#16a34a] border-emerald-200',
  CheckIn: 'bg-blue-100 text-blue-500',
  Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Booked: 'bg-green-100 text-green-600',
  Paid: 'bg-green-100 text-green-600',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // Warning / In-Progress / Pending
  Pending: 'bg-[#fee2e2] text-[#dc2626]',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Unpaid: 'bg-orange-100 text-orange-500',
  Reserved: 'bg-[#fef3c7] text-[#d97706]',
  Dirty: 'bg-amber-50 text-amber-700 border-amber-200',
  Cleaning: 'bg-blue-50 text-blue-700 border-blue-200',
  Maintenance: 'bg-purple-50 text-purple-700 border-purple-200',

  // Neutral / Info
  'Checked Out': 'bg-[#dbeafe] text-[#2563eb]',
  CheckOut: 'bg-purple-100 text-purple-500',
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',

  // Danger / Inactive / Cancelled
  Cancelled: 'bg-orange-100 text-orange-500',
  Canceled: 'bg-rose-50 text-rose-700 border-rose-200',
  Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  Blocked: 'bg-rose-50 text-rose-700 border-rose-200',
  Expired: 'bg-rose-50 text-rose-700 border-rose-200'
};

/**
 * Standard StatusBadge / Pill component across HMS tables, views, and cards.
 */
export default function StatusBadge({
  status = '',
  stylesMap,
  icon: IconComponent,
  size = 'sm', // 'xs' | 'sm' | 'md'
  className = '',
  children
}) {
  const displayContent = children || status;
  const resolvedStyle =
    (stylesMap && stylesMap[status]) ||
    DEFAULT_STATUS_STYLES[status] ||
    'bg-gray-100 text-gray-700';

  let sizeClasses = 'px-2.5 py-0.5 text-[11px]';
  if (size === 'xs') sizeClasses = 'px-1.5 py-0.2 text-[10px]';
  if (size === 'md') sizeClasses = 'px-3 py-1 text-[12px]';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-[4px] leading-tight ${sizeClasses} ${resolvedStyle} ${className}`}
    >
      {IconComponent && (
        <span className="shrink-0 flex items-center">
          {typeof IconComponent === 'function' ? (
            <IconComponent sx={{ fontSize: size === 'xs' ? 10 : 13 }} />
          ) : (
            IconComponent
          )}
        </span>
      )}
      <span>{displayContent}</span>
    </span>
  );
}
