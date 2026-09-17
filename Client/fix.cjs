const fs = require('fs');

// Fix Rooms.jsx
const roomsPath = 'c:/Users/Admin/Desktop/Saylani-Bootcamp/HotelManagement/Client/src/pages/Rooms/Rooms.jsx';
const roomsCode = fs.readFileSync(roomsPath, 'utf8');
const roomsLines = roomsCode.split('\n');
const fixedRoomsCode = roomsLines.slice(0, 467).join('\n');
fs.writeFileSync(roomsPath, fixedRoomsCode);
console.log('Fixed Rooms.jsx');

// Fix AllReservations.jsx
const resPath = 'c:/Users/Admin/Desktop/Saylani-Bootcamp/HotelManagement/Client/src/pages/Reservation/AllReservations.jsx';
const resCode = fs.readFileSync(resPath, 'utf8');
const resLines = resCode.split('\n');

// Take lines 0 to 311
let fixedResCode = resLines.slice(0, 311).join('\n');

// Replace imports 
fixedResCode = fixedResCode.replace(
  /import React[\s\S]*?@mui\/icons-material';/, 
`import React, { useState, useRef, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Popover, IconButton, Menu } from '@mui/material';
import {
  Search, FilterList, AddCircleOutlined, Refresh,
  TableChart, PictureAsPdf, MoreHoriz,
  EditOutlined, DeleteOutlined, LogoutOutlined, CancelOutlined,
  Close, FaceOutlined, CalendarTodayOutlined,
  EmailOutlined, PhoneOutlined, Person, SubjectOutlined, LocalOfferOutlined,
  Inventory2, KeyboardArrowDown, ChevronLeft, ChevronRight, CheckCircle, MoreVert, Download, Logout, Edit, Delete
} from '@mui/icons-material';`
);

// Append the missing tags and pagination
fixedResCode += `
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="p-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[12px] text-gray-500">
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredReservations.length)}</span> of <span className="font-semibold text-gray-700">{filteredReservations.length}</span>
            </span>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft fontSize="small" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={\`w-6 h-6 rounded-md text-[12px] font-medium flex items-center justify-center transition-colors \${
                    currentPage === i + 1 
                      ? 'bg-[#1b7f43] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }\`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Menu Popup */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1, minWidth: 150, borderRadius: '12px', padding: '4px' }
        }}
      >
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', mb: 0.5 }}>
          <EditOutlined sx={{ fontSize: 16, mr: 1.5, color: '#3b82f6' }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', mb: 0.5 }}>
          <CheckCircle sx={{ fontSize: 16, mr: 1.5, color: '#1b7f43' }} /> Check In
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', mb: 0.5 }}>
          <LogoutOutlined sx={{ fontSize: 16, mr: 1.5, color: '#f59e0b' }} /> Check Out
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>
          <DeleteOutlined sx={{ fontSize: 16, mr: 1.5 }} /> Delete
        </MenuItem>
      </Menu>
    </div>
  );
}
`;

fs.writeFileSync(resPath, fixedResCode);
console.log('Fixed AllReservations.jsx');
