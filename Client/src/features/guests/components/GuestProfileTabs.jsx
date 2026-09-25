import React from 'react';
import {
  DashboardOutlined,
  HotelOutlined,
  PaymentOutlined,
  ReceiptLongOutlined,
  ReportProblemOutlined,
  DescriptionOutlined,
  HistoryOutlined
} from '@mui/icons-material';

export const TABS_CONFIG = [
  { id: 'overview', label: 'Overview', icon: DashboardOutlined },
  { id: 'reservations', label: 'Reservations & Stays', icon: HotelOutlined, countKey: 'reservations' },
  { id: 'charges-payments', label: 'Charges & Payments', icon: PaymentOutlined, countKey: 'charges' },
  { id: 'invoices', label: 'Invoices', icon: ReceiptLongOutlined, countKey: 'invoices' },
  { id: 'requests-complaints', label: 'Requests & Complaints', icon: ReportProblemOutlined, countKey: 'complaints' },
  { id: 'documents', label: 'Documents', icon: DescriptionOutlined, countKey: 'documents' },
  { id: 'activity-log', label: 'Activity Log', icon: HistoryOutlined, countKey: 'activities' }
];

export default function GuestProfileTabs({ activeTab, onTabChange, counts = {} }) {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 shadow-2xs p-1">
      <div className="flex items-center justify-between gap-1 w-full">
        {TABS_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tab.countKey ? counts[tab.countKey] : undefined;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-auto flex items-center justify-center gap-1.5 px-2 sm:px-2.5 lg:px-3 py-2 rounded-lg text-[11.5px] xl:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#1b7f43] text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
              }`}
            >
              <Icon sx={{ fontSize: 16 }} className={isActive ? 'text-white' : 'text-gray-400'} />
              <span>{tab.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] leading-none font-bold rounded-full transition-colors shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
