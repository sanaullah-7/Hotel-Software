import { useState, useMemo, useEffect, useCallback } from 'react';
import { payrollService } from '../../../../features/staff/services/payrollService';
import { payrollAdapter } from '../../../../features/staff/adapters/payrollAdapter';
import { staffService } from '../../../../features/staff/services/staffService';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { monthsList, yearsList } from './constants';

export function useEmployeeSalary() {
  // Period / Month-Year State
  const currentYear = new Date().getFullYear();
  const currentMonthName = monthsList[new Date().getMonth()] || 'October';

  const [selectedYear, setSelectedYear] = useState(
    yearsList.includes(currentYear) ? currentYear : 2026
  );
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);

  // Applied cycle period
  const [appliedYear, setAppliedYear] = useState(
    yearsList.includes(currentYear) ? currentYear : 2026
  );
  const [appliedMonth, setAppliedMonth] = useState(currentMonthName);

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
    paidAmount: true,
    paymentStatus: true,
    payslip: true,
    actions: true,
  });

  // Modal Dialogs State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Payment Recording Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentType: 'FULL', // 'FULL' | 'PARTIAL'
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  // Salary History Ledger Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

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

  // Fetch from backend for the selected month & year
  const fetchSalaries = useCallback(async (yearOverride, monthOverride) => {
    try {
      setIsLoading(true);
      setError(null);

      const yr = yearOverride || selectedYear;
      const mo = monthOverride || selectedMonth;
      const monthNum = monthsList.indexOf(mo) + 1;

      const res = await payrollService.getPayrollRoster({
        year: yr,
        month: monthNum > 0 ? monthNum : undefined,
      });

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
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchSalaries(appliedYear, appliedMonth);
  }, [fetchSalaries, appliedYear, appliedMonth]);

  // Update Roster explicitly (e.g. on Update button click)
  const handleUpdateRoster = async (customYr, customMo) => {
    const yr = customYr !== undefined ? customYr : selectedYear;
    const mo = customMo !== undefined ? customMo : selectedMonth;
    setAppliedYear(yr);
    setAppliedMonth(mo);
    setIsRefreshing(true);
    try {
      await fetchSalaries(yr, mo);
      setToast({
        open: true,
        message: `Salary records updated for ${mo} ${yr}!`,
        severity: 'success',
      });
    } catch {
      setToast({
        open: true,
        message: `Failed to update salary records for ${mo} ${yr}`,
        severity: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    handleUpdateRoster(newYear, selectedMonth);
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    handleUpdateRoster(selectedYear, newMonth);
  };

  // Refresh Action
  const handleRefresh = () => {
    handleUpdateRoster(appliedYear, appliedMonth);
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
        (item.paymentStatus || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    doc.text(`Employee Salary Report - ${selectedMonth} ${selectedYear}`, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      14,
      25
    );

    const tableData = sortedSalaries.map((item) => [
      item.name,
      item.empId,
      item.department,
      `$${Number(item.salary).toLocaleString()}`,
      `$${Number(item.bonus || 0).toLocaleString()}`,
      `$${Number(item.deductions || 0).toLocaleString()}`,
      `$${Number(item.netSalary).toLocaleString()}`,
      `$${Number(item.paidAmount || 0).toLocaleString()}`,
      item.paymentStatus,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Employee', 'EMP ID', 'Department', 'Basic', 'Bonus', 'Deductions', 'Net Pay', 'Paid', 'Status']],
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

    doc.save(`Salary_Report_${selectedMonth}_${selectedYear}.pdf`);
    setToast({
      open: true,
      message: 'Full salary report exported to PDF!',
      severity: 'success',
    });
  };

  // Individual Payslip PDF Download Action (Works for current and historical rows)
  const handleDownloadPayslip = async (row) => {
    const [{ default: jsPdfDefault, jsPDF: jsPdfNamed }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const jsPDF = jsPdfNamed || jsPdfDefault;
    const doc = new jsPDF();
    const net = Number(row.netSalary ?? (row.salary || 0) + (row.bonus || 0) - (row.deductions || 0));
    const paid = Number(row.paidAmount || 0);
    const balance = Math.max(0, net - paid);

    // Header Band
    doc.setFillColor(93, 95, 239);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('LUXURIA HOTEL & SUITES', 14, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('PAYSLIP / SALARY PAYMENT RECEIPT', 14, 27);

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

    doc.text(`Email: ${row.email || 'N/A'}`, 120, 56);
    doc.text(
      `Period: ${row.period_start ? new Date(row.period_start).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : `${selectedMonth} ${selectedYear}`}`,
      120,
      63
    );
    doc.text(`Payment Status: ${row.paymentStatus || 'Pending'}`, 120, 70);
    if (row.paymentMethod) {
      doc.text(`Method: ${row.paymentMethod.replace('_', ' ')}`, 120, 77);
    }

    // Breakdown Table
    autoTable(doc, {
      startY: 88,
      head: [['Salary Breakdown Item', 'Amount (USD)']],
      body: [
        ['Basic Salary', `$${Number(row.salary || row.baseSalary || 0).toLocaleString()}`],
        ['Bonus & Allowances', `+$${Number(row.bonus || 0).toLocaleString()}`],
        ['Deductions & Taxes', `-$${Number(row.deductions || 0).toLocaleString()}`],
        ['TOTAL NET SALARY', `$${net.toLocaleString()}`],
        ['AMOUNT PAID', `$${paid.toLocaleString()}`],
        ['REMAINING BALANCE DUE', `$${balance.toLocaleString()}`],
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
    const finalY = doc.lastAutoTable.finalY + 28;
    doc.setFontSize(9);
    doc.text('_________________________', 14, finalY);
    doc.text('Employer / Finance Authorized', 14, finalY + 7);

    doc.text('_________________________', 130, finalY);
    doc.text('Employee Signature & Date', 130, finalY + 7);

    const safeName = (row.name || 'Staff').replace(/\s+/g, '_');
    doc.save(`Payslip_${safeName}_${row.empId || 'EMP'}_${selectedMonth}_${selectedYear}.pdf`);
    setToast({
      open: true,
      message: `Payslip downloaded for ${row.name}!`,
      severity: 'success',
    });
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (record) => {
    setPaymentRecord(record);
    const remaining = record.remainingBalance ?? Math.max(0, record.netSalary - record.paidAmount);
    setPaymentForm({
      paymentType: remaining <= 0 ? 'FULL' : 'FULL',
      amount: remaining > 0 ? remaining : record.netSalary,
      paymentMethod: record.paymentMethod || 'BANK_TRANSFER',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: record.paymentNotes || '',
    });
    setIsPaymentModalOpen(true);
  };

  // Save / Record Salary Payment (Full or Partial)
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentRecord) return;

    try {
      setIsSavingPayment(true);
      const netSalary = Number(paymentRecord.netSalary || 0);
      const currentPaid = Number(paymentRecord.paidAmount || 0);
      const remainingBalance = Math.max(0, netSalary - currentPaid);

      let finalPaidAmount = 0;
      if (paymentForm.paymentType === 'FULL') {
        finalPaidAmount = netSalary;
      } else {
        // Partial: adding entered amount to current paid
        const addAmount = Number(paymentForm.amount) || 0;
        if (addAmount <= 0) {
          throw new Error('Please enter a valid payment amount greater than 0');
        }
        if (addAmount > remainingBalance) {
          throw new Error(`Amount exceeds remaining balance of $${remainingBalance.toLocaleString()}`);
        }
        finalPaidAmount = Math.min(netSalary, currentPaid + addAmount);
      }

      // If item id exists, update it directly
      if (paymentRecord.payroll_item_id) {
        await payrollService.updatePayrollItem(paymentRecord.payroll_item_id, {
          paid_amount: finalPaidAmount,
          payment_method: paymentForm.paymentMethod,
          payment_date: paymentForm.paymentDate,
          payment_notes: paymentForm.notes,
        });
      } else if (paymentRecord.run_id) {
        // Create item for run if somehow absent
        await payrollService.createPayrollItem(paymentRecord.run_id, {
          employee_id: paymentRecord.employeeId || paymentRecord.id,
          base_salary: paymentRecord.salary,
          bonuses: paymentRecord.bonus,
          deductions: paymentRecord.deductions,
          paid_amount: finalPaidAmount,
          payment_method: paymentForm.paymentMethod,
          payment_date: paymentForm.paymentDate,
          payment_notes: paymentForm.notes,
        });
      }

      setIsPaymentModalOpen(false);
      setToast({
        open: true,
        message: `Payment of $${(finalPaidAmount - currentPaid).toLocaleString()} recorded for ${paymentRecord.name}!`,
        severity: 'success',
      });
      await fetchSalaries(selectedYear, selectedMonth);
    } catch (err) {
      console.error('Failed to record salary payment:', err);
      setToast({
        open: true,
        message: err?.response?.data?.error?.message || err?.message || 'Failed to record payment',
        severity: 'error',
      });
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Open Salary History Ledger Modal
  const handleOpenHistoryModal = async (record) => {
    setHistoryEmployee(record);
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    setHistoryList([]);

    try {
      const empId = record.employeeId || record.id;
      const res = await payrollService.getPayrollItems({ employee_id: empId, limit: 50 });
      const rawItems = res?.data?.items || res?.items || [];
      const normalized = payrollAdapter.toHistoryList(rawItems);
      setHistoryList(normalized);
    } catch (err) {
      console.error('Failed to load employee salary history:', err);
      setToast({
        open: true,
        message: 'Failed to load past salary records for employee',
        severity: 'error',
      });
    } finally {
      setIsHistoryLoading(false);
    }
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
      await fetchSalaries(selectedYear, selectedMonth);
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
      await fetchSalaries(selectedYear, selectedMonth);
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
      const empId = selectedRecord.employeeId || selectedRecord.id;
      await payrollService.updateEmployeeSalary(empId, 0);

      setIsDeleteDialogOpen(false);
      setSelectedIds(selectedIds.filter((id) => id !== selectedRecord.id));
      setToast({
        open: true,
        message: `Salary record for ${selectedRecord.name} reset!`,
        severity: 'success',
      });
      await fetchSalaries(selectedYear, selectedMonth);
    } catch (err) {
      console.error('Failed to delete salary record:', err);
      setToast({
        open: true,
        message: err?.response?.data?.error?.message || err?.message || 'Failed to delete salary record',
        severity: 'error',
      });
    }
  };

  // Dynamic 6-card Monthly Payroll Summary Metrics
  const payrollStats = useMemo(() => {
    const list = Array.isArray(salaries) ? salaries : [];
    const totalEmployees = list.length;

    let totalPayroll = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let fullyPaidCount = 0;
    let pendingOrPartialCount = 0;

    list.forEach((item) => {
      const net = Number(item.netSalary) || 0;
      const paid = Number(item.paidAmount) || 0;
      const remaining = Math.max(0, net - paid);

      totalPayroll += net;
      totalPaid += paid;
      totalRemaining += remaining;

      if (item.paymentStatus === 'Paid') {
        fullyPaidCount += 1;
      } else {
        pendingOrPartialCount += 1;
      }
    });

    return [
      {
        id: 'total-employees',
        title: 'Total Employees',
        value: totalEmployees,
        subtext: `${appliedMonth} ${appliedYear}`,
        icon: PeopleOutlinedIcon,
        iconBg: 'bg-[var(--primary-main)]/10',
        iconColor: 'text-[var(--primary-main)]',
      },
      {
        id: 'total-payroll',
        title: 'Total Payroll',
        value: `$${Math.round(totalPayroll).toLocaleString()}`,
        subtext: 'Total net payable',
        icon: PaymentsOutlinedIcon,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
      },
      {
        id: 'total-paid',
        title: 'Paid Amount',
        value: `$${Math.round(totalPaid).toLocaleString()}`,
        subtext: 'Disbursed so far',
        icon: MonetizationOnOutlinedIcon,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        id: 'remaining-balance',
        title: 'Remaining Due',
        value: `$${Math.round(totalRemaining).toLocaleString()}`,
        subtext: 'Pending disbursement',
        icon: AccountBalanceWalletOutlinedIcon,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        id: 'fully-paid-staff',
        title: 'Fully Paid Staff',
        value: fullyPaidCount,
        subtext: '100% salary cleared',
        icon: CheckCircleOutlinedIcon,
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        id: 'pending-staff',
        title: 'Pending / Partial',
        value: pendingOrPartialCount,
        subtext: 'Awaiting completion',
        icon: PendingActionsOutlinedIcon,
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
      },
    ];
  }, [salaries, appliedMonth, appliedYear]);

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    appliedYear,
    setAppliedYear,
    appliedMonth,
    setAppliedMonth,
    handleUpdateRoster,
    handleYearChange,
    handleMonthChange,
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
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentRecord,
    paymentForm,
    setPaymentForm,
    isSavingPayment,
    handleOpenPaymentModal,
    handleSavePayment,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    historyEmployee,
    historyList,
    isHistoryLoading,
    handleOpenHistoryModal,
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
