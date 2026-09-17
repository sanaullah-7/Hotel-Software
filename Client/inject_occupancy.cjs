const fs = require('fs');

let content = fs.readFileSync('src/pages/Occupancy/Occupancy.jsx', 'utf8');

const newTable = `{/* ROOM CARDS */}
        <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-4">
          {/* Table Header */}
          <div className="p-3 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-4">
              <h1 className="text-[16px] font-bold text-gray-700">Occupancy List</h1>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[250px] pl-4 pr-10 py-1.5 border border-gray-400 rounded-md text-[13px] text-gray-700 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" sx={{ fontSize: 18 }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><FilterAltOffIcon sx={{ fontSize: 16 }} /></button>
              <button className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"><VisibilityIcon sx={{ fontSize: 16 }} /></button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Room</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Type & Floor</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Bed</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Occupancy</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Price</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Status</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Housekeeping</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Guest</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRooms.map(room => (
                  <tr key={room.number} className="hover:bg-gray-50/30 transition-colors cursor-pointer">
                    <td className="py-2 px-3 text-[13px] font-bold text-gray-900">{room.number}</td>
                    <td className="py-2 px-3">
                      <div className="text-[12px] font-bold text-gray-800">{room.type}</div>
                      <div className="text-[11px] text-gray-500">Floor {room.floor}</div>
                    </td>
                    <td className="py-2 px-3 text-[12px] text-gray-600">
                      <div className="flex items-center gap-1.5"><BedIcon sx={{ fontSize: 16, color: '#9ca3af' }} /> {room.bed}</div>
                    </td>
                    <td className="py-2 px-3 text-[12px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <PersonIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                        {room.adults} Adult{room.adults !== 1 ? 's' : ''}{room.children > 0 ? \`, \${room.children} Child\` : ''} / {room.maxOccupancy}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-[12px] text-gray-600">
                      <span className="font-bold text-gray-800">$\${room.price}</span><span className="text-[10px] text-gray-400">/night</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: room.statusColor }}>
                        {room.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[12px]" style={{ color: room.housekeepingColor }}>
                      <div className="flex items-center gap-1.5">
                        <CleaningServicesIcon sx={{ fontSize: 15 }} /> {room.housekeeping}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      {room.guest ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-[12px]">
                            <PersonIcon sx={{ fontSize: 14, color: '#5c67f2' }} />
                            {room.guest.name}
                            {room.guest.vip && <span className="bg-[#fef08a] text-[#854d0e] text-[9px] px-1.5 py-0.5 rounded font-bold ml-1">VIP</span>}
                          </div>
                          <div className="text-gray-400 text-[11px] flex items-center gap-1 ml-5">
                            <span className="bg-white border border-gray-200 px-1 py-0.5 rounded text-[9px]">ID</span>
                            {room.guest.id}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[12px] text-gray-400 italic">No Guest</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-2">
                        {room.guest ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); openDetailsModal(room); }}
                            className="flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all cursor-pointer"
                            style={{ backgroundColor: '#1b5e20', background: 'linear-gradient(135deg, #2e7d32, #1b5e20)' }}
                          >
                            <VisibilityIcon sx={{ fontSize: 14 }} /> Details
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal(room); }}
                            className="flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all cursor-pointer"
                            style={{ backgroundColor: '#1f3a4a', background: 'linear-gradient(135deg, #2c4a5a, #1f3a4a)' }}
                          >
                            <PersonAddIcon sx={{ fontSize: 14 }} /> Add Guest
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Footer Pagination */}
          <div className="p-3 mt-auto flex items-center justify-between text-[12px] text-gray-600 border-t border-gray-100 bg-gray-50/30 rounded-b-[6px]">
            <span>Showing {filteredRooms.length} of {rooms.length} rooms</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 cursor-not-allowed">{'< Prev'}</span>
              <span className="cursor-pointer hover:text-gray-900">{'Next >'}</span>
            </div>
          </div>
        </div>`;

const regex = /\{\/\* ROOM CARDS \*\/\}[\s\S]*?(?=\{\/\* MODALS \*\/)/;
content = content.replace(regex, newTable + '\n\n        ');

fs.writeFileSync('src/pages/Occupancy/Occupancy.jsx', content, 'utf8');
console.log('Occupancy.jsx updated successfully.');
