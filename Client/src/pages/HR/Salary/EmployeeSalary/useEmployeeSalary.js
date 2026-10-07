import { useState, useMemo, useEffect, useCallback } from 'react';
import { payrollService } from '../../../../features/staff/services/payrollService';
import { payrollAdapter } from '../../../../features/staff/adapters/payrollAdapter';
import { staffService } from '../../../../features/staff/services/staffService';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';

export function useEmployeeSalary() {
  // Main Data State
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

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
    actions: true,
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
    avatar: '',
  });

  // Notification Toast State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Fetch from backend
  const fetchSalaries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await payrollService.getPayrollRoster();
      const rawData = res?.data ?? res;
      const normalized = payrollAdapter.toSalaryList(rawData);
      setSalaries(normalized);
    } catch (err) {
      console.error('Failed to load employee salary records:', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to load salary records');
      setSalaries([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  // Refresh Action
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSalaries().then(() => {
      setToast({
        open: true,
        message: 'Employee salary records refreshed successfully!',
        severity: 'success',
      });
    });
  };

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
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.empId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    paginatedSalaries.length > 0 &&
    paginatedSalaries.some((r) => selectedIds.includes(r.id)) &&
    !isAllSelected;

  // Full Table PDF Export Action
  const handleExportPDF = async () => {
    const [{ default: jsPdfDefault, jsPDF: jsPdfNamed }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const jsPDF = jsPdfNamed || jsPdfDefault;
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
      `$${((item.salary || 0) + (item.bonus || 0) - (item.deductions || 0)).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Employee Name', 'Email', 'Department', 'Salary', 'Bonus', 'Deductions', 'Net Salary']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [93, 95, 239],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    doc.save(`Employee_Salary_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    setToast({
      open: true,
      message: 'Full salary report exported to PDF!',
      severity: 'success',
    });
  };

  // Individual Payslip PDF Download Action
  const handleDownloadPayslip = async (row) => {
    const [{ default: jsPdfDefault, jsPDF: jsPdfNamed }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const jsPDF = jsPdfNamed || jsPdfDefault;
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
    doc.text(
      `Payment Period: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      120,
      63
    );
    doc.text(`Status: ${row.paymentStatus || 'Paid'}`, 120, 70);

    // Breakdown Table
    autoTable(doc, {
      startY: 88,
      head: [['Earnings / Breakdown', 'Amount (USD)']],
      body: [
        ['Basic Salary', `$${Number(row.salary).toLocaleString()}`],
        ['Bonus & Allowances', `+$${Number(row.bonus || 0).toLocaleString()}`],
        ['Deductions & Taxes', `-$${Number(row.deductions || 0).toLocaleString()}`],
        ['NET SALARY PAYABLE', `$${net.toLocaleString()}`],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [93, 95, 239],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
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
      severity: 'success',
    });
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      empId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      email: '',
      department: 'Front Office',
      role: 'Staff',
      salary: '',
      bonus: '',
      deductions: '',
      avatar: '',
    });
    setIsAddModalOpen(true);
  };

  // Save New Employee / Salary Record
  const handleSaveNewSalary = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.salary === '') return;

    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || 'Staff';
      const lastName = nameParts.slice(1).join(' ') || 'Member';

      // Create new employee with base salary
      await staffService.createStaff({
        first_name: firstName,
        last_name: lastName,
        employee_ref: formData.empId || `EMP-${Date.now().toString().slice(-4)}`,
        email: formData.email || `${firstName.toLowerCase()}.${Date.now().toString().slice(-4)}@hotel.com`,
        job_title: formData.role || 'Staff',
        salary: Number(formData.salary) || 0,
      });

      setIsAddModalOpen(false);
      setToast({
        open: true,
        message: `Salary record added for ${formData.name}!`,
        severity: 'success',
      });
      await fetchSalaries();
    } catch (err) {
      console.error('Failed to create employee salary record:', err);
      setToast({
        open: true,
        message: err?.response?.data?.error?.message || err?.message || 'Failed to save salary record',
        severity: 'error',
      });
    }
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
      avatar: record.avatar,
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Salary
  const handleSaveEditSalary = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const empId = selectedRecord.employeeId || selectedRecord.id;
      const newSalary = Number(formData.salary) || 0;

      // 1. Update Employee base salary reference
      await payrollService.updateEmployeeSalary(empId, newSalary);

      // 2. If payroll item exists, update its bonuses/deductions/salary
      if (selectedRecord.payroll_item_id) {
        await payrollService.updatePayrollItem(selectedRecord.payroll_item_id, {
          base_salary: newSalary,
          bonuses: Number(formData.bonus) || 0,
          deductions: Number(formData.deductions) || 0,
        });
      }

      setIsEditModalOpen(false);
      setToast({
        open: true,
        message: `Salary record updated for ${formData.name}!`,
        severity: 'success',
      });
      await fetchSalaries();
    } catch (err) {
      console.error('Failed to update salary record:', err);
      setToast({
        open: true,
        message: err?.response?.data?.error?.message || err?.message || 'Failed to update salary record',
        severity: 'error',
      });
    }
  };

  // Open Delete Dialog
  const handleOpenDeleteDialog = (record) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;

    try {
      if (selectedRecord.payroll_item_id) {
        await payrollService.deletePayrollItem(selectedRecord.payroll_item_id);
      }
      // Reset salary reference to 0
      const empId = selectedRecord.employeeId || selectedRecord.id;
      await payrollService.updateEmployeeSalary(empId, 0);

      setIsDeleteDialogOpen(false);
      setSelectedIds(selectedIds.filter((id) => id !== selectedRecord.id));
      setToast({
        open: true,
        message: `Salary record for ${selectedRecord.name} reset!`,
        severity: 'success',
      });
      await fetchSalaries();
    } catch (err) {
      console.error('Failed to delete salary record:', err);
      setToast({
        open: true,
        message: err?.response?.data?.error?.message || err?.message || 'Failed to delete salary record',
        severity: 'error',
      });
    }
  };

  // Dynamic 6-card Payroll Summary Metrics
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
        iconColor: 'text-[var(--primary-main)]',
      },
      {
        id: 'total-payroll',
        title: 'Total Payroll',
        value: `$${Math.round(totalPayroll).toLocaleString()}`,
        subtext: 'Total net salary payable',
        icon: PaymentsOutlinedIcon,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        id: 'total-bonuses',
        title: 'Total Bonuses',
        value: `$${Math.round(totalBonuses).toLocaleString()}`,
        subtext: 'Total bonuses & allowances',
        icon: AttachMoneyOutlinedIcon,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        id: 'total-deductions',
        title: 'Total Deductions',
        value: `$${Math.round(totalDeductions).toLocaleString()}`,
        subtext: 'Total deductions',
        icon: RemoveCircleOutlineOutlinedIcon,
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
      },
      {
        id: 'average-salary',
        title: 'Average Salary',
        value: `$${Math.round(averageSalary).toLocaleString()}`,
        subtext: 'Average net salary',
        icon: TrendingUpOutlinedIcon,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
      {
        id: 'highest-net-salary',
        title: 'Highest Net Salary',
        value: `$${Math.round(highestNetSalary).toLocaleString()}`,
        subtext: highestSalaryEmployee ? `Highest paid: ${highestSalaryEmployee.name}` : 'No salary records',
        icon: WorkspacePremiumOutlinedIcon,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
      },
    ];
  }, [salaries]);

  return {
    salaries,
    setSalaries,
    isLoading,
    error,
    fetchSalaries,
    searchQuery,
    setSearchQuery,
    selectedIds,
    setSelectedIds,
    isRefreshing,
    sortField,
    sortOrder,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    filterAnchorEl,
    setFilterAnchorEl,
    columnAnchorEl,
    setColumnAnchorEl,
    departmentFilter,
    setDepartmentFilter,
    visibleColumns,
    setVisibleColumns,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedRecord,
    formData,
    setFormData,
    toast,
    setToast,
    handleSort,
    paginatedSalaries,
    sortedSalaries,
    filteredSalaries,
    handleSelectAll,
    handleSelectRow,
    isAllSelected,
    isSomeSelected,
    handleRefresh,
    handleExportPDF,
    handleDownloadPayslip,
    handleOpenAddModal,
    handleSaveNewSalary,
    handleOpenEditModal,
    handleSaveEditSalary,
    handleOpenDeleteDialog,
    handleConfirmDelete,
    payrollStats,
  };
}
