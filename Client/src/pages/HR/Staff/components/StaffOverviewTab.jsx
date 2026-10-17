import React from 'react';
import {
  BusinessOutlined,
  BadgeOutlined,
  AccessTimeOutlined,
  CalendarTodayOutlined,
  AttachMoneyOutlined,
  SupervisorAccountOutlined,
  CheckCircleOutlined,
  TrendingUp,
  EventBusyOutlined,
  BeachAccessOutlined,
  ArrowForward
} from '@mui/icons-material';

export default function StaffOverviewTab({
  staff,
  onSwitchTab
}) {
  const yearsExp = staff.experience ? `${staff.experience} Years` : 'Fresh';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Attendance Rate</span>
            <CheckCircleOutlined sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
          </div>
          <div className="text-xl font-black text-gray-900">
            95%
          </div>
          <p className="text-[10.5px] text-gray-400 mt-0.5">High reliability record</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Remaining Leaves</span>
            <BeachAccessOutlined sx={{ fontSize: 18 }} className="text-blue-600" />
          </div>
          <div className="text-xl font-black text-gray-900">
            8 Days
          </div>
          <p className="text-[10.5px] text-gray-400 mt-0.5">4 of 12 used this year</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Experience</span>
            <TrendingUp sx={{ fontSize: 18 }} className="text-amber-500" />
          </div>
          <div className="text-xl font-black text-gray-900">
            {yearsExp}
          </div>
          <p className="text-[10.5px] text-gray-400 mt-0.5">Industry experience</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Salary</span>
            <AttachMoneyOutlined sx={{ fontSize: 18 }} className="text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600">
            {staff.salary ? `$${Number(staff.salary).toLocaleString()}` : 'Confidential'}
          </div>
          <p className="text-[10.5px] text-gray-400 mt-0.5">Direct payroll rate</p>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Employment & Role Details */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <BadgeOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
                <h3 className="text-sm font-bold text-gray-900">Role & Organization</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                Ref: {staff.empId || staff.employee_ref}
              </span>
            </div>

            <div className="space-y-3.5 text-xs text-gray-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 font-semibold block text-[10.5px]">Designation</span>
                  <span className="font-bold text-gray-800 text-sm">
                    {staff.designation}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[10.5px]">Department</span>
                  <span className="font-bold text-gray-800 text-sm">
                    {staff.department}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-gray-500 font-medium flex items-center gap-2">
                    <BadgeOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Employment Type
                  </span>
                  <span className="font-semibold text-gray-800">{staff.empType || 'Full-Time'}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-gray-500 font-medium flex items-center gap-2">
                    <AccessTimeOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Shift & Timing
                  </span>
                  <span className="font-semibold text-gray-800">
                    {staff.shift} ({staff.shiftTime})
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-gray-500 font-medium flex items-center gap-2">
                    <SupervisorAccountOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Reports To (Manager)
                  </span>
                  <span className="font-semibold text-gray-800">{staff.reportsTo || 'Department Head'}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-gray-500 font-medium flex items-center gap-2">
                    <CalendarTodayOutlined sx={{ fontSize: 16 }} className="text-gray-400" /> Date of Joining
                  </span>
                  <span className="font-semibold text-gray-800">{staff.joiningDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demographics Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <h3 className="text-sm font-bold text-gray-900">Demographic Overview</h3>
              <button
                onClick={() => onSwitchTab('personal')}
                className="text-xs text-[#1b7f43] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Full Details <ArrowForward sx={{ fontSize: 13 }} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-[10px] text-gray-400 block font-semibold">Gender</span>
                <span className="font-bold text-gray-800">{staff.gender || 'Not Specified'}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-[10px] text-gray-400 block font-semibold">Nationality</span>
                <span className="font-bold text-gray-800">{staff.nationality || 'Not Specified'}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-[10px] text-gray-400 block font-semibold">Marital Status</span>
                <span className="font-bold text-gray-800">{staff.maritalStatus || 'Single'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance & Leave Overview + Compensation */}
        <div className="space-y-5">
          {/* Attendance & Leave Widget */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <CalendarTodayOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
                <h3 className="text-sm font-bold text-gray-900">Attendance & Leave Record</h3>
              </div>
              <button
                onClick={() => onSwitchTab('attendance')}
                className="text-xs text-[#1b7f43] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Full Sheet <ArrowForward sx={{ fontSize: 13 }} />
              </button>
            </div>

            {/* Attendance Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-gray-700">Attendance Reliability</span>
                  <span className="text-[#1b7f43] font-bold">95% Present</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#1b7f43] h-2.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              {/* Attendance Mini Stats */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 bg-emerald-50/60 rounded-xl text-center border border-emerald-100/60">
                  <span className="text-lg font-black text-emerald-700 block leading-tight">95%</span>
                  <span className="text-[10.5px] font-semibold text-emerald-600">Present</span>
                </div>
                <div className="p-2.5 bg-rose-50/60 rounded-xl text-center border border-rose-100/60">
                  <span className="text-lg font-black text-rose-700 block leading-tight">2</span>
                  <span className="text-[10.5px] font-semibold text-rose-600">Absent</span>
                </div>
                <div className="p-2.5 bg-amber-50/60 rounded-xl text-center border border-amber-100/60">
                  <span className="text-lg font-black text-amber-700 block leading-tight">3</span>
                  <span className="text-[10.5px] font-semibold text-amber-600">Late Days</span>
                </div>
              </div>

              {/* Leaves Summary Cards */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 mb-2">Annual Leave Allocation</h4>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/60">
                    <span className="text-lg font-black text-blue-700 block leading-tight">12</span>
                    <span className="text-[10.5px] font-semibold text-blue-600">Total Leaves</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/60">
                    <span className="text-lg font-black text-gray-700 block leading-tight">4</span>
                    <span className="text-[10.5px] font-semibold text-gray-600">Used</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/60">
                    <span className="text-lg font-black text-[#1b7f43] block leading-tight">8</span>
                    <span className="text-[10.5px] font-semibold text-[#1b7f43]">Remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Quick Card */}
          {staff.emergencyName && (
            <div className="bg-gradient-to-r from-amber-50/40 via-orange-50/20 to-white rounded-2xl border border-amber-200/60 p-4.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  Emergency Contact
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                  {staff.emergencyRelation || 'Contact'}
                </span>
              </div>
              <p className="text-sm font-black text-gray-900">{staff.emergencyName}</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">
                {staff.emergencyPhone || 'No phone on record'}
              </p>
            </div>
          )}

          {/* Internal Notes Preview */}
          {staff.notes && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5">
              <h3 className="text-xs font-bold text-gray-700 mb-2">HR Remarks & Notes</h3>
              <p className="text-xs text-gray-600 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                "{staff.notes}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
