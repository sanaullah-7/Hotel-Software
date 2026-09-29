const fs = require('fs');
let content = fs.readFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/AttendanceTable.jsx', 'utf8');

// Fix the remaining breakTime cell (TD)
content = content.replace(
    /\{visibleColumns\.breakTime && \(\s*<td className="py-2\.5 px-3 text-slate-600">\s*\{row\.breakTime\}\s*<\/td>\s*\)\}/,
    `{visibleColumns.breakFrom && (
                                              <td className="py-2.5 px-3 text-slate-600">
                                                  <div className="flex items-center gap-1.5 font-medium">
                                                      <ScheduleIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                                      <span>{row.breakFrom || '-'}</span>
                                                  </div>
                                              </td>
                                          )}
                                          {visibleColumns.breakTo && (
                                              <td className="py-2.5 px-3 text-slate-600">
                                                  <div className="flex items-center gap-1.5 font-medium">
                                                      <ScheduleIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                                      <span>{row.breakTo || '-'}</span>
                                                  </div>
                                              </td>
                                          )}`
);

// Fix label in show/hide popover
content = content.replace(
    '{colKey === "breakTime"\n                                          ? "Break"\n                                          : colKey.replace(/([A-Z])/g, " $1").trim()}',
    '{colKey === "breakFrom"\n                                          ? "Break From"\n                                          : colKey === "breakTo"\n                                          ? "Break To"\n                                          : colKey.replace(/([A-Z])/g, " $1").trim()}'
);

fs.writeFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/AttendanceTable.jsx', content, 'utf8');
const remaining = (content.match(/breakTime/g) || []).length;
console.log('Remaining breakTime references:', remaining);
