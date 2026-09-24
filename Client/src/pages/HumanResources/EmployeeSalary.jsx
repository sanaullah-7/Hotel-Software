import React, { useMemo, useState } from'react';
import {
 Alert,
 Checkbox,
 Dialog,
 DialogContent,
 FormControlLabel,
 IconButton,
 InputAdornment,
 MenuItem,
 Popover,
 Snackbar,
 TextField,
 Tooltip
} from'@mui/material';
import SearchIcon from'@mui/icons-material/Search';
import AddCircleOutlineOutlinedIcon from'@mui/icons-material/AddCircleOutlineOutlined';
import ArrowDownwardIcon from'@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from'@mui/icons-material/ArrowUpward';
import AttachMoneyOutlinedIcon from'@mui/icons-material/AttachMoneyOutlined';
import ChevronLeftIcon from'@mui/icons-material/ChevronLeft';
import ChevronRightIcon from'@mui/icons-material/ChevronRight';
import CloseIcon from'@mui/icons-material/Close';
import DeleteOutlinedIcon from'@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from'@mui/icons-material/EditOutlined';
import FileDownloadOutlinedIcon from'@mui/icons-material/FileDownloadOutlined';
import FilterListIcon from'@mui/icons-material/FilterList';
import MailOutlineOutlinedIcon from'@mui/icons-material/MailOutlineOutlined';
import PaymentsOutlinedIcon from'@mui/icons-material/PaymentsOutlined';
import PersonOutlineOutlinedIcon from'@mui/icons-material/PersonOutlineOutlined';
import PictureAsPdfIcon from'@mui/icons-material/PictureAsPdf';
import RefreshIcon from'@mui/icons-material/Refresh';
import RemoveCircleOutlineOutlinedIcon from'@mui/icons-material/RemoveCircleOutlineOutlined';
import TableChartOutlinedIcon from'@mui/icons-material/TableChartOutlined';
import TagOutlinedIcon from'@mui/icons-material/TagOutlined';
import WarningAmberOutlinedIcon from'@mui/icons-material/WarningAmberOutlined';
import PeopleOutlinedIcon from'@mui/icons-material/PeopleOutlined';
import TrendingUpOutlinedIcon from'@mui/icons-material/TrendingUpOutlined';
import WorkspacePremiumOutlinedIcon from'@mui/icons-material/WorkspacePremiumOutlined';
import jsPDF from'jspdf';
import autoTable from'jspdf-autotable';
import { mockSalaries } from'../../utils/mockData';
import SalarySummaryCards from '../../components/HumanResources/Salary/SalarySummaryCards';
import '../../features/assigned-ui/formStyles.css';
import '../../features/assigned-ui/toolbarStyles.css';

const departmentsList = ['All','Management','Front Office','Housekeeping','Kitchen'];
const rolesList = ['Manager','Receptionist','Housekeeper','Chef','Staff'];

const initialSalaryList = mockSalaries.map((salary) => ({
 ...salary,
 role: salary.designation ||'Staff',
 salary: salary.salary ?? salary.basicSalary ?? 0,
 bonus: salary.bonus ?? salary.allowances ?? 0,
 avatar:`https://ui-avatars.com/api/?name=${encodeURIComponent(salary.name)}&background=5d5fef&color=fff`
}));

