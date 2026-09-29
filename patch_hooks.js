const fs = require('fs');
let content = fs.readFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/useTodaysAttendance.js', 'utf8');

const exportPdfStr = `  const handleExportPDF = () => {`;
const exportCsvCode = `  const handleExportCSV = () => {
    const headers = ["Employee Name", "First In", "Break From", "Break To", "Last Out", "Total Hours", "Status", "Shift"];
    const csvRows = [headers.join(',')];

    sortedRecords.forEach(item => {
      const row = [
        \`"\${item.name}"\`,
        \`"\${item.firstIn}"\`,
        \`"\${item.breakFrom || ''}"\`,
        \`"\${item.breakTo || ''}"\`,
        \`"\${item.lastOut || ''}"\`,
        \`"\${item.totalHours}"\`,
        \`"\${item.status.toUpperCase()}"\`,
        \`"\${item.shift}"\`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', \`Attendance_Report_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

`;

if (!content.includes('handleExportCSV')) {
    content = content.replace(exportPdfStr, exportCsvCode + exportPdfStr);
    content = content.replace('handleExportPDF,', 'handleExportCSV,\n    handleExportPDF,');
    fs.writeFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/useTodaysAttendance.js', content, 'utf8');
}
console.log('useTodaysAttendance done');

let salContent = fs.readFileSync('Client/src/pages/HR/Salary/EmployeeSalary/useEmployeeSalary.js', 'utf8');
const salCsvCode = `  const handleExportCSV = () => {
    const headers = ["Employee Name", "Email", "Department", "Base Salary", "Bonus", "Deductions", "Net Salary"];
    const csvRows = [headers.join(',')];

    sortedSalaries.forEach(item => {
      const netSalary = (Number(item.salary) + Number(item.bonus || 0) - Number(item.deductions || 0));
      const row = [
        \`"\${item.name}"\`,
        \`"\${item.email}"\`,
        \`"\${item.department}"\`,
        \`"\${item.salary}"\`,
        \`"\${item.bonus || 0}"\`,
        \`"\${item.deductions || 0}"\`,
        \`"\${netSalary}"\`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', \`Salary_Report_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

`;

if (!salContent.includes('handleExportCSV')) {
    salContent = salContent.replace(exportPdfStr, salCsvCode + exportPdfStr);
    salContent = salContent.replace('handleExportPDF,', 'handleExportCSV,\n    handleExportPDF,');
    fs.writeFileSync('Client/src/pages/HR/Salary/EmployeeSalary/useEmployeeSalary.js', salContent, 'utf8');
}
console.log('useEmployeeSalary done');
