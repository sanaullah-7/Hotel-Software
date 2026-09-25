import React from 'react';

export default function SalaryStatsCards({ payrollStats = [] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
      {payrollStats.map((card) => {
        const IconComp = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-3 py-2 flex flex-col justify-between hover:border-[var(--primary-main)]/30 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <div className={`p-1 rounded-md ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
                <IconComp sx={{ fontSize: 15 }} />
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider truncate">
                {card.title}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-[var(--text-primary)] leading-none">
                {card.value}
              </span>
            </div>
            {card.subtext && (
              <span className="text-[10px] text-[var(--text-secondary)] font-normal truncate mt-0.5 block" title={card.subtext}>
                {card.subtext}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
