import React from 'react';

export default function AttendanceStatsCards({ attendanceStats = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1 mb-2">
      {attendanceStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div>
              <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                {stat.value}
              </div>
              <div className="text-[13px] text-gray-500 font-medium">
                {stat.title}
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <Icon sx={{ fontSize: 18 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
