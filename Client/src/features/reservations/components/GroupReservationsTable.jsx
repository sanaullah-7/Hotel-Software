import React from 'react';
import {
  EditOutlined, DeleteOutlined,
  PhoneOutlined, EmailOutlined
} from '@mui/icons-material';
import { statusStyles } from '../data/groupReservationsDemoData';

export default function GroupReservationsTable({
  filteredGroups,
  openViewModal,
  openEditModal,
  confirmDelete
}) {
  return (
    <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 w-full max-lg:overflow-x-auto lg:overflow-x-hidden min-w-0">
      <table className="w-full text-left border-collapse table-fixed max-lg:min-w-[850px]">
        <colgroup>
          <col style={{ width: '13%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '4%' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100 bg-white">
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Group Name</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Contact Person</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Email</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Phone</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Check In</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Check Out</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap text-center">Rooms</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap text-center">Guests</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Status</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Total Price</th>
            <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.map((group) => (
            <tr key={group.id} onClick={() => openViewModal(group)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
              <td className="py-2 px-2 text-[12px] font-semibold text-gray-800 whitespace-nowrap">
                {group.groupName}
              </td>
              <td className="py-2 px-2 text-[12px] text-gray-700 whitespace-nowrap">
                {group.contactPerson}
              </td>
              <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <EmailOutlined sx={{ fontSize: 13 }} className="text-[#ef4444] shrink-0" />
                  <span>{group.email}</span>
                </div>
              </td>
              <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <PhoneOutlined sx={{ fontSize: 13 }} className="text-[var(--primary-main)] shrink-0" />
                  <span>{group.phone}</span>
                </div>
              </td>
              <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap">
                {group.checkIn}
              </td>
              <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap">
                {group.checkOut}
              </td>
              <td className="py-2 px-2 text-[12px] text-gray-700 whitespace-nowrap text-center">
                {group.rooms}
              </td>
              <td className="py-2 px-2 text-[12px] text-gray-700 whitespace-nowrap text-center">
                {group.guests}
              </td>
              <td className="py-2 px-2 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded-[4px] text-[10.5px] font-bold inline-block ${statusStyles[group.status]}`}>
                  {group.status}
                </span>
              </td>
              <td className="py-2 px-2 text-[12px] font-semibold text-gray-800 whitespace-nowrap">
                ${Number(group.totalPrice).toLocaleString()}
              </td>
              <td className="py-2 px-2 relative whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(group); }} className="text-[var(--primary-main)] hover:text-green-700 transition-colors cursor-pointer" title="Edit">
                    <EditOutlined sx={{ fontSize: 16 }} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); confirmDelete(group); }} className="text-orange-500 hover:text-orange-600 transition-colors cursor-pointer" title="Delete">
                    <DeleteOutlined sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredGroups.length === 0 && (
            <tr>
              <td colSpan="11" className="py-8 text-center text-gray-500 text-sm">
                No group reservations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="flex items-center justify-end px-2 py-4 border-t border-gray-100 bg-white gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-500">Items per page:</span>
          <select className="border border-gray-200 rounded px-2 py-1 text-[12px] text-gray-700 outline-none cursor-pointer">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
        <span className="text-[12px] text-gray-500">1 - {filteredGroups.length} of {filteredGroups.length}</span>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">&lt;</button>
          <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">&gt;</button>
        </div>
      </div>
    </div>
  );
}
