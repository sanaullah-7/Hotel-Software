import React from 'react';
import KPICard from '../../../components/common/KPICard';

export default function EventSummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full mb-1">
      {cards.map((card) => (
        <KPICard
          key={card.id}
          title={card.title}
          value={card.value}
          subtext={card.subtext}
          icon={card.icon}
          iconBg={card.iconBg}
          iconColor={card.iconColor}
          variant="badge"
          className="hover:border-[#1b7f43]/40"
        />
      ))}
    </div>
  );
}
