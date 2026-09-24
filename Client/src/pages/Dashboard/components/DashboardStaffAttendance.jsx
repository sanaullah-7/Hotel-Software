import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CleaningServices,
  RoomService
} from '@mui/icons-material';

export const defaultRecentStaffAttendance = [
  { id: 1, name: 'Alice Smith', role: 'Receptionist', shift: 'Morning', timeIn: '08:00 AM', status: 'Present' },
  { id: 2, name: 'John Doe', role: 'Housekeeping', shift: 'Morning', timeIn: '08:15 AM', status: 'Late' },
  { id: 3, name: 'Emma Wilson', role: 'Chef', shift: 'Morning', timeIn: '--:--', status: 'Absent' },
  { id: 4, name: 'Michael Brown', role: 'Security', shift: 'Night', timeIn: '10:00 PM', status: 'Present' },
];

export default function DashboardStaffAttendance({
  staffAttendance = defaultRecentStaffAttendance
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left Side: Staff Attendance Table */}
      <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-[15px] font-bold text-gray-700">Today's Staff Attendance</h2>
          <Link
            to="/hr/attendance/today"
            className="text-[12px] text-[#1b7f43] font-bold hover:underline bg-[#e5f4eb] px-3 py-1 rounded-full"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                  Time In
                </th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {staffAttendance.map((staff, idx) => (
                <tr
                  key={staff.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    idx !== staffAttendance.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-800">{staff.name}</span>
                      <span className="text-[11px] font-medium text-gray-500">{staff.role}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{staff.shift}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{staff.timeIn}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                        staff.status === 'Present'
                          ? 'bg-[#e5f4eb] text-[#1b7f43]'
                          : staff.status === 'Late'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Side: Important Cards */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        {/* Card 1: Revenue summary */}
        <div className="bg-gradient-to-br from-[#1b7f43] to-[#125d30] rounded-2xl p-5 text-white shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <TrendingUp sx={{ fontSize: 80 }} />
          </div>
          <h3 className="text-white/80 text-[13px] font-medium mb-1">Today's Revenue</h3>
          <div className="text-[28px] font-bold mb-4">$8,450.00</div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="bg-white/20 px-2 py-1 rounded text-white font-medium">
              +15% from yesterday
            </span>
          </div>
        </div>

        {/* Card 2: Upcoming tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col flex-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[14px] font-bold text-gray-700">Pending Operations</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <CleaningServices sx={{ fontSize: 16 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-700">5 Rooms to Clean</span>
                <span className="text-[11px] text-gray-500">Housekeeping</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <RoomService sx={{ fontSize: 16 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-700">3 Room Service Orders</span>
                <span className="text-[11px] text-gray-500">Restaurant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
