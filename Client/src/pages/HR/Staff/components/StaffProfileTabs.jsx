import React from 'react';
import {
  BadgeOutlined,
  PersonOutlined,
  SchoolOutlined,
  CalendarTodayOutlined
} from '@mui/icons-material';

export const STAFF_TABS = [
  { id: 'overview', label: 'Overview & Role', icon: BadgeOutlined },
  { id: 'personal', label: 'Personal & Contact', icon: PersonOutlined },
  { id: 'qualifications', label: 'Qualifications & Skills', icon: SchoolOutlined },
  { id: 'attendance', label: 'Attendance & Leaves', icon: CalendarTodayOutlined }
];

export default function StaffProfileTabs({ activeTab, onTabChange }) {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 shadow-2xs p-1">
      <div
        role="tablist"
        aria-label="Staff profile tabs"
        className="flex items-center justify-between gap-1 w-full"
      >
        {STAFF_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex-auto flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#1b7f43] text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
              }`}
            >
              <Icon sx={{ fontSize: 16 }} className={isActive ? 'text-white' : 'text-gray-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
