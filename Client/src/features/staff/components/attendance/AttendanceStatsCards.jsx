import React from 'react';

export default function AttendanceStatsCards({ attendanceStats = [] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-3">
      {attendanceStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3 shadow-sm hover:border-[#1b7f43]/30 transition-colors"
          >
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <Icon sx={{ fontSize: 22 }} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                {stat.title}
              </span>
              <span className="text-xl font-bold text-gray-900 leading-none">
                {stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
