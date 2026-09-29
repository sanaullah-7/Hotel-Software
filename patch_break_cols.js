const fs = require('fs');
let content = fs.readFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/AttendanceTable.jsx', 'utf8');

// 1. Replace the TH (header) for breakTime with two separate headers
const oldHeader = `                            {visibleColumns.breakTime && (
                                  <th
                                      scope="col"
                                      onClick={() => handleSort("breakTime")}
                                      className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                                  >
                                      <div className="flex items-center gap-1">
                                          <span>Break</span>
                                          {sortField === "breakTime" ? (
                                              sortOrder === "asc" ? (
                                                  <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                                              ) : (
                                                  <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                                              )
                                          ) : (
                                              <span className="text-slate-300 text-xs">\u{21C5}</span>
                                          )}
                                      </div>
                                  </th>
                              )}`;

const newHeaders = `                            {visibleColumns.breakFrom && (
                                  <th
                                      scope="col"
                                      onClick={() => handleSort("breakFrom")}
                                      className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                                  >
                                      <div className="flex items-center gap-1">
                                          <span>Break From</span>
                                          {sortField === "breakFrom" ? (
                                              sortOrder === "asc" ? (
                                                  <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                                              ) : (
                                                  <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                                              )
                                          ) : (
                                              <span className="text-slate-300 text-xs">\u{21C5}</span>
                                          )}
                                      </div>
                                  </th>
                              )}
                              {visibleColumns.breakTo && (
                                  <th
                                      scope="col"
                                      onClick={() => handleSort("breakTo")}
                                      className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                                  >
                                      <div className="flex items-center gap-1">
                                          <span>Break To</span>
                                          {sortField === "breakTo" ? (
                                              sortOrder === "asc" ? (
                                                  <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                                              ) : (
                                                  <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                                              )
                                          ) : (
                                              <span className="text-slate-300 text-xs">\u{21C5}</span>
                                          )}
                                      </div>
                                  </th>
                              )}`;

// 2. Replace the TD (cell) for breakTime with two separate cells
const oldCell = `                                        {visibleColumns.breakTime && (
                                              <td className="py-2.5 px-3 text-slate-600">
                                                 {row.breakTime}
                                              </td>
                                          )}`;

const newCells = `                                        {visibleColumns.breakFrom && (
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
                                          )}`;

// 3. Replace the column label in the show/hide popover
const oldLabel = `                                    {colKey === "breakTime"
                                          ? "Break"
                                          : colKey.replace(/([A-Z])/g, " $1").trim()}`;

const newLabel = `                                    {colKey === "breakFrom"
                                          ? "Break From"
                                          : colKey === "breakTo"
                                          ? "Break To"
                                          : colKey.replace(/([A-Z])/g, " $1").trim()}`;

if (content.includes('visibleColumns.breakTime')) {
    content = content.replace(oldCell, newCells);
    content = content.replace(oldLabel, newLabel);
    // For header, use a simpler approach since formatting might differ
    content = content.replace(/\{visibleColumns\.breakTime && \(\s*<th[\s\S]*?<\/th>\s*\)\}/g, newHeaders);
    fs.writeFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/AttendanceTable.jsx', content, 'utf8');
    console.log('Done - replaced breakTime with breakFrom + breakTo');
} else {
    console.log('breakTime not found - checking current state...');
    const hasBF = content.includes('visibleColumns.breakFrom');
    console.log('Already has breakFrom:', hasBF);
}
