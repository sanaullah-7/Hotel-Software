const fs = require('fs');
let content = fs.readFileSync('Client/src/pages/HR/Salary/EmployeeSalary/SalaryTable.jsx', 'utf8');

// Replace imports
content = content.replace(/import AddCircleOutlineOutlinedIcon from '@mui\/icons-material\/AddCircleOutlineOutlined';/, 'import AddCircleIcon from "@mui/icons-material/AddCircle";');
content = content.replace(/import TableChartOutlinedIcon from '@mui\/icons-material\/TableChartOutlined';/, 'import ViewColumnIcon from "@mui/icons-material/ViewColumn";');

// Replace Add button
content = content.replace(/<Tooltip title="Add Employee Salary">[\s\S]*?<\/Tooltip>/, 
`<Tooltip title="Add Employee Salary">
            <IconButton
              onClick={handleOpenAddModal}
              size="small"
              sx={{
                color: "#1b7f43",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "#f0fdf4" },
                padding: "6px",
              }}
            >
              <AddCircleIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>`);

// Replace Refresh button
content = content.replace(/<Tooltip title="Refresh Data">[\s\S]*?<\/Tooltip>/,
`<Tooltip title="Refresh Data">
            <IconButton
              onClick={handleRefresh}
              size="small"
              sx={{
                color: "#1b7f43",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "#f0fdf4" },
                padding: "6px",
              }}
            >
              <RefreshIcon
                sx={{
                  fontSize: 26,
                  transition: "transform 0.4s ease",
                  transform: isRefreshing ? "rotate(360deg)" : "none",
                }}
              />
            </IconButton>
          </Tooltip>`);

// Replace Columns button
content = content.replace(/<Tooltip title="Show \/ Hide Columns">[\s\S]*?<\/Tooltip>/,
`<Tooltip title="Show / Hide Columns">
            <IconButton
              onClick={(e) => setColumnAnchorEl(e.currentTarget)}
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
          </Tooltip>`);

// Replace PDF button
content = content.replace(/<Tooltip title="Export Full Report \(PDF\)">[\s\S]*?<\/Tooltip>/,
`<Tooltip title="Export Full Report (PDF)">
            <IconButton
              onClick={handleExportPDF}
              size="small"
              sx={{
                color: "#ef4444",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "#fef2f2" },
                padding: "6px",
              }}
            >
              <PictureAsPdfIcon sx={{ fontSize: 26 }} />
            </IconButton>
          </Tooltip>`);

fs.writeFileSync('Client/src/pages/HR/Salary/EmployeeSalary/SalaryTable.jsx', content, 'utf8');
console.log('SalaryTable.jsx updated.');
