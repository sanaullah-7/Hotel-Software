import React from 'react';

export default function EventSummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 mt-1">
      {cards.map((card) => {
        const IconComp = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-[6px] border border-gray-100 p-4 flex flex-col relative shadow-sm"
          >
            <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
              <IconComp sx={{ fontSize: 16 }} />
            </div>
            <span className="text-[12px] font-semibold text-[var(--text-secondary)]">{card.title}</span>
            <span className="text-[20px] font-bold text-[var(--text-primary)] mt-1">{card.value}</span>
            <span className="text-[11px] text-gray-400 mt-1">{card.subtext}</span>
          </div>
        );
      })}
    </div>
  );
}
