import React from 'react';
import {
  EditOutlined, CancelOutlined,
  PhoneOutlined, EmailOutlined
} from '@mui/icons-material';
import { statusStyles } from '../data/groupReservationsDemoData';

export default function GroupReservationsTable({
  filteredGroups,
  openViewModal,
  openEditModal,
  confirmCancel
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200/80 shadow-xs w-full overflow-hidden flex flex-col">
      <div className="w-full overflow-hidden min-w-0">
        <table className="w-full text-left table-fixed border-collapse">
          <colgroup><col style={{ width: '13%' }} /><col style={{ width: '12%' }} /><col style={{ width: '14%' }} /><col style={{ width: '11%' }} /><col style={{ width: '9%' }} /><col style={{ width: '9%' }} /><col style={{ width: '5%' }} /><col style={{ width: '5%' }} /><col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '6%' }} /></colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50/50">
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Group Name</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Contact Person</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Email</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Phone</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Check In</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Check Out</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap text-center">Rooms</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap text-center">Guests</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Status</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Total Price</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <tr key={group.id} onClick={() => openViewModal(group)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="py-1.5 px-1.5 text-[11.5px] font-semibold text-gray-800 whitespace-nowrap truncate">
                  {group.groupName}
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-700 whitespace-nowrap truncate">
                  {group.contactPerson}
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap truncate">
                  <div className="flex items-center gap-1">
                    <EmailOutlined sx={{ fontSize: 12 }} className="text-[#ef4444] shrink-0" />
                    <span className="truncate">{group.email}</span>
                  </div>
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap truncate">
                  <div className="flex items-center gap-1">
                    <PhoneOutlined sx={{ fontSize: 12 }} className="text-[var(--primary-main)] shrink-0" />
                    <span className="truncate">{group.phone}</span>
                  </div>
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">
                  {group.checkIn}
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">
                  {group.checkOut}
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-700 whitespace-nowrap text-center font-medium">
                  {group.rooms}
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-700 whitespace-nowrap text-center font-medium">
                  {group.guests}
                </td>
                <td className="py-1.5 px-1.5 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold inline-block ${statusStyles[group.status]}`}>
                    {group.status}
                  </span>
                </td>
                <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-800 whitespace-nowrap">
                  ${Number(group.totalPrice).toLocaleString()}
                </td>
                <td className="py-1.5 px-1.5 relative whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(group); }} className="text-[var(--primary-main)] hover:text-green-700 transition-colors cursor-pointer" title="Edit">
                      <EditOutlined sx={{ fontSize: 15 }} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmCancel(group); }}
                      disabled={group.status === 'Cancelled'}
                      className="text-orange-500 hover:text-orange-600 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={group.status === 'Cancelled' ? 'Group is already cancelled' : 'Cancel Group Reservation'}
                    >
                      <CancelOutlined sx={{ fontSize: 15 }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredGroups.length === 0 && (
              <tr>
                <td colSpan="11" className="py-6 text-center text-gray-500 text-xs">
                  No group reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-end px-2 sm:px-2.5 py-2.5 border-t border-gray-100 bg-white gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500">Items per page:</span>
          <select className="border border-gray-200 rounded px-1.5 py-0.5 text-[11px] text-gray-700 outline-none cursor-pointer">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
        <span className="text-[11px] text-gray-500">1 - {filteredGroups.length} of {filteredGroups.length}</span>
        <div className="flex items-center gap-1">
          <button className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer text-xs">&lt;</button>
          <button className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer text-xs">&gt;</button>
        </div>
      </div>
    </div>
  );
}
