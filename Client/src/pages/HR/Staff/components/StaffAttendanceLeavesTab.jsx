import React from 'react';
import {
  CalendarTodayOutlined,
  BeachAccessOutlined,
  CheckCircleOutlined,
  HourglassEmptyOutlined,
  HighlightOffOutlined,
  AccessTimeOutlined
} from '@mui/icons-material';

export default function StaffAttendanceLeavesTab({
  staff,
  leaveRequests = [],
  isLoadingLeaves = false
}) {
  const getLeaveStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20 flex items-center gap-1">
          <CheckCircleOutlined sx={{ fontSize: 12 }} /> Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
          <HighlightOffOutlined sx={{ fontSize: 12 }} /> Rejected
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
        <HourglassEmptyOutlined sx={{ fontSize: 12 }} /> Pending
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Attendance & Leave Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Present Rate
          </span>
          <div className="text-2xl font-black text-[#1b7f43]">95%</div>
          <p className="text-[10.5px] text-gray-500 mt-0.5">High consistency</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Absent Days
          </span>
          <div className="text-2xl font-black text-rose-600">2</div>
          <p className="text-[10.5px] text-gray-500 mt-0.5">Current year</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Late Check-ins
          </span>
          <div className="text-2xl font-black text-amber-600">3</div>
          <p className="text-[10.5px] text-gray-500 mt-0.5">Under review</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Leaves Remaining
          </span>
          <div className="text-2xl font-black text-blue-600">8 / 12</div>
          <p className="text-[10.5px] text-gray-500 mt-0.5">Annual entitlement</p>
        </div>
      </div>

      {/* Leave History Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BeachAccessOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
            <h3 className="text-sm font-bold text-gray-900">Leave Requests & History</h3>
          </div>
          <span className="text-xs text-gray-500 font-semibold">
            {leaveRequests.length} Record{leaveRequests.length === 1 ? '' : 's'}
          </span>
        </div>

        {isLoadingLeaves ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            <div className="w-5 h-5 border-2 border-[#1b7f43] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading leave requests from server...
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs italic">
            No leave requests recorded for this staff member.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase text-[10.5px]">
                  <th className="py-2.5 px-4">Leave Type</th>
                  <th className="py-2.5 px-4">From</th>
                  <th className="py-2.5 px-4">To</th>
                  <th className="py-2.5 px-4">Days</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {leaveRequests.map((leave, idx) => (
                  <tr key={leave._id || leave.id || idx} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 font-bold text-gray-900">
                      {leave.leave_type || leave.type || 'Annual Leave'}
                    </td>
                    <td className="py-2.5 px-4">{leave.start_date || leave.startDate || '—'}</td>
                    <td className="py-2.5 px-4">{leave.end_date || leave.endDate || '—'}</td>
                    <td className="py-2.5 px-4 font-semibold">{leave.days || 1}</td>
                    <td className="py-2.5 px-4 text-gray-500 max-w-[200px] truncate">
                      {leave.reason || 'Personal'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex justify-center">
                        {getLeaveStatusBadge(leave.status)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
