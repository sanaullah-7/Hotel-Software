import React from 'react';

/**
 * Reusable KPI / Metric card for dashboards and module summary banners.
 *
 * Variants:
 * - 'compact' (default for dashboard top stats): Title + icon on top row, big value below
 * - 'badge' (used in event/staff summary cards): Icon badge + title, value + subtext
 * - 'horizontal' (used in front-office summary): Title + value on left, icon badge on right
 */
export default function KPICard({
  title,
  value,
  subtext,
  icon: IconComponent,
  iconColor = 'text-[var(--primary-main)]',
  iconBg = 'bg-[var(--primary-main)]/10',
  variant = 'compact',
  className = '',
  onClick,
  cardKey
}) {
  const isClickable = Boolean(onClick);

  if (variant === 'badge') {
    return (
      <div
        key={cardKey}
        onClick={onClick}
        className={`bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-3 py-2 flex flex-col justify-between transition-colors ${
          isClickable ? 'cursor-pointer hover:border-[var(--primary-main)]/30' : ''
        } ${className}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {IconComponent && (
            <div className={`p-1 rounded-md ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
              {typeof IconComponent === 'function' ? (
                <IconComponent sx={{ fontSize: 15 }} />
              ) : (
                IconComponent
              )}
            </div>
          )}
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider truncate">
            {title}
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-xl font-bold text-[var(--text-primary)] leading-none">
            {value}
          </span>
          {subtext && (
            <span className="text-[10px] text-[var(--text-secondary)] font-normal hidden xl:inline">
              {subtext}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div
        key={cardKey}
        onClick={onClick}
        className={`bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-2 transition-shadow ${
          isClickable ? 'cursor-pointer hover:shadow-md' : ''
        } ${className}`}
      >
        <div className="flex flex-col">
          <span className="text-gray-500 font-semibold text-[11px]">{title}</span>
          <span className="text-lg font-bold text-gray-900 leading-tight">{value}</span>
          {subtext && <span className="text-[10.5px] text-gray-400 mt-0.5">{subtext}</span>}
        </div>
        {IconComponent && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            {typeof IconComponent === 'function' ? (
              <IconComponent sx={{ fontSize: 18 }} />
            ) : (
              IconComponent
            )}
          </div>
        )}
      </div>
    );
  }

  // Default: 'compact' (Dashboard metrics & room status)
  return (
    <div
      key={cardKey}
      onClick={onClick}
      className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col transition-shadow ${
        isClickable ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">
          {title}
        </span>
        {IconComponent && (
          <div className={`${iconColor} shrink-0 flex items-center justify-center`}>
            {typeof IconComponent === 'function' ? (
              <IconComponent sx={{ fontSize: 16 }} />
            ) : (
              IconComponent
            )}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between mt-auto">
        <span className="text-lg font-bold text-gray-900">{value}</span>
        {subtext && <span className="text-[10px] text-gray-400 font-normal">{subtext}</span>}
      </div>
    </div>
  );
}
