import React from 'react';

export default function StaffSummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
      {cards.map((card) => {
        const IconComp = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2 flex flex-col justify-between hover:border-[var(--primary-main)]/30 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="p-1 rounded-md bg-[var(--primary-main)]/10 text-[var(--primary-main)] flex items-center justify-center shrink-0">
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
              {card.subtext && (
                <span className="text-[10px] text-[var(--text-secondary)] font-normal hidden xl:inline">
                  {card.subtext}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
