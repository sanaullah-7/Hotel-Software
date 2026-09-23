import React from 'react';
import KPICard from '../../../../components/common/KPICard';

export default function StaffSummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
      {cards.map((card) => (
        <KPICard
          key={card.id}
          title={card.title}
          value={card.value}
          subtext={card.subtext}
          icon={card.icon}
          iconBg="bg-[var(--primary-main)]/10"
          iconColor="text-[var(--primary-main)]"
          variant="badge"
        />
      ))}
    </div>
  );
}
