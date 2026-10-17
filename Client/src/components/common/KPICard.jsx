import React from 'react';

/**
 * Safely renders an icon whether passed as a React component type (function/forwardRef) or a JSX element.
 */
function renderIcon(icon, defaultSx = {}) {
  if (!icon) return null;
  if (React.isValidElement(icon)) {
    return icon;
  }
  const IconComp = icon;
  return <IconComp sx={defaultSx} />;
}

/**
 * Reusable KPI / Metric card for dashboards and module summary banners.
 *
 * Calibrated to exact 90% reference density for standard 100% viewport.
 */
export default function KPICard({
  title,
  value,
  subtext,
  icon,
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
        className={`bg-white rounded-lg border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-3 py-2.5 flex flex-col justify-between transition-colors ${
          isClickable ? 'cursor-pointer hover:border-[var(--primary-main)]/30' : ''
        } ${className}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && (
            <div className={`p-1 rounded-md ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
              {renderIcon(icon, { fontSize: 14 })}
            </div>
          )}
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider truncate">
            {title}
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-lg font-bold text-[var(--text-primary)] leading-none">
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
        className={`bg-white p-3 sm:p-3.5 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between gap-2 transition-shadow ${
          isClickable ? 'cursor-pointer hover:shadow-md' : ''
        } ${className}`}
      >
        <div className="flex flex-col">
          <span className="text-gray-500 font-semibold text-[11px]">{title}</span>
          <span className="text-lg font-bold text-gray-900 leading-tight">{value}</span>
          {subtext && <span className="text-[10px] text-gray-400 mt-0.5">{subtext}</span>}
        </div>
        {icon && (
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            {renderIcon(icon, { fontSize: 16 })}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        key={cardKey}
        onClick={onClick}
        className={`bg-white px-3 py-2 rounded-[6px] shadow-xs border border-gray-100 flex flex-col justify-between transition-shadow relative min-h-[52px] ${
          isClickable ? 'cursor-pointer hover:shadow-md' : ''
        } ${className}`}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="text-[11px] text-gray-500 font-medium whitespace-nowrap truncate">{title}</div>
          {icon && (
            <div className={`w-5.5 h-5.5 rounded flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
              {renderIcon(icon, { fontSize: 13 })}
            </div>
          )}
        </div>
        <div className="text-lg font-bold text-gray-900 leading-none">{value}</div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      key={cardKey}
      onClick={onClick}
      className={`bg-white p-3 sm:p-3.5 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between transition-shadow ${
        isClickable ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      <div>
        <div className="text-xl font-bold text-gray-900 leading-none mb-1">{value}</div>
        <div className="text-[11.5px] text-gray-500 font-medium whitespace-nowrap">{title}</div>
      </div>
      {icon && (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          {renderIcon(icon, { fontSize: 16 })}
        </div>
      )}
    </div>
  );
}
