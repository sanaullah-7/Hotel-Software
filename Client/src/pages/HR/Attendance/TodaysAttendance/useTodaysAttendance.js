import { useState, useMemo, useEffect, useCallback } from 'react';
import { addAuditLog } from '../../../../features/audit/state/auditStore.js';
import attendanceService from '../../../../features/staff/services/attendanceService.js';
import staffService from '../../../../features/staff/services/staffService.js';
import attendanceAdapter, { getLocalTodayDateString } from '../../../../features/staff/adapters/attendanceAdapter.js';

import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';

export function useTodaysAttendance() {
  // Main Data State
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState('firstIn');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    firstIn: true,
    breakTime: true,
    lastOut: true,
    totalHours: true,
    status: true,
    shift: true,
    actions: true,
  });

  // Filter Popover State
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');

  // Modal Dialogs State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    shift: 'Day Shift',
    firstIn: '10:30',
    breakTime: '01:00',
    lastOut: '19:30',
    totalHours: '08:00',
    status: 'present',
    avatar: '',
  });

  // Notification Toast State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Current local date string in YYYY-MM-DD
  const todayStr = useMemo(() => getLocalTodayDateString(), []);

  // Fetch canonical attendance & employees
  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [attRes, empRes] = await Promise.all([
        attendanceService.getAttendance({ date: todayStr }),
        staffService.getEmployees({ limit: 200 }),
      ]);

      const rawList = attRes?.data?.data || attRes?.data || [];
      const adaptedList = attendanceAdapter.toTodayAttendanceListUI(rawList);
      setAttendanceList(adaptedList);

      const rawEmps = empRes?.data?.data || empRes?.data || [];
      setEmployees(Array.isArray(rawEmps) ? rawEmps : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load attendance';
      console.error('Error fetching today attendance:', err);
      setError(msg);
      setToast({
        open: true,
        message: msg,
        severity: 'error',
      });
      setAttendanceList([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Calculate dynamic total hours on time change
  const calculateTotalHours = (firstIn, lastOut, breakTime) => {
    if (!firstIn || !lastOut) return '00:00';
    try {
      const [inH, inM] = firstIn.split(':').map(Number);
      const [outH, outM] = lastOut.split(':').map(Number);
      let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMinutes < 0) diffMinutes += 24 * 60; // Crosses midnight

      let brkMinutes = 0;
      if (breakTime && breakTime !== '00:00') {
        const [brkH, brkM] = breakTime.split(':').map(Number);
        brkMinutes = (brkH || 0) * 60 + (brkM || 0);
      }

      // If worked time is shorter than or equal to the break time, do not deduct break
      const netMinutes = diffMinutes <= brkMinutes ? diffMinutes : Math.max(0, diffMinutes - brkMinutes);
      const hours = Math.floor(netMinutes / 60);
      const mins = netMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    } catch {
      return '00:00';
    }
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
  const filteredRecords = useMemo(() => {
    const list = Array.isArray(attendanceList) ? attendanceList : [];
    return list.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.empId || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        (item.status || '').toLowerCase() === statusFilter.toLowerCase();

      const matchesShift =
        shiftFilter === 'All' ||
        (item.shift || '').toLowerCase() === shiftFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [attendanceList, searchQuery, statusFilter, shiftFilter]);

  // Sorted Records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle nulls/dashes so records with actual values sort first
      const isAEmpty = valA === '-' || valA === null || valA === undefined || valA === '';
      const isBEmpty = valB === '-' || valB === null || valB === undefined || valB === '';
      if (isAEmpty && !isBEmpty) return 1;
      if (!isAEmpty && isBEmpty) return -1;
      if (isAEmpty && isBEmpty) return 0;

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortField, sortOrder]);

  // Paginated Records
  const paginatedRecords = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedRecords, page, rowsPerPage]);

  // Checkbox Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredRecords.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected =
    filteredRecords.length > 0 && selectedIds.length === filteredRecords.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < filteredRecords.length;

  // Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAttendance();
  };

  // Export PDF stub
  const handleExportPDF = () => {
    setToast({
      open: true,
      message: 'Exporting attendance report...',
      severity: 'info',
    });
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    const defaultEmp = employees[0] || {};
    const defaultEmpId = defaultEmp._id || defaultEmp.id || '';
    const defaultName = `${defaultEmp.first_name || ''} ${defaultEmp.last_name || ''}`.trim();

    const defFirstIn = '09:00';
    const defLastOut = '17:00';
    const defBreakTime = '01:00';
    const defTotal = calculateTotalHours(defFirstIn, defLastOut, defBreakTime);

    setFormData({
      employee_id: defaultEmpId,
      name: defaultName,
      shift: 'Day Shift',
      firstIn: defFirstIn,
      breakFrom: '13:00',
      breakTo: '14:00',
      breakTime: defBreakTime,
      lastOut: defLastOut,
      totalHours: defTotal,
      status: 'present',
      avatar: defaultEmp.avatar || '',
    });
    setIsAddModalOpen(true);
  };

  // Save New Attendance
  const handleSaveNewAttendance = async (e) => {
    e.preventDefault();
    try {
      const payload = attendanceAdapter.toAttendanceBackendPayload(formData, todayStr);
      await attendanceService.createAttendance(payload);

      addAuditLog({
        action: 'Attendance Marked',
        category: 'Staff',
        details: `Recorded attendance for ${formData.name || 'Employee'}`,
      });

      setIsAddModalOpen(false);
      setToast({
        open: true,
        message: `Attendance recorded for ${formData.name}!`,
        severity: 'success',
      });
      loadAttendance();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to record attendance';
      setToast({
        open: true,
        message: msg,
        severity: 'error',
      });
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (record) => {
    setSelectedRecord(record);
    const computed = calculateTotalHours(
      record.firstIn === '-' ? '' : record.firstIn,
      record.lastOut === '-' ? '' : record.lastOut,
      record.breakTime
    );
    setFormData({
      employee_id: record.employeeId,
      name: record.name,
      shift: record.shift,
      firstIn: record.firstIn === '-' ? '' : record.firstIn,
      breakTime: record.breakTime || '01:00',
      breakFrom: record.breakFrom || '',
      breakTo: record.breakTo || '',
      lastOut: record.lastOut === '-' ? '' : record.lastOut,
      totalHours: record.totalHours || computed,
      status: record.status,
      avatar: record.avatar,
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Attendance
  const handleSaveEditAttendance = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const rawStatus = (formData.status || 'present').toUpperCase();
      let status = 'PRESENT';
      if (rawStatus === 'ABSENT') status = 'ABSENT';
      else if (rawStatus === 'ON_LEAVE' || rawStatus === 'LEAVE') status = 'ON_LEAVE';
      else if (rawStatus === 'LATE') status = 'LATE';
      else if (rawStatus === 'HALF_DAY') status = 'HALF_DAY';

      const isNonWorking = status === 'ABSENT' || status === 'ON_LEAVE';
      const total = isNonWorking ? '00:00' : calculateTotalHours(formData.firstIn, formData.lastOut, formData.breakTime);

      const updatePayload = {
        shift: formData.shift,
        status,
        break_time: isNonWorking ? '00:00' : formData.breakTime,
        total_hours: total,
      };

      if (!isNonWorking && formData.firstIn) {
        updatePayload.clock_in_time = new Date(`${todayStr}T${formData.firstIn}:00.000Z`).toISOString();
      }
      if (!isNonWorking && formData.lastOut) {
        if (formData.firstIn && formData.lastOut < formData.firstIn) {
          // Cross-midnight shift
          const d = new Date(`${todayStr}T00:00:00.000Z`);
          d.setDate(d.getDate() + 1);
          const nextDayStr = d.toISOString().split('T')[0];
          updatePayload.clock_out_time = new Date(`${nextDayStr}T${formData.lastOut}:00.000Z`).toISOString();
        } else {
          updatePayload.clock_out_time = new Date(`${todayStr}T${formData.lastOut}:00.000Z`).toISOString();
        }
      }

      await attendanceService.updateAttendance(selectedRecord.id, updatePayload);

      setIsEditModalOpen(false);
      setToast({
        open: true,
        message: `Attendance updated for ${formData.name}!`,
        severity: 'success',
      });
      loadAttendance();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update attendance';
      setToast({
        open: true,
        message: msg,
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
      await attendanceService.deleteAttendance(selectedRecord.id);
      setIsDeleteDialogOpen(false);
      setToast({
        open: true,
        message: `Attendance record for ${selectedRecord.name} deleted!`,
        severity: 'success',
      });
      loadAttendance();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete attendance record';
      setToast({
        open: true,
        message: msg,
        severity: 'error',
      });
    }
  };

  // Dynamic 6-card Attendance Summary Metrics
  const attendanceStats = useMemo(() => {
    const list = Array.isArray(attendanceList) ? attendanceList : [];
    const totalRecords = list.length;

    const presentCount = list.filter(
      (item) => (item.status || '').toLowerCase() === 'present'
    ).length;

    const absentCount = list.filter(
      (item) => (item.status || '').toLowerCase() === 'absent'
    ).length;

    const leaveCount = list.filter((item) => {
      const s = (item.status || '').toLowerCase();
      return s === 'on_leave' || s === 'leave';
    }).length;

    const attendanceRate =
      totalRecords > 0
        ? `${Math.round((presentCount / totalRecords) * 100)}%`
        : '0%';

    const dayShiftCount = list.filter((item) =>
      (item.shift || '').toLowerCase().includes('day')
    ).length;

    return [
      {
        id: 'total-employees',
        title: 'Total Employees',
        value: totalRecords,
        subtext: 'Today active records',
        icon: PeopleOutlinedIcon,
        iconBg: 'bg-[var(--primary-main)]/10',
        iconColor: 'text-[var(--primary-main)]',
      },
      {
        id: 'present',
        title: 'Present',
        value: presentCount,
        subtext: 'On duty',
        icon: HowToRegOutlinedIcon,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        id: 'absent',
        title: 'Absent',
        value: absentCount,
        subtext: 'Off duty',
        icon: PersonOffOutlinedIcon,
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
      },
      {
        id: 'on-leave',
        title: 'On Leave',
        value: leaveCount,
        subtext: 'Approved leave',
        icon: EventBusyOutlinedIcon,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
      {
        id: 'attendance-rate',
        title: 'Attendance Rate',
        value: attendanceRate,
        subtext: 'Turnout',
        icon: PercentOutlinedIcon,
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
      },
      {
        id: 'day-shift',
        title: 'Day Shift',
        value: dayShiftCount,
        subtext: 'Morning crew',
        icon: WbSunnyOutlinedIcon,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
    ];
  }, [attendanceList]);

  return {
    attendanceList,
    employees,
    loading,
    error,
    loadAttendance,
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
    visibleColumns,
    setVisibleColumns,
    filterAnchorEl,
    setFilterAnchorEl,
    columnAnchorEl,
    setColumnAnchorEl,
    statusFilter,
    setStatusFilter,
    shiftFilter,
    setShiftFilter,
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
    calculateTotalHours,
    handleSort,
    paginatedRecords,
    sortedRecords,
    filteredRecords,
    handleSelectAll,
    handleSelectRow,
    isAllSelected,
    isSomeSelected,
    handleRefresh,
    handleExportPDF,
    handleOpenAddModal,
    handleSaveNewAttendance,
    handleOpenEditModal,
    handleSaveEditAttendance,
    handleOpenDeleteDialog,
    handleConfirmDelete,
    attendanceStats,
  };
}
