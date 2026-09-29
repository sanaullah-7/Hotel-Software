const fs = require('fs');
function replacePagination(file, lengthVar) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Check if CustomPagination is imported
    if (!content.includes('CustomPagination')) {
        content = content.replace("import {", "import CustomPagination from '../../../components/common/CustomPagination';\nimport {");
    }

    const regex = /\{\/\*\s*Pagination Footer\s*\*\/\}\s*<div className="flex flex-col sm:flex-row items-center justify-between[\s\S]*?(?=\{\/\*\s*Popover: Show \/ Hide Columns\s*\*\/\}|<\/div>\s*<\/div>\s*<\/div>\s*\);|\z)/;
    
    let replacement = `{/* Pagination Footer */}
            <CustomPagination
                totalItems={${lengthVar}}
                page={page + 1}
                onPageChange={(e, p) => setPage(p - 1)}
                itemsPerPage={rowsPerPage}
            />\n\n            `;
            
    content = content.replace(regex, (match) => {
        // If there's a trailing popover, preserve it by matching up to it
        let append = '';
        if (content.includes('{/* Popover: Show / Hide Columns */}')) {
             append = '{/* Popover: Show / Hide Columns */}';
        }
        return replacement + append;
    });
    
    // Also remove the append string from replacement if we did replace with regex that doesn't consume it
    // Actually, lookahead `(?=...)` doesn't consume the Popover comment, so we don't need to append it.
    
    // Let's rewrite regex to be safer
    const safeRegex = /\{\/\*\s*Pagination Footer\s*\*\/\}\s*<div[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
    // Wait, the block has multiple divs. It's:
    // <div className="flex ...">
    //   <div ...> ... </div>
    //   <div ...> ... </div>
    // </div>
    
    let newContent = content.split('{/* Pagination Footer */}');
    if (newContent.length > 1) {
        let before = newContent[0];
        let after = newContent[1];
        
        let afterLines = after.split('\n');
        let skipCount = 0;
        let endIdx = 0;
        
        for (let i = 0; i < afterLines.length; i++) {
            if (afterLines[i].includes('{/* Popover: Show / Hide Columns */}')) {
                endIdx = i;
                break;
            }
        }
        
        if (endIdx > 0) {
            content = before + replacement + afterLines.slice(endIdx).join('\n');
        }
    }

    fs.writeFileSync(file, content, 'utf-8');
}

replacePagination("Client/src/pages/HR/Attendance/TodaysAttendance/AttendanceTable.jsx", "filteredRecords.length");
replacePagination("Client/src/pages/HR/Salary/EmployeeSalary/SalaryTable.jsx", "filteredSalaries.length");

console.log("Done");
