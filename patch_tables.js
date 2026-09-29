const fs = require('fs');

let attContent = fs.readFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/AttendanceTable.jsx', 'utf8');

attContent = attContent.replace(
    'handleExportPDF,',
    'handleExportCSV,\n    handleExportPDF,'
);

attContent = attContent.replace(
    /<Tooltip title="Show \/ Hide Columns">[\s\S]*?onClick=\{\(e\) => setColumnAnchorEl\(e.currentTarget\)\}[\s\S]*?<\/Tooltip>/m,
    `<Tooltip title="Export to CSV">
                        <IconButton
                            onClick={handleExportCSV}
                            size="small"
                            sx={{
                                color: "#0ea5e9",
                                backgroundColor: "transparent",
                                "&:hover": { backgroundColor: "#f0f9ff" },
                                padding: "6px",
                            }}
                        >
                            <ViewColumnIcon sx={{ fontSize: 26 }} />
                        </IconButton>
                    </Tooltip>`
);
fs.writeFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/AttendanceTable.jsx', attContent, 'utf8');

let salContent = fs.readFileSync('Client/src/pages/HR/Salary/EmployeeSalary/SalaryTable.jsx', 'utf8');

salContent = salContent.replace(
    'handleExportPDF,',
    'handleExportCSV,\n    handleExportPDF,'
);

salContent = salContent.replace(
    /<Tooltip title="Show \/ Hide Columns">[\s\S]*?onClick=\{\(e\) => setColumnAnchorEl\(e.currentTarget\)\}[\s\S]*?<\/Tooltip>/m,
    `<Tooltip title="Export to CSV">
            <IconButton
              onClick={handleExportCSV}
              size="small"
              sx={{
                color: "#0ea5e9",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "#f0f9ff" },
                padding: "6px",
              }}
            >
              <ViewColumnIcon sx={{ fontSize: 26 }} />
            </IconButton>
          </Tooltip>`
);
fs.writeFileSync('Client/src/pages/HR/Salary/EmployeeSalary/SalaryTable.jsx', salContent, 'utf8');

console.log('Tables done');