export default function EmployeeSalary() {
  // Main Data State
  const [salaries, setSalaries] = useState(initialSalaryList);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter Popover State
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    department: true,
    salary: true,
    bonus: true,
    deductions: true,
    netSalary: true,
    payslip: true,
    actions: true
  });

  // Modal Dialogs State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    email: '',
    department: 'Front Office',
    role: 'Manager',
    salary: '',
    bonus: '',
    deductions: '',
    avatar: ''
  });

  // Notification Toast State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Search Logic
  const filteredSalaries = useMemo(() => {
    return salaries.filter((item) => {
      const net = (item.salary || 0) + (item.bonus || 0) - (item.deductions || 0);
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(net).includes(searchQuery);

      const matchesDept = departmentFilter === 'All' || item.department === departmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [salaries, searchQuery, departmentFilter]);

  // Sorted Records
  const sortedSalaries = useMemo(() => {
    const list = [...filteredSalaries];
    if (!sortField) return list;

    return list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'netSalary') {
        aVal = (a.salary || 0) + (a.bonus || 0) - (a.deductions || 0);
        bVal = (b.salary || 0) + (b.bonus || 0) - (b.deductions || 0);
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSalaries, sortField, sortOrder]);

  // Paginated Records
  const paginatedSalaries = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedSalaries.slice(start, start + rowsPerPage);
  }, [sortedSalaries, page, rowsPerPage]);

  // Selection Logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allPageIds = paginatedSalaries.map((r) => r.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allPageIds])));
    } else {
      const pageIdSet = new Set(paginatedSalaries.map((r) => r.id));
      setSelectedIds(selectedIds.filter((id) => !pageIdSet.has(id)));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected =
    paginatedSalaries.length > 0 && paginatedSalaries.every((r) => selectedIds.includes(r.id));
  const isSomeSelected =
    paginatedSalaries.some((r) => selectedIds.includes(r.id)) && !isAllSelected;

  // Refresh Action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSalaries(initialSalaryList);
      setIsRefreshing(false);
      setToast({
        open: true,
        message: 'Employee salary records refreshed successfully!',
        severity: 'success'
      });
    }, 400);
  };

  // Full Table PDF Export Action
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Employee Salary Report', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      14,
      25
    );

    const tableData = sortedSalaries.map((item) => [
      item.name,
      item.email,
      item.department,
      `$${Number(item.salary).toLocaleString()}`,
      `$${Number(item.bonus || 0).toLocaleString()}`,
      `$${Number(item.deductions || 0).toLocaleString()}`,
      `$${((item.salary || 0) + (item.bonus || 0) - (item.deductions || 0)).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Employee Name', 'Email', 'Department', 'Salary', 'Bonus', 'Deductions', 'Net Salary']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [93, 95, 239],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    });

    doc.save(`Employee_Salary_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    setToast({
      open: true,
      message: 'Full salary report exported to PDF!',
      severity: 'success'
    });
  };

  // Individual Payslip PDF Download Action
  const handleDownloadPayslip = (row) => {
    const doc = new jsPDF();
    const net = (row.salary || 0) + (row.bonus || 0) - (row.deductions || 0);

    // Header Band
    doc.setFillColor(93, 95, 239);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('LUXURIA HOTEL & SUITES', 14, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('PAYSLIP / SALARY STATEMENT', 14, 27);

    // Employee Details Box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Information:', 14, 48);

    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${row.name}`, 14, 56);
    doc.text(`Employee ID: ${row.empId}`, 14, 63);
    doc.text(`Department: ${row.department}`, 14, 70);
    doc.text(`Role: ${row.role || 'Staff'}`, 14, 77);

    doc.text(`Email: ${row.email}`, 120, 56);
    doc.text(`Payment Period: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`, 120, 63);
    doc.text(`Status: ${row.paymentStatus || 'Paid'}`, 120, 70);

    // Breakdown Table
    autoTable(doc, {
      startY: 88,
      head: [['Earnings / Breakdown', 'Amount (USD)']],
      body: [
        ['Basic Salary', `$${Number(row.salary).toLocaleString()}`],
        ['Bonus & Allowances', `+$${Number(row.bonus || 0).toLocaleString()}`],
        ['Deductions & Taxes', `-$${Number(row.deductions || 0).toLocaleString()}`],
        ['NET SALARY PAYABLE', `$${net.toLocaleString()}`]
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [93, 95, 239],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      }
    });

    // Signature Area
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(9);
    doc.text('_________________________', 14, finalY);
    doc.text('Employer Signature', 14, finalY + 7);

    doc.text('_________________________', 130, finalY);
    doc.text('Employee Signature', 130, finalY + 7);

    doc.save(`Payslip_${row.name.replace(/\s+/g, '_')}_${row.empId}.pdf`);
    setToast({
      open: true,
      message: `Payslip downloaded for ${row.name}!`,
      severity: 'success'
    });
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      empId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      email: '',
      department: 'Front Office',
      role: 'Manager',
      salary: '',
      bonus: '',
      deductions: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    });
    setIsAddModalOpen(true);
  };

  // Save New Employee Salary
  const handleSaveNewSalary = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.salary) return;

    const newRecord = {
      id: Date.now(),
      empId: formData.empId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      avatar:
        formData.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=5d5fef&color=fff`,
      email: formData.email || 'test@email.com',
      department: formData.department,
      role: formData.role,
      salary: Number(formData.salary) || 0,
      bonus: Number(formData.bonus) || 0,
      deductions: Number(formData.deductions) || 0,
      paymentStatus: 'Paid'
    };

    setSalaries([newRecord, ...salaries]);
    setIsAddModalOpen(false);
    setToast({
      open: true,
      message: `Salary record added for ${formData.name}!`,
      severity: 'success'
    });
  };

  // Open Edit Modal
  const handleOpenEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      name: record.name,
      empId: record.empId,
      email: record.email,
      department: record.department,
      role: record.role || 'Staff',
      salary: record.salary,
      bonus: record.bonus || 0,
      deductions: record.deductions || 0,
      avatar: record.avatar
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Salary
  const handleSaveEditSalary = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setSalaries(
      salaries.map((item) =>
        item.id === selectedRecord.id
          ? {
              ...item,
              name: formData.name,
              empId: formData.empId,
              email: formData.email,
              department: formData.department,
              role: formData.role,
              salary: Number(formData.salary) || 0,
              bonus: Number(formData.bonus) || 0,
              deductions: Number(formData.deductions) || 0
            }
          : item
      )
    );

    setIsEditModalOpen(false);
    setToast({
      open: true,
      message: `Salary record updated for ${formData.name}!`,
      severity: 'success'
    });
  };

  // Open Delete Dialog
  const handleOpenDeleteDialog = (record) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedRecord) return;
    setSalaries(salaries.filter((item) => item.id !== selectedRecord.id));
    setSelectedIds(selectedIds.filter((id) => id !== selectedRecord.id));
    setIsDeleteDialogOpen(false);
    setToast({
      open: true,
      message: `Salary record for ${selectedRecord.name} deleted!`,
      severity: 'success'
    });
  };

  // Dynamic 6-card Payroll Summary Metrics (calculated from overall salaries state)
  const payrollStats = useMemo(() => {
    const list = Array.isArray(salaries) ? salaries : [];
    const totalEmployees = list.length;

    let totalPayroll = 0;
    let totalBonuses = 0;
    let totalDeductions = 0;
    let highestNetSalary = 0;
    let highestSalaryEmployee = null;

    list.forEach((item) => {
      const sal = Number(item.salary) || 0;
      const bon = Number(item.bonus) || 0;
      const ded = Number(item.deductions) || 0;
      const net = sal + bon - ded;

      totalPayroll += net;
      totalBonuses += bon;
      totalDeductions += ded;

      if (net > highestNetSalary || highestSalaryEmployee === null) {
        highestNetSalary = net;
        highestSalaryEmployee = item;
      }
    });

    const averageSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

    return [
      {
        id: 'total-employees',
        title: 'Total Employees',
        value: totalEmployees,
        subtext: 'Employees with salary records',
        icon: PeopleOutlinedIcon,
        iconBg: 'bg-[var(--primary-main)]/10',
        iconColor: 'text-[var(--primary-main)]'
      },
      {
        id: 'total-payroll',
        title: 'Total Payroll',
        value: `$${Math.round(totalPayroll).toLocaleString()}`,
        subtext: 'Total net salary payable',
        icon: PaymentsOutlinedIcon,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600'
      },
      {
        id: 'total-bonuses',
        title: 'Total Bonuses',
        value: `$${Math.round(totalBonuses).toLocaleString()}`,
        subtext: 'Total bonuses & allowances',
        icon: AttachMoneyOutlinedIcon,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600'
      },
      {
        id: 'total-deductions',
        title: 'Total Deductions',
        value: `$${Math.round(totalDeductions).toLocaleString()}`,
        subtext: 'Total deductions',
        icon: RemoveCircleOutlineOutlinedIcon,
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600'
      },
      {
        id: 'average-salary',
        title: 'Average Salary',
        value: `$${Math.round(averageSalary).toLocaleString()}`,
        subtext: 'Average net salary',
        icon: TrendingUpOutlinedIcon,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      {
        id: 'highest-net-salary',
        title: 'Highest Net Salary',
        value: `$${Math.round(highestNetSalary).toLocaleString()}`,
        subtext: highestSalaryEmployee ? `Highest paid: ${highestSalaryEmployee.name}` : 'No salary records',
        icon: WorkspacePremiumOutlinedIcon,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600'
      }
    ];
  }, [salaries]);

  return (
    <div className="assigned-form-surface p-0 -mx-1 sm:-mx-1.5 md:-mx-2 w-[calc(100%+8px)] sm:w-[calc(100%+12px)] md:w-[calc(100%+16px)] overflow-hidden flex flex-col gap-2">
      <SalarySummaryCards cards={payrollStats} />

      {/* 2. Main Employee Salary Card Container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 sm:p-2.5 mb-2">
        {/* Card Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          {/* Left: Card Title & Search Input */}
          <div className="flex items-center gap-3.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 shrink-0">
              Employee Salary
            </h2>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-3.5 pr-9 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#5d5fef] text-slate-700 placeholder-slate-400 transition-all bg-white"
              />
              <SearchIcon
                sx={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 18,
                  color: '#64748b'
                }}
              />
            </div>
          </div>

          {/* Right: Action Buttons matching Luxuria icons */}
          <div className="assigned-table-toolbar flex items-center gap-1.5 sm:gap-2 self-end md:self-auto">
            {/* Filter Button */}
            <Tooltip title="Filter by Department">
              <IconButton
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                size="small"
                sx={{
                  color: '#5d5fef',
                  backgroundColor: '#f5f5ff',
                  '&:hover': { backgroundColor: '#eceeff' },
                  borderRadius: '8px',
                  padding: '7px'
                }}
              >
                <FilterListIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Add Employee Salary Button */}
            <Tooltip title="Add Employee Salary">
              <IconButton
                onClick={handleOpenAddModal}
                size="small"
                sx={{
                  color: '#10b981',
                  backgroundColor: '#ecfdf5',
                  '&:hover': { backgroundColor: '#d1fae5' },
                  borderRadius: '8px',
                  padding: '7px'
                }}
              >
                <AddCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Refresh Button */}
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                size="small"
                sx={{
                  color: '#475569',
                  backgroundColor: '#f8fafc',
                  '&:hover': { backgroundColor: '#f1f5f9' },
                  borderRadius: '8px',
                  padding: '7px'
                }}
              >
                <RefreshIcon
                  sx={{
                    fontSize: 20,
                    transition: 'transform 0.4s ease',
                    transform: isRefreshing ? 'rotate(360deg)' : 'none'
                  }}
                />
              </IconButton>
            </Tooltip>

            {/* Column Toggle Button */}
            <Tooltip title="Show / Hide Columns">
              <IconButton
                onClick={(e) => setColumnAnchorEl(e.currentTarget)}
                size="small"
                sx={{
                  color: '#3b82f6',
                  backgroundColor: '#eff6ff',
                  '&:hover': { backgroundColor: '#dbeafe' },
                  borderRadius: '8px',
                  padding: '7px'
                }}
              >
                <TableChartOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Export PDF Button */}
            <Tooltip title="Export Full Report (PDF)">
              <IconButton
                className="toolbar-export-icon"
                onClick={handleExportPDF}
                size="small"
                sx={{
                  color: '#ef4444',
                  backgroundColor: '#fef2f2',
                  '&:hover': { backgroundColor: '#fee2e2' },
                  borderRadius: '8px',
                  padding: '7px'
                }}
              >
                <PictureAsPdfIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* 3. Data Table */}
        <div className="salary-table-wrapper mt-3 rounded-lg border border-slate-100">
          <table className="salary-table border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold select-none border-b border-slate-200/80">
                {/* Checkbox Column */}
                <th scope="col" className="salary-checkbox-cell py-3.5 text-center">
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={handleSelectAll}
                    sx={{
                      color: '#94a3b8',
                      '&.Mui-checked': { color: '#5d5fef' },
                      '&.MuiCheckbox-indeterminate': { color: '#5d5fef' },
                      padding: 0
                    }}
                  />
                </th>

                {/* Employee Name Column */}
                {visibleColumns.name && (
                  <th
                    scope="col"
                    onClick={() => handleSort('name')}
                    className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Employee Name</span>
                      {sortField === 'name' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">↕</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Email Column */}
                {visibleColumns.email && (
                  <th
                    scope="col"
                    onClick={() => handleSort('email')}
                    className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Email</span>
                      {sortField === 'email' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">↕</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Department Column */}
                {visibleColumns.department && (
                  <th
                    scope="col"
                    onClick={() => handleSort('department')}
                    className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Department</span>
                      {sortField === 'department' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">↕</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Salary Column */}
                {visibleColumns.salary && (
                  <th
                    scope="col"
                    onClick={() => handleSort('salary')}
                    className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Salary</span>
                      {sortField === 'salary' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">↕</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Bonus Column */}
                {visibleColumns.bonus && (
                  <th
                    scope="col"
                    onClick={() => handleSort('bonus')}
                    className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Bonus</span>
                      {sortField === 'bonus' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">↕</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Deductions Column */}
                {visibleColumns.deductions && (
                  <th
                    scope="col"
                    onClick={() => handleSort('deductions')}
                    className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Deductions</span>
                      {sortField === 'deductions' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">↕</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Net Salary Column */}
                {visibleColumns.netSalary && (
                  <th
                    scope="col"
                    onClick={() => handleSort('netSalary')}
                    className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Net Salary</span>
                      {sortField === 'netSalary' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">↕</span>
                      )}
                    </div>
                  </th>
                )}

                {/* Payslip Column */}
                {visibleColumns.payslip && (
                  <th scope="col" className="py-3.5 px-3 text-center">
                    Payslip
                  </th>
                )}

                {/* Actions Column */}
                {visibleColumns.actions && (
                  <th scope="col" className="py-3.5 px-3 text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs sm:text-sm">
              {paginatedSalaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-12 text-center text-slate-400 font-medium text-sm"
                  >
                    No employee salary records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedSalaries.map((row) => {
                  const isSelected = selectedIds.includes(row.id);
                  const netSalary = (row.salary || 0) + (row.bonus || 0) - (row.deductions || 0);

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="salary-checkbox-cell py-2.5 text-center">
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          sx={{
                            color: '#cbd5e1',
                            '&.Mui-checked': { color: '#5d5fef' },
                            padding: 0
                          }}
                        />
                      </td>

                      {/* Employee Name & Avatar */}
                      {visibleColumns.name && (
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          <div className="flex items-center gap-3">
                            <img
                              src={row.avatar}
                              alt={row.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-2xs shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  row.name
                                )}&background=5d5fef&color=fff`;
                              }}
                            />
                            <span className="truncate hover:text-[#5d5fef] transition-colors">
                              {row.name}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Email (with red email icon) */}
                      {visibleColumns.email && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <MailOutlineOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                            <span>{row.email}</span>
                          </div>
                        </td>
                      )}

                      {/* Department */}
                      {visibleColumns.department && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {row.department}
                        </td>
                      )}

                      {/* Basic Salary */}
                      {visibleColumns.salary && (
                        <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                          ${Number(row.salary).toLocaleString()}
                        </td>
                      )}

                      {/* Bonus */}
                      {visibleColumns.bonus && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          ${Number(row.bonus || 0).toLocaleString()}
                        </td>
                      )}

                      {/* Deductions */}
                      {visibleColumns.deductions && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          ${Number(row.deductions || 0).toLocaleString()}
                        </td>
                      )}

                      {/* Net Salary */}
                      {visibleColumns.netSalary && (
                        <td className="py-2.5 px-3 text-slate-800 font-semibold whitespace-nowrap">
                          ${netSalary.toLocaleString()}
                        </td>
                      )}

                      {/* Payslip Download Button */}
                      {visibleColumns.payslip && (
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <Tooltip title="Download Payslip (PDF)">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadPayslip(row)}
                              sx={{
                                color: '#1e293b',
                                '&:hover': { color: '#5d5fef', backgroundColor: '#f1f5f9' },
                                padding: '5px'
                              }}
                            >
                              <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </td>
                      )}

                      {/* Actions (Edit & Delete buttons) */}
                      {visibleColumns.actions && (
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Action */}
                            <Tooltip title="Edit Salary">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditModal(row)}
                                sx={{
                                  color: '#3b82f6',
                                  '&:hover': { backgroundColor: '#eff6ff' },
                                  padding: '5px'
                                }}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>

                            {/* Delete Action */}
                            <Tooltip title="Delete Record">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteDialog(row)}
                                sx={{
                                  color: '#f97316',
                                  '&:hover': { backgroundColor: '#fff7ed' },
                                  padding: '5px'
                                }}
                              >
                                <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination matching Luxuria bottom controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600 mt-2">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Items per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-[#5d5fef] bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Range text & Navigation arrows */}
          <div className="flex items-center gap-4">
            <span className="text-slate-600 font-medium">
              {filteredSalaries.length === 0
                ? '0 – 0 of 0'
                : `${page * rowsPerPage + 1} – ${Math.min(
                    (page + 1) * rowsPerPage,
                    filteredSalaries.length
                  )} of ${filteredSalaries.length}`}
            </span>

            <div className="flex items-center gap-1">
              <IconButton
                size="small"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                sx={{
                  color: '#64748b',
                  '&.Mui-disabled': { color: '#cbd5e1' },
                  padding: '4px'
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <IconButton
                size="small"
                disabled={(page + 1) * rowsPerPage >= filteredSalaries.length}
                onClick={() => setPage((p) => p + 1)}
                sx={{
                  color: '#64748b',
                  '&.Mui-disabled': { color: '#cbd5e1' },
                  padding: '4px'
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Popover: Filter by Department */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 2.5,
            width: 250,
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <h4 className="text-sm font-bold text-slate-800 mb-3">Filter Salary</h4>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-[#5d5fef] text-slate-700 bg-white"
            >
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setDepartmentFilter('All');
                setFilterAnchorEl(null);
              }}
              className="text-xs text-[#5d5fef] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </Popover>

      {/* Popover: Show / Hide Columns */}
      <Popover
        open={Boolean(columnAnchorEl)}
        anchorEl={columnAnchorEl}
        onClose={() => setColumnAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 2,
            width: 210,
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <h4 className="text-sm font-bold text-slate-800 mb-2">Toggle Columns</h4>
        <div className="flex flex-col space-y-1">
          {Object.keys(visibleColumns).map((colKey) => (
            <FormControlLabel
              key={colKey}
              control={
                <Checkbox
                  size="small"
                  checked={visibleColumns[colKey]}
                  onChange={(e) =>
                    setVisibleColumns({
                      ...visibleColumns,
                      [colKey]: e.target.checked
                    })
                  }
                  sx={{
                    color: '#cbd5e1',
                    '&.Mui-checked': { color: '#5d5fef' },
                    padding: '3px'
                  }}
                />
              }
              label={
                <span className="text-xs text-slate-700 font-medium capitalize">
                  {colKey.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              }
            />
          ))}
        </div>
      </Popover>

      {/* Dialog: Add New Employee Salary matching Luxuria modal design */}
      <Dialog
        className="assigned-form-surface"
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        {/* Purple/Indigo Gradient Header with circular close button */}
        <div className="assigned-modal-header px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <PaymentsOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">New Employee Salary</h3>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsAddModalOpen(false)}
            className="assigned-modal-close"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <form onSubmit={handleSaveNewSalary} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name* */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  placeholder="Employee Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Employee ID* */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Employee ID"
                  placeholder="e.g. EMP-101"
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <TagOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Email* */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  placeholder="test@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <MailOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Department* */}
              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departmentsList
                    .filter((d) => d !== 'All')
                    .map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                </TextField>
              </div>

              {/* Role* */}
              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  {rolesList.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* Salary* */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Salary"
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PaymentsOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Bonus */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Bonus"
                  type="number"
                  placeholder="e.g. 200"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <AttachMoneyOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Deductions */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Deductions"
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <RemoveCircleOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-5">
              <button
                type="submit"
                className="assigned-primary-button px-6 py-2 rounded-full font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="assigned-secondary-button px-6 py-2 rounded-full font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Employee Salary */}
      <Dialog
        className="assigned-form-surface"
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <div className="assigned-modal-header px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <PaymentsOutlinedIcon sx={{ fontSize: 18, color: 'var(--primary-main)' }} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">Edit Employee Salary</h3>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsEditModalOpen(false)}
            className="assigned-modal-close"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <form onSubmit={handleSaveEditSalary} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name* */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Employee ID* */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Employee ID"
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <TagOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Email* */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <MailOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Department* */}
              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departmentsList
                    .filter((d) => d !== 'All')
                    .map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                </TextField>
              </div>

              {/* Role* */}
              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  {rolesList.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* Salary* */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PaymentsOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Bonus */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Bonus"
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <AttachMoneyOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>

              {/* Deductions */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Deductions"
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <RemoveCircleOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <button
                type="submit"
                className="assigned-primary-button px-6 py-2 rounded-full font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="assigned-secondary-button px-6 py-2 rounded-full font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete Confirmation */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 2,
            textAlign: 'center'
          }
        }}
      >
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
          <WarningAmberOutlinedIcon sx={{ fontSize: 28 }} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Delete Salary Record?</h3>
        <p className="text-xs text-slate-500 mb-5">
          Are you sure you want to delete salary record for{' '}
          <strong className="text-slate-700">{selectedRecord?.name}</strong>? This action cannot be
          undone.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsDeleteDialogOpen(false)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Dialog>

      {/* Global Snackbar Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
if (false) {
 // Main Data State
 const [salaries, setSalaries] = useState(initialSalaryList);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedIds, setSelectedIds] = useState([]);
 const [isRefreshing, setIsRefreshing] = useState(false);

 // Sorting State
 const [sortField, setSortField] = useState('name');
 const [sortOrder, setSortOrder] = useState('asc'); //'asc' |'desc'

 // Pagination State
 const [page, setPage] = useState(0);
 const [rowsPerPage, setRowsPerPage] = useState(10);

 // Filter Popover State
 const [filterAnchorEl, setFilterAnchorEl] = useState(null);
 const [columnAnchorEl, setColumnAnchorEl] = useState(null);
 const [departmentFilter, setDepartmentFilter] = useState('All');

 // Column Visibility State
 const [visibleColumns, setVisibleColumns] = useState({
 name: true,
 email: true,
 department: true,
 salary: true,
 bonus: true,
 deductions: true,
 netSalary: true,
 payslip: true,
 actions: true
 });

 // Modal Dialogs State
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [selectedRecord, setSelectedRecord] = useState(null);

 // Form State for Add / Edit
 const [formData, setFormData] = useState({
 name:'',
 empId:'',
 email:'',
 department:'Front Office',
 role:'Manager',
 salary:'',
 bonus:'',
 deductions:'',
 avatar:''
 });

 // Notification Toast State
 const [toast, setToast] = useState({ open: false, message:'', severity:'success' });

 // Sorting Handler
 const handleSort = (field) => {
 if (sortField === field) {
 setSortOrder(sortOrder ==='asc' ?'desc' :'asc');
 } else {
 setSortField(field);
 setSortOrder('asc');
 }
 };

 // Filter & Search Logic
 const filteredSalaries = useMemo(() => {
 return salaries.filter((item) => {
 const net = (item.salary || 0) + (item.bonus || 0) - (item.deductions || 0);
 const matchesSearch =
 item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
 String(net).includes(searchQuery);

 const matchesDept = departmentFilter ==='All' || item.department === departmentFilter;

 return matchesSearch && matchesDept;
 });
 }, [salaries, searchQuery, departmentFilter]);

 // Sorted Records
 const sortedSalaries = useMemo(() => {
 const list = [...filteredSalaries];
 if (!sortField) return list;

 return list.sort((a, b) => {
 let aVal = a[sortField];
 let bVal = b[sortField];

 if (sortField ==='netSalary') {
 aVal = (a.salary || 0) + (a.bonus || 0) - (a.deductions || 0);
 bVal = (b.salary || 0) + (b.bonus || 0) - (b.deductions || 0);
 }

 if (typeof aVal ==='string') aVal = aVal.toLowerCase();
 if (typeof bVal ==='string') bVal = bVal.toLowerCase();

 if (aVal < bVal) return sortOrder ==='asc' ? -1 : 1;
 if (aVal > bVal) return sortOrder ==='asc' ? 1 : -1;
 return 0;
 });
 }, [filteredSalaries, sortField, sortOrder]);

 // Paginated Records
 const paginatedSalaries = useMemo(() => {
 const start = page * rowsPerPage;
 return sortedSalaries.slice(start, start + rowsPerPage);
 }, [sortedSalaries, page, rowsPerPage]);

 // Selection Logic
 const handleSelectAll = (e) => {
 if (e.target.checked) {
 const allPageIds = paginatedSalaries.map((r) => r.id);
 setSelectedIds(Array.from(new Set([...selectedIds, ...allPageIds])));
 } else {
 const pageIdSet = new Set(paginatedSalaries.map((r) => r.id));
 setSelectedIds(selectedIds.filter((id) => !pageIdSet.has(id)));
 }
 };

 const handleSelectRow = (id) => {
 if (selectedIds.includes(id)) {
 setSelectedIds(selectedIds.filter((item) => item !== id));
 } else {
 setSelectedIds([...selectedIds, id]);
 }
 };

 const isAllSelected =
 paginatedSalaries.length > 0 && paginatedSalaries.every((r) => selectedIds.includes(r.id));
 const isSomeSelected =
 paginatedSalaries.some((r) => selectedIds.includes(r.id)) && !isAllSelected;

 // Refresh Action
 const handleRefresh = () => {
 setIsRefreshing(true);
 setTimeout(() => {
 setSalaries(initialSalaryList);
 setIsRefreshing(false);
 setToast({
 open: true,
 message:'Employee salary records refreshed successfully!',
 severity:'success'
 });
 }, 400);
 };

 // Full Table PDF Export Action
 const handleExportPDF = () => {
 const doc = new jsPDF();
 doc.setFontSize(16);
 doc.setTextColor(30, 41, 59);
 doc.text('Employee Salary Report', 14, 18);

 doc.setFontSize(10);
 doc.setTextColor(100, 116, 139);
 doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
 14,
 25
 );

 const tableData = sortedSalaries.map((item) => [
 item.name,
 item.email,
 item.department,`$${Number(item.salary).toLocaleString()}`,`$${Number(item.bonus || 0).toLocaleString()}`,`$${Number(item.deductions || 0).toLocaleString()}`,`$${((item.salary || 0) + (item.bonus || 0) - (item.deductions || 0)).toLocaleString()}`
 ]);

 autoTable(doc, {
 startY: 30,
 head: [['Employee Name','Email','Department','Salary','Bonus','Deductions','Net Salary']],
 body: tableData,
 theme:'grid',
 headStyles: {
 fillColor: [93, 95, 239],
 textColor: [255, 255, 255],
 fontStyle:'bold'
 },
 styles: {
 fontSize: 9,
 cellPadding: 3
 }
 });

 doc.save(`Employee_Salary_Report_${new Date().toISOString().split('T')[0]}.pdf`);
 setToast({
 open: true,
 message:'Full salary report exported to PDF!',
 severity:'success'
 });
 };

 // Individual Payslip PDF Download Action
 const handleDownloadPayslip = (row) => {
 const doc = new jsPDF();
 const net = (row.salary || 0) + (row.bonus || 0) - (row.deductions || 0);

 // Header Band
 doc.setFillColor(93, 95, 239);
 doc.rect(0, 0, 210, 35,'F');

 doc.setFontSize(20);
 doc.setTextColor(255, 255, 255);
 doc.setFont('helvetica','bold');
 doc.text('LUXURIA HOTEL & SUITES', 14, 18);

 doc.setFontSize(11);
 doc.setFont('helvetica','normal');
 doc.text('PAYSLIP / SALARY STATEMENT', 14, 27);

 // Employee Details Box
 doc.setTextColor(30, 41, 59);
 doc.setFontSize(10);
 doc.setFont('helvetica','bold');
 doc.text('Employee Information:', 14, 48);

 doc.setFont('helvetica','normal');
 doc.text(`Name: ${row.name}`, 14, 56);
 doc.text(`Employee ID: ${row.empId}`, 14, 63);
 doc.text(`Department: ${row.department}`, 14, 70);
 doc.text(`Role: ${row.role ||'Staff'}`, 14, 77);

 doc.text(`Email: ${row.email}`, 120, 56);
 doc.text(`Payment Period: ${new Date().toLocaleString('default', { month:'long', year:'numeric' })}`, 120, 63);
 doc.text(`Status: ${row.paymentStatus ||'Paid'}`, 120, 70);

 // Breakdown Table
 autoTable(doc, {
 startY: 88,
 head: [['Earnings / Breakdown','Amount (USD)']],
 body: [
 ['Basic Salary',`$${Number(row.salary).toLocaleString()}`],
 ['Bonus & Allowances',`+$${Number(row.bonus || 0).toLocaleString()}`],
 ['Deductions & Taxes',`-$${Number(row.deductions || 0).toLocaleString()}`],
 ['NET SALARY PAYABLE',`$${net.toLocaleString()}`]
 ],
 theme:'striped',
 headStyles: {
 fillColor: [93, 95, 239],
 textColor: [255, 255, 255],
 fontStyle:'bold'
 },
 styles: {
 fontSize: 10,
 cellPadding: 4
 }
 });

 // Signature Area
 const finalY = doc.lastAutoTable.finalY + 30;
 doc.setFontSize(9);
 doc.text('_________________________', 14, finalY);
 doc.text('Employer Signature', 14, finalY + 7);

 doc.text('_________________________', 130, finalY);
 doc.text('Employee Signature', 130, finalY + 7);

 doc.save(`Payslip_${row.name.replace(/\s+/g,'_')}_${row.empId}.pdf`);
 setToast({
 open: true,
 message:`Payslip downloaded for ${row.name}!`,
 severity:'success'
 });
 };

 // Open Add Modal
 const handleOpenAddModal = () => {
 setFormData({
 name:'',
 empId:`EMP-${Math.floor(100 + Math.random() * 900)}`,
 email:'',
 department:'Front Office',
 role:'Manager',
 salary:'',
 bonus:'',
 deductions:'',
 avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
 });
 setIsAddModalOpen(true);
 };

 // Save New Employee Salary
 const handleSaveNewSalary = (e) => {
 e.preventDefault();
 if (!formData.name.trim() || !formData.salary) return;

 const newRecord = {
 id: Date.now(),
 empId: formData.empId ||`EMP-${Math.floor(100 + Math.random() * 900)}`,
 name: formData.name,
 avatar:
 formData.avatar ||`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=5d5fef&color=fff`,
 email: formData.email ||'test@email.com',
 department: formData.department,
 role: formData.role,
 salary: Number(formData.salary) || 0,
 bonus: Number(formData.bonus) || 0,
 deductions: Number(formData.deductions) || 0,
 paymentStatus:'Paid'
 };

 setSalaries([newRecord, ...salaries]);
 setIsAddModalOpen(false);
 setToast({
 open: true,
 message:`Salary record added for ${formData.name}!`,
 severity:'success'
 });
 };

 // Open Edit Modal
 const handleOpenEditModal = (record) => {
 setSelectedRecord(record);
 setFormData({
 name: record.name,
 empId: record.empId,
 email: record.email,
 department: record.department,
 role: record.role ||'Staff',
 salary: record.salary,
 bonus: record.bonus || 0,
 deductions: record.deductions || 0,
 avatar: record.avatar
 });
 setIsEditModalOpen(true);
 };

 // Save Edit Salary
 const handleSaveEditSalary = (e) => {
 e.preventDefault();
 if (!selectedRecord) return;

 setSalaries(
 salaries.map((item) =>
 item.id === selectedRecord.id
 ? {
 ...item,
 name: formData.name,
 empId: formData.empId,
 email: formData.email,
 department: formData.department,
 role: formData.role,
 salary: Number(formData.salary) || 0,
 bonus: Number(formData.bonus) || 0,
 deductions: Number(formData.deductions) || 0
 }
 : item
 )
 );

 setIsEditModalOpen(false);
 setToast({
 open: true,
 message:`Salary record updated for ${formData.name}!`,
 severity:'success'
 });
 };

 // Open Delete Dialog
 const handleOpenDeleteDialog = (record) => {
 setSelectedRecord(record);
 setIsDeleteDialogOpen(true);
 };

 // Confirm Delete
 const handleConfirmDelete = () => {
 if (!selectedRecord) return;
 setSalaries(salaries.filter((item) => item.id !== selectedRecord.id));
 setSelectedIds(selectedIds.filter((id) => id !== selectedRecord.id));
 setIsDeleteDialogOpen(false);
 setToast({
 open: true,
 message:`Salary record for ${selectedRecord.name} deleted!`,
 severity:'success'
 });
 };

 // Dynamic 6-card Payroll Summary Metrics (calculated from overall salaries state)
 const payrollStats = useMemo(() => {
 const list = Array.isArray(salaries) ? salaries : [];
 const totalEmployees = list.length;

 let totalPayroll = 0;
 let totalBonuses = 0;
 let totalDeductions = 0;
 let highestNetSalary = 0;
 let highestSalaryEmployee = null;

 list.forEach((item) => {
 const sal = Number(item.salary) || 0;
 const bon = Number(item.bonus) || 0;
 const ded = Number(item.deductions) || 0;
 const net = sal + bon - ded;

 totalPayroll += net;
 totalBonuses += bon;
 totalDeductions += ded;

 if (net > highestNetSalary || highestSalaryEmployee === null) {
 highestNetSalary = net;
 highestSalaryEmployee = item;
 }
 });

 const averageSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

 return [
 {
 id:'total-employees',
 title:'Total Employees',
 value: totalEmployees,
 subtext:'Employees with salary records',
 icon: PeopleOutlinedIcon,
 iconBg:'bg-[var(--primary-main)]/10',
 iconColor:'text-[var(--primary-main)]'
 },
 {
 id:'total-payroll',
 title:'Total Payroll',
 value:`$${Math.round(totalPayroll).toLocaleString()}`,
 subtext:'Total net salary payable',
 icon: PaymentsOutlinedIcon,
 iconBg:'bg-emerald-50',
 iconColor:'text-emerald-600'
 },
 {
 id:'total-bonuses',
 title:'Total Bonuses',
 value:`$${Math.round(totalBonuses).toLocaleString()}`,
 subtext:'Total bonuses & allowances',
 icon: AttachMoneyOutlinedIcon,
 iconBg:'bg-amber-50',
 iconColor:'text-amber-600'
 },
 {
 id:'total-deductions',
 title:'Total Deductions',
 value:`$${Math.round(totalDeductions).toLocaleString()}`,
 subtext:'Total deductions',
 icon: RemoveCircleOutlineOutlinedIcon,
 iconBg:'bg-rose-50',
 iconColor:'text-rose-600'
 },
 {
 id:'average-salary',
 title:'Average Salary',
 value:`$${Math.round(averageSalary).toLocaleString()}`,
 subtext:'Average net salary',
 icon: TrendingUpOutlinedIcon,
 iconBg:'bg-blue-50',
 iconColor:'text-blue-600'
 },
 {
 id:'highest-net-salary',
 title:'Highest Net Salary',
 value:`$${Math.round(highestNetSalary).toLocaleString()}`,
 subtext: highestSalaryEmployee ?`Highest paid: ${highestSalaryEmployee.name}` :'No salary records',
 icon: WorkspacePremiumOutlinedIcon,
 iconBg:'bg-indigo-50',
 iconColor:'text-indigo-600'
 }
 ];
 }, [salaries]);

 return (
 <div className="p-0 -mx-1 sm:-mx-1.5 md:-mx-2 w-[calc(100%+8px)] sm:w-[calc(100%+12px)] md:w-[calc(100%+16px)] overflow-hidden flex flex-col gap-2">
 {/* ── 6 Payroll Summary Cards ─────────────────────────────── */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
 {payrollStats.map((card) => {
 const IconComp = card.icon;
 return (
 <div
 key={card.id}
 className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-3 py-2 flex flex-col justify-between hover:border-[var(--primary-main)]/30 transition-colors"
 >
 <div className="flex items-center gap-1.5 min-w-0">
 <div className={`p-1 rounded-md ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
 <IconComp sx={{ fontSize: 15 }} />
 </div>
 <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider truncate">
 {card.title}
 </span>
 </div>
 <div className="flex items-baseline justify-between mt-1">
 <span className="text-xl font-bold text-[var(--text-primary)] leading-none">
 {card.value}
 </span>
 </div>
 {card.subtext && (
 <span className="text-[10px] text-[var(--text-secondary)] font-normal truncate mt-0.5 block" title={card.subtext}>
 {card.subtext}
 </span>
 )}
 </div>
 );
 })}
 </div>

 {/* 2. Main Employee Salary Card Container */}
 <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 sm:p-2.5 mb-2">
 {/* Card Toolbar */}
 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-2 border-b border-slate-100">
 {/* Left: Card Title & Search Input */}
 <div className="flex items-center gap-3.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
 <h2 className="text-base sm:text-lg font-bold text-slate-800 shrink-0">
 Employee Salary
 </h2>

 <div className="relative w-full sm:w-64">
 <input
 type="text"
 placeholder="Search..."
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setPage(0);
 }}
 className="w-full pl-3.5 pr-9 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#5d5fef] text-slate-700 placeholder-slate-400 transition-all bg-white"
 />
 <SearchIcon
 sx={{
 position:'absolute',
 right: 10,
 top:'50%',
 transform:'translateY(-50%)',
 fontSize: 18,
 color:'#64748b'
 }}
 />
 </div>
 </div>

 {/* Right: Action Buttons matching Luxuria icons */}
 <div className="assigned-table-toolbar flex items-center gap-1.5 sm:gap-2 self-end md:self-auto">
 {/* Filter Button */}
 <Tooltip title="Filter by Department">
 <IconButton
 onClick={(e) => setFilterAnchorEl(e.currentTarget)}
 size="small"
 sx={{
 color:'#5d5fef',
 backgroundColor:'#f5f5ff','&:hover': { backgroundColor:'#eceeff' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <FilterListIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </Tooltip>

 {/* Add Employee Salary Button */}
 <Tooltip title="Add Employee Salary">
 <IconButton
 onClick={handleOpenAddModal}
 size="small"
 sx={{
 color:'#10b981',
 backgroundColor:'#ecfdf5','&:hover': { backgroundColor:'#d1fae5' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <AddCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </Tooltip>

 {/* Refresh Button */}
 <Tooltip title="Refresh Data">
 <IconButton
 onClick={handleRefresh}
 size="small"
 sx={{
 color:'#475569',
 backgroundColor:'#f8fafc','&:hover': { backgroundColor:'#f1f5f9' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <RefreshIcon
 sx={{
 fontSize: 20,
 transition:'transform 0.4s ease',
 transform: isRefreshing ?'rotate(360deg)' :'none'
 }}
 />
 </IconButton>
 </Tooltip>

 {/* Column Toggle Button */}
 <Tooltip title="Show / Hide Columns">
 <IconButton
 onClick={(e) => setColumnAnchorEl(e.currentTarget)}
 size="small"
 sx={{
 color:'#3b82f6',
 backgroundColor:'#eff6ff','&:hover': { backgroundColor:'#dbeafe' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <TableChartOutlinedIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </Tooltip>

 {/* Export PDF Button */}
 <Tooltip title="Export Full Report (PDF)">
 <IconButton
 onClick={handleExportPDF}
 size="small"
 sx={{
 color:'#ef4444',
 backgroundColor:'#fef2f2','&:hover': { backgroundColor:'#fee2e2' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <PictureAsPdfIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </Tooltip>
 </div>
 </div>

 {/* 3. Data Table */}
 <div className="mt-3 rounded-lg border border-slate-100">
 <table className="w-full border-collapse text-left min-w-[1050px]">
 <thead>
 <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold select-none border-b border-slate-200/80">
 {/* Checkbox Column */}
 <th scope="col" className="py-3.5 px-3 w-12 text-center">
 <Checkbox
 size="small"
 checked={isAllSelected}
 indeterminate={isSomeSelected}
 onChange={handleSelectAll}
 sx={{
 color:'#94a3b8','&.Mui-checked': { color:'#5d5fef' },'&.MuiCheckbox-indeterminate': { color:'#5d5fef' },
 padding: 0
 }}
 />
 </th>

 {/* Employee Name Column */}
 {visibleColumns.name && (
 <th
 scope="col"
 onClick={() => handleSort('name')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Employee Name</span>
 {sortField ==='name' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Email Column */}
 {visibleColumns.email && (
 <th
 scope="col"
 onClick={() => handleSort('email')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Email</span>
 {sortField ==='email' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Department Column */}
 {visibleColumns.department && (
 <th
 scope="col"
 onClick={() => handleSort('department')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Department</span>
 {sortField ==='department' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Salary Column */}
 {visibleColumns.salary && (
 <th
 scope="col"
 onClick={() => handleSort('salary')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Salary</span>
 {sortField ==='salary' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Bonus Column */}
 {visibleColumns.bonus && (
 <th
 scope="col"
 onClick={() => handleSort('bonus')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Bonus</span>
 {sortField ==='bonus' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Deductions Column */}
 {visibleColumns.deductions && (
 <th
 scope="col"
 onClick={() => handleSort('deductions')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Deductions</span>
 {sortField ==='deductions' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Net Salary Column */}
 {visibleColumns.netSalary && (
 <th
 scope="col"
 onClick={() => handleSort('netSalary')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Net Salary</span>
 {sortField ==='netSalary' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Payslip Column */}
 {visibleColumns.payslip && (
 <th scope="col" className="py-3.5 px-3 text-center">
 Payslip
 </th>
 )}

 {/* Actions Column */}
 {visibleColumns.actions && (
 <th scope="col" className="py-3.5 px-3 text-right">
 Actions
 </th>
 )}
 </tr>
 </thead>

 <tbody className="divide-y divide-slate-100 text-slate-700 text-xs sm:text-sm">
 {paginatedSalaries.length === 0 ? (
 <tr>
 <td
 colSpan={10}
 className="py-12 text-center text-slate-400 font-medium text-sm"
 >
 No employee salary records found matching your filters.
 </td>
 </tr>
 ) : (
 paginatedSalaries.map((row) => {
 const isSelected = selectedIds.includes(row.id);
 const netSalary = (row.salary || 0) + (row.bonus || 0) - (row.deductions || 0);

 return (
 <tr
 key={row.id}
 className={`hover:bg-slate-50/80 transition-colors ${
 isSelected ?'bg-indigo-50/40' :''
 }`}
 >
 {/* Checkbox */}
 <td className="py-2.5 px-3 text-center">
 <Checkbox
 size="small"
 checked={isSelected}
 onChange={() => handleSelectRow(row.id)}
 sx={{
 color:'#cbd5e1','&.Mui-checked': { color:'#5d5fef' },
 padding: 0
 }}
 />
 </td>

 {/* Employee Name & Avatar */}
 {visibleColumns.name && (
 <td className="py-2.5 px-3 font-medium text-slate-800">
 <div className="flex items-center gap-3">
 <img
 src={row.avatar}
 alt={row.name}
 className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-2xs shrink-0"
 onError={(e) => {
 e.target.onerror = null;
 e.target.src =`https://ui-avatars.com/api/?name=${encodeURIComponent(
 row.name
 )}&background=5d5fef&color=fff`;
 }}
 />
 <span className="truncate hover:text-[#5d5fef] transition-colors">
 {row.name}
 </span>
 </div>
 </td>
 )}

 {/* Email (with red email icon) */}
 {visibleColumns.email && (
 <td className="py-2.5 px-3 text-slate-600">
 <div className="flex items-center gap-1.5">
 <MailOutlineOutlinedIcon sx={{ fontSize: 16, color:'#ef4444' }} />
 <span>{row.email}</span>
 </div>
 </td>
 )}

 {/* Department */}
 {visibleColumns.department && (
 <td className="py-2.5 px-3 text-slate-600">
 {row.department}
 </td>
 )}

 {/* Basic Salary */}
 {visibleColumns.salary && (
 <td className="py-2.5 px-3 text-slate-700 font-medium">
 ${Number(row.salary).toLocaleString()}
 </td>
 )}

 {/* Bonus */}
 {visibleColumns.bonus && (
 <td className="py-2.5 px-3 text-slate-600">
 ${Number(row.bonus || 0).toLocaleString()}
 </td>
 )}

 {/* Deductions */}
 {visibleColumns.deductions && (
 <td className="py-2.5 px-3 text-slate-600">
 ${Number(row.deductions || 0).toLocaleString()}
 </td>
 )}

 {/* Net Salary */}
 {visibleColumns.netSalary && (
 <td className="py-2.5 px-3 text-slate-800 font-semibold">
 ${netSalary.toLocaleString()}
 </td>
 )}

 {/* Payslip Download Button */}
 {visibleColumns.payslip && (
 <td className="py-2.5 px-3 text-center">
 <Tooltip title="Download Payslip (PDF)">
 <IconButton
 size="small"
 onClick={() => handleDownloadPayslip(row)}
 sx={{
 color:'#1e293b','&:hover': { color:'#5d5fef', backgroundColor:'#f1f5f9' },
 padding:'5px'
 }}
 >
 <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </Tooltip>
 </td>
 )}

 {/* Actions (Edit & Delete buttons) */}
 {visibleColumns.actions && (
 <td className="py-2.5 px-3 text-right">
 <div className="flex items-center justify-end gap-1">
 {/* Edit Action */}
 <Tooltip title="Edit Salary">
 <IconButton
 size="small"
 onClick={() => handleOpenEditModal(row)}
 sx={{
 color:'#3b82f6','&:hover': { backgroundColor:'#eff6ff' },
 padding:'5px'
 }}
 >
 <EditOutlinedIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </Tooltip>

 {/* Delete Action */}
 <Tooltip title="Delete Record">
 <IconButton
 size="small"
 onClick={() => handleOpenDeleteDialog(row)}
 sx={{
 color:'#f97316','&:hover': { backgroundColor:'#fff7ed' },
 padding:'5px'
 }}
 >
 <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </Tooltip>
 </div>
 </td>
 )}
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 {/* 4. Pagination matching Luxuria bottom controls */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600 mt-2">
 {/* Items per page selector */}
 <div className="flex items-center gap-2">
 <span className="text-slate-500">Items per page:</span>
 <select
 value={rowsPerPage}
 onChange={(e) => {
 setRowsPerPage(Number(e.target.value));
 setPage(0);
 }}
 className="px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-[#5d5fef] bg-white text-slate-700 cursor-pointer font-medium"
 >
 <option value={5}>5</option>
 <option value={10}>10</option>
 <option value={25}>25</option>
 <option value={50}>50</option>
 </select>
 </div>

 {/* Range text & Navigation arrows */}
 <div className="flex items-center gap-4">
 <span className="text-slate-600 font-medium">
 {filteredSalaries.length === 0
 ?'0 – 0 of 0'
 :`${page * rowsPerPage + 1} – ${Math.min(
 (page + 1) * rowsPerPage,
 filteredSalaries.length
 )} of ${filteredSalaries.length}`}
 </span>

 <div className="flex items-center gap-1">
 <IconButton
 size="small"
 disabled={page === 0}
 onClick={() => setPage((p) => Math.max(0, p - 1))}
 sx={{
 color:'#64748b','&.Mui-disabled': { color:'#cbd5e1' },
 padding:'4px'
 }}
 >
 <ChevronLeftIcon sx={{ fontSize: 20 }} />
 </IconButton>

 <IconButton
 size="small"
 disabled={(page + 1) * rowsPerPage >= filteredSalaries.length}
 onClick={() => setPage((p) => p + 1)}
 sx={{
 color:'#64748b','&.Mui-disabled': { color:'#cbd5e1' },
 padding:'4px'
 }}
 >
 <ChevronRightIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </div>
 </div>
 </div>
 </div>

 {/* 5. Footer Copyright Note */}
 <div className="text-center text-xs text-slate-400 py-3">
 Copyright © 2026 Design By <span className="text-[#5d5fef] font-medium">Luxuria</span>
 </div>

 {/* Popover: Filter by Department */}
 <Popover
 open={Boolean(filterAnchorEl)}
 anchorEl={filterAnchorEl}
 onClose={() => setFilterAnchorEl(null)}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 transformOrigin={{ vertical:'top', horizontal:'right' }}
 PaperProps={{
 sx: {
 p: 2.5,
 width: 250,
 borderRadius:'12px',
 boxShadow:'0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
 }
 }}
 >
 <h4 className="text-sm font-bold text-slate-800 mb-3">Filter Salary</h4>
 <div className="space-y-3 text-xs">
 <div>
 <label className="block text-slate-500 font-medium mb-1">Department</label>
 <select
 value={departmentFilter}
 onChange={(e) => {
 setDepartmentFilter(e.target.value);
 setPage(0);
 }}
 className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-[#5d5fef] text-slate-700 bg-white"
 >
 {departmentsList.map((dept) => (
 <option key={dept} value={dept}>
 {dept ==='All' ?'All Departments' : dept}
 </option>
 ))}
 </select>
 </div>

 <div className="pt-2 flex justify-end">
 <button
 onClick={() => {
 setDepartmentFilter('All');
 setFilterAnchorEl(null);
 }}
 className="text-xs text-[#5d5fef] hover:underline font-semibold"
 >
 Reset Filters
 </button>
 </div>
 </div>
 </Popover>

 {/* Popover: Show / Hide Columns */}
 <Popover
 open={Boolean(columnAnchorEl)}
 anchorEl={columnAnchorEl}
 onClose={() => setColumnAnchorEl(null)}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 transformOrigin={{ vertical:'top', horizontal:'right' }}
 PaperProps={{
 sx: {
 p: 2,
 width: 210,
 borderRadius:'12px',
 boxShadow:'0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
 }
 }}
 >
 <h4 className="text-sm font-bold text-slate-800 mb-2">Toggle Columns</h4>
 <div className="flex flex-col space-y-1">
 {Object.keys(visibleColumns).map((colKey) => (
 <FormControlLabel
 key={colKey}
 control={
 <Checkbox
 size="small"
 checked={visibleColumns[colKey]}
 onChange={(e) =>
 setVisibleColumns({
 ...visibleColumns,
 [colKey]: e.target.checked
 })
 }
 sx={{
 color:'#cbd5e1','&.Mui-checked': { color:'#5d5fef' },
 padding:'3px'
 }}
 />
 }
 label={
 <span className="text-xs text-slate-700 font-medium capitalize">
 {colKey.replace(/([A-Z])/g,' $1').trim()}
 </span>
 }
 />
 ))}
 </div>
 </Popover>

 {/* Dialog: Add New Employee Salary matching Luxuria modal design */}
 <Dialog
 className="assigned-form-surface"
 open={isAddModalOpen}
 onClose={() => setIsAddModalOpen(false)}
 maxWidth="md"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 overflow:'hidden'
 }
 }}
 >
 {/* Purple/Indigo Gradient Header with circular close button */}
 <div className="bg-[#5d5fef] text-white px-5 py-4 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
 <PaymentsOutlinedIcon sx={{ fontSize: 18, color:'#fff' }} />
 </div>
 <h3 className="text-lg font-bold tracking-tight text-white">New Employee Salary</h3>
 </div>
 <IconButton
 size="small"
 onClick={() => setIsAddModalOpen(false)}
 sx={{
 color:'#fff',
 backgroundColor:'rgba(255, 255, 255, 0.15)','&:hover': { backgroundColor:'rgba(255, 255, 255, 0.25)' }
 }}
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </div>

 <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
 <form onSubmit={handleSaveNewSalary} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Name* */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Name"
 placeholder="Employee Name"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 required
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <PersonOutlineOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Employee ID* */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Employee ID"
 placeholder="e.g. EMP-101"
 value={formData.empId}
 onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
 required
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <TagOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Email* */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Email"
 type="email"
 placeholder="test@email.com"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 required
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <MailOutlineOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Department* */}
 <div>
 <TextField
 select
 fullWidth
 size="small"
 label="Department"
 value={formData.department}
 onChange={(e) => setFormData({ ...formData, department: e.target.value })}
 required
 >
 {departmentsList
 .filter((d) => d !=='All')
 .map((dept) => (
 <MenuItem key={dept} value={dept}>
 {dept}
 </MenuItem>
 ))}
 </TextField>
 </div>

 {/* Role* */}
 <div>
 <TextField
 select
 fullWidth
 size="small"
 label="Role"
 value={formData.role}
 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
 required
 >
 {rolesList.map((r) => (
 <MenuItem key={r} value={r}>
 {r}
 </MenuItem>
 ))}
 </TextField>
 </div>

 {/* Salary* */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Salary"
 type="number"
 placeholder="e.g. 5000"
 value={formData.salary}
 onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
 required
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <PaymentsOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Bonus */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Bonus"
 type="number"
 placeholder="e.g. 200"
 value={formData.bonus}
 onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <AttachMoneyOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Deductions */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Deductions"
 type="number"
 placeholder="e.g. 100"
 value={formData.deductions}
 onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <RemoveCircleOutlineOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>
 </div>

 {/* Modal Actions */}
 <div className="flex items-center gap-3 pt-5">
 <button
 type="submit"
                className="assigned-primary-button px-6 py-2 rounded-full font-medium text-sm shadow-sm transition-colors cursor-pointer"
 >
 Save
 </button>
 <button
 type="button"
 onClick={() => setIsAddModalOpen(false)}
                className="assigned-secondary-button px-6 py-2 rounded-full font-medium text-sm shadow-sm transition-colors cursor-pointer"
 >
 Cancel
 </button>
 </div>
 </form>
 </DialogContent>
 </Dialog>

 {/* Dialog: Edit Employee Salary */}
 <Dialog
        className="assigned-form-surface"
 open={isEditModalOpen}
 onClose={() => setIsEditModalOpen(false)}
 maxWidth="md"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 overflow:'hidden'
 }
 }}
 >
  <div className="assigned-modal-header px-5 py-4 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
 <PaymentsOutlinedIcon sx={{ fontSize: 18, color:'#fff' }} />
 </div>
 <h3 className="text-lg font-bold tracking-tight text-white">Edit Employee Salary</h3>
 </div>
 <IconButton
 size="small"
 onClick={() => setIsEditModalOpen(false)}
 sx={{
 color:'#fff',
 backgroundColor:'rgba(255, 255, 255, 0.15)','&:hover': { backgroundColor:'rgba(255, 255, 255, 0.25)' }
 }}
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </div>

 <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
 <form onSubmit={handleSaveEditSalary} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Name* */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Name"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 required
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <PersonOutlineOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Employee ID* */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Employee ID"
 value={formData.empId}
 onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
 required
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <TagOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Email* */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Email"
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 required
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <MailOutlineOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Department* */}
 <div>
 <TextField
 select
 fullWidth
 size="small"
 label="Department"
 value={formData.department}
 onChange={(e) => setFormData({ ...formData, department: e.target.value })}
 required
 >
 {departmentsList
 .filter((d) => d !=='All')
 .map((dept) => (
 <MenuItem key={dept} value={dept}>
 {dept}
 </MenuItem>
 ))}
 </TextField>
 </div>

 {/* Role* */}
 <div>
 <TextField
 select
 fullWidth
 size="small"
 label="Role"
 value={formData.role}
 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
 required
 >
 {rolesList.map((r) => (
 <MenuItem key={r} value={r}>
 {r}
 </MenuItem>
 ))}
 </TextField>
 </div>

 {/* Salary* */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Salary"
 type="number"
 value={formData.salary}
 onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
 required
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <PaymentsOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Bonus */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Bonus"
 type="number"
 value={formData.bonus}
 onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <AttachMoneyOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>

 {/* Deductions */}
 <div>
 <TextField
 fullWidth
 size="small"
 label="Deductions"
 type="number"
 value={formData.deductions}
 onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
 slotProps={{
 input: {
 endAdornment: (
 <InputAdornment position="end">
 <RemoveCircleOutlineOutlinedIcon sx={{ color:'#64748b', fontSize: 20 }} />
 </InputAdornment>
 )
 }
 }}
 />
 </div>
 </div>

 <div className="flex items-center gap-3 pt-5">
 <button
 type="submit"
 className="px-6 py-2 rounded-full bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
 >
 Update
 </button>
 <button
 type="button"
 onClick={() => setIsEditModalOpen(false)}
 className="px-6 py-2 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
 >
 Cancel
 </button>
 </div>
 </form>
 </DialogContent>
 </Dialog>

 {/* Dialog: Delete Confirmation */}
 <Dialog
 open={isDeleteDialogOpen}
 onClose={() => setIsDeleteDialogOpen(false)}
 maxWidth="xs"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 p: 2,
 textAlign:'center'
 }
 }}
 >
 <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
 <WarningAmberOutlinedIcon sx={{ fontSize: 28 }} />
 </div>
 <h3 className="text-base font-bold text-slate-800 mb-1">Delete Salary Record?</h3>
 <p className="text-xs text-slate-500 mb-5">
 Are you sure you want to delete salary record for{''}
 <strong className="text-slate-700">{selectedRecord?.name}</strong>? This action cannot be
 undone.
 </p>

 <div className="flex items-center justify-center gap-3">
 <button
 onClick={() => setIsDeleteDialogOpen(false)}
 className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={handleConfirmDelete}
 className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
 >
 Delete
 </button>
 </div>
 </Dialog>

 {/* Global Snackbar Toast */}
 <Snackbar
 open={toast.open}
 autoHideDuration={3000}
 onClose={() => setToast({ ...toast, open: false })}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 >
 <Alert
 onClose={() => setToast({ ...toast, open: false })}
 severity={toast.severity}
 variant="filled"
 sx={{ width:'100%', borderRadius:'8px' }}
 >
 {toast.message}
 </Alert>
 </Snackbar>
 </div>
 );
}
}
