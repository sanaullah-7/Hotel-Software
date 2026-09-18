const fs = require('fs');
const file = 'src/pages/Occupancy/Occupancy.jsx';
let content = fs.readFileSync(file, 'utf8');

const tableCode = `<div className="bg-white rounded-[6px] shadow-sm border border-gray-100 overflow-x-auto mt-2">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Room</th>
              <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Type & Floor</th>
              <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Bed</th>
              <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Occupancy</th>
              <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Price</th>
              <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Status</th>
              <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Housekeeping</th>
              <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Guest</th>
              <th className="py-4 px-2 text-[12px] font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRooms.map(room => (
              <tr key={room.number} className="hover:bg-gray-50/30 transition-colors">
                <td className="py-3 px-2 text-[13px] font-bold text-gray-900">{room.number}</td>
                <td className="py-3 px-2">
                  <div className="text-[12px] font-bold text-gray-800">{room.type}</div>
                  <div className="text-[11px] text-gray-500">Floor {room.floor}</div>
                </td>
                <td className="py-3 px-2 text-[12px] text-gray-600">
                  <div className="flex items-center gap-1.5"><BedIcon sx={{ fontSize: 16, color: '#9ca3af' }} /> {room.bed}</div>
                </td>
                <td className="py-3 px-2 text-[12px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <PersonIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                    {room.adults} Adult{room.adults !== 1 ? 's' : ''}{room.children > 0 ? `, ${room.children} Child` : ''} / {room.maxOccupancy}
                  </div>
                </td>
                <td className="py-3 px-2 text-[12px] text-gray-600">
                  <span className="font-bold text-gray-800">${room.price}</span><span className="text-[10px] text-gray-400">/night</span>
                </td>
                <td className="py-3 px-2">
                  <span className="inline-flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: room.statusColor }}>
                    {room.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-[12px]" style={{ color: room.housekeepingColor }}>
                  <div className="flex items-center gap-1.5">
                    <CleaningServicesIcon sx={{ fontSize: 15 }} /> {room.housekeeping}
                  </div>
                </td>
                <td className="py-3 px-2">
                  {room.guest ? (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-[12px]">
                        <PersonIcon sx=x{ fontSize: 14, color: '#5c67f2' }} />
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
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {room.guest ? (
                      <button
                        onClick={() => openDetailsModal(room)}
                        className="flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all cursor-pointer"
                        style=x{ backgroundColor: '#1b5e20', background: 'linear-gradient(135deg, #2e7d32, #1b5e20)' }}
                      >
                        <VisibilityIcon sx={{ fontSize: 14 }} /> Details
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal(room)}
                        className="flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all cursor-pointer"
                        style=x{ backgroundColor: '#1f3a4a', background: 'linear-gradient(135deg, #2c4a5a, #1f3a4a)' }}
                      >
                        <PersonAddIcon sx=x{ fontSize: 14 }} /> Add
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>`;

const regex = /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">[\s\S]*?\{filteredRooms\.map\(room => \([\s\S]*?<\/div>\s*\)\)\}\s+<\/div>/;

if (regex.test(content)) {
    content = content.replace(regex, tableCode);
    fs.writeFileSync(file, content);
    console.log('Successfully replaced cards with table!');
} else {
    console.log('Could not find block.');
}