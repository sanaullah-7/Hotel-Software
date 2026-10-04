import React from 'react';

export default function MetricCards({ cards, className = '', compactSubtext = false }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full mt-1 ${className}`}>
      {cards.map((card) => {
        const IconComp = card.icon;
        const bg = card.iconBg || 'bg-blue-50';
        const color = card.iconColor || 'text-blue-600';
        const colorClass = `${bg} ${color}`;
        return (
          <div
            key={card.id}
            className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div>
              <div className="text-xl font-bold text-gray-900 leading-none mb-1">{card.value}</div>
              <div className="text-[11px] text-gray-500 font-medium">{card.title}</div>
            </div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
              <IconComp sx={{ fontSize: 16 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
