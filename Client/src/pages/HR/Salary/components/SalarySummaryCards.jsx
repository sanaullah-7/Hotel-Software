import React from 'react';
import KPICard from '../../../../components/common/KPICard';

export default function SalarySummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
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
        />
      ))}
    </div>
  );
}
