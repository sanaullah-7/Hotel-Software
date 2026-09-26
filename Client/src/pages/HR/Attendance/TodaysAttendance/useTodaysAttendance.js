import { addAuditLog } from '../../../../features/audit/state/auditStore.js';
import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { initialAttendanceRecords } from './constants';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined';

export function useTodaysAttendance() {
  // Main Data State
  const [attendanceList, setAttendanceList] = useState(initialAttendanceRecords);
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
    actions: true
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
    name: '',
    shift: 'Day Shift',
    firstIn: '10:30',
    breakTime: '01:00',
    lastOut: '19:30',
    totalHours: '08:00',
    status: 'present',
    avatar: ''
  });

  // Notification Toast State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Calculate dynamic total hours on time change
  const calculateTotalHours = (firstIn, lastOut, breakTime) => {
    if (!firstIn || !lastOut) return '08:00';
    try {
      const [inH, inM] = firstIn.split(':').map(Number);
      const [outH, outM] = lastOut.split(':').map(Number);
      const [brkH, brkM] = (breakTime || '01:00').split(':').map(Number);

      const inMinutes = inH * 60 + inM;
      const outMinutes = outH * 60 + outM;
      const brkMinutes = brkH * 60 + brkM;

      let diffMinutes = outMinutes - inMinutes - brkMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60; // Crosses midnight

      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    } catch {
      return '08:00';
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
    return attendanceList.filter((item) => {
      // Search Match
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shift.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter Match
      const matchesStatus =
        statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesShift = shiftFilter === 'All' || item.shift === shiftFilter;

      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [attendanceList, searchQuery, statusFilter, shiftFilter]);

  // Sorted Records
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    if (!sortField) return list;

    return list.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortField, sortOrder]);

  // Paginated Records
  const paginatedRecords = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRecords.slice(start, start + rowsPerPage);
  }, [sortedRecords, page, rowsPerPage]);

  // Selection Logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allPageIds = paginatedRecords.map((r) => r.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allPageIds])));
    } else {
      const pageIdSet = new Set(paginatedRecords.map((r) => r.id));
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
    paginatedRecords.length > 0 && paginatedRecords.every((r) => selectedIds.includes(r.id));
  const isSomeSelected =
    paginatedRecords.some((r) => selectedIds.includes(r.id)) && !isAllSelected;

  // Refresh Action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setAttendanceList(initialAttendanceRecords);
      setIsRefreshing(false);
      setToast({
        open: true,
        message: "Today's attendance refreshed successfully!",
        severity: 'success'
      });
    }, 400);
  };

  // PDF Export Action
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("Today's Attendance Report", 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 25);

    const tableData = sortedRecords.map((item) => [
      item.name,
      item.firstIn,
      item.breakTime,
      item.lastOut,
      item.totalHours,
      item.status.toUpperCase(),
      item.shift
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Employee Name', 'First In', 'Break', 'Last Out', 'Total Hours', 'Status', 'Shift']],
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

    doc.save(`Todays_Attendance_${new Date().toISOString().split('T')[0]}.pdf`);
    setToast({
      open: true,
      message: 'PDF report generated and downloaded successfully!',
      severity: 'success'
    });
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      shift: 'Day Shift',
      firstIn: '10:30',
      breakTime: '01:00',
      lastOut: '19:30',
      totalHours: '08:00',
      status: 'present',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
    });
    setIsAddModalOpen(true);
  };

  // Save New Attendance
  const handleSaveNewAttendance = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const total = calculateTotalHours(formData.firstIn, formData.lastOut, formData.breakTime);
    const newRecord = {
      id: Date.now(),
      empId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      avatar:
        formData.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=5d5fef&color=fff`,
      firstIn: formData.firstIn,
      breakTime: formData.breakTime,
      lastOut: formData.lastOut,
      totalHours: total,
      status: formData.status,
      shift: formData.shift
    };

    setAttendanceList([newRecord, ...attendanceList]);
    setIsAddModalOpen(false);
    setToast({
      open: true,
      message: `Attendance added for ${formData.name}!`,
      severity: 'success'
    });
  };

  // Open Edit Modal
  const handleOpenEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      name: record.name,
      shift: record.shift,
      firstIn: record.firstIn,
      breakTime: record.breakTime,
      lastOut: record.lastOut,
      totalHours: record.totalHours,
      status: record.status,
      avatar: record.avatar
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Attendance
  const handleSaveEditAttendance = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const total = calculateTotalHours(formData.firstIn, formData.lastOut, formData.breakTime);
    setAttendanceList(
      attendanceList.map((item) =>
        item.id === selectedRecord.id
          ? {
              ...item,
              name: formData.name,
              shift: formData.shift,
              firstIn: formData.firstIn,
              breakTime: formData.breakTime,
              lastOut: formData.lastOut,
              totalHours: total,
              status: formData.status
            }
          : item
      )
    );

    setIsEditModalOpen(false);
    setToast({
      open: true,
      message: `Attendance updated for ${formData.name}!`,
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
    setAttendanceList(attendanceList.filter((item) => item.id !== selectedRecord.id));
    setSelectedIds(selectedIds.filter((id) => id !== selectedRecord.id));
    setIsDeleteDialogOpen(false);
    setToast({
      open: true,
      message: `Attendance record for ${selectedRecord.name} deleted!`,
      severity: 'success'
    });
  };

  // Dynamic 6-card Attendance Summary Metrics
  const attendanceStats = useMemo(() => {
    const list = Array.isArray(attendanceList) ? attendanceList : [];
    const totalEmployees = list.length;
    
    // Present count (case-insensitive check)
    const presentCount = list.filter(item => (item.status || '').toLowerCase() === 'present').length;
    
    // Absent count (case-insensitive check)
    const absentCount = list.filter(item => (item.status || '').toLowerCase() === 'absent').length;
    
    // Attendance rate safe percentage
    const attendanceRate = totalEmployees > 0 
      ? `${Math.round((presentCount / totalEmployees) * 100)}%` 
      : '0%';
      
    // Day Shift count (case-insensitive check)
    const dayShiftCount = list.filter(item => (item.shift || '').toLowerCase().includes('day')).length;
    
    // Night Shift count (case-insensitive check)
    const nightShiftCount = list.filter(item => (item.shift || '').toLowerCase().includes('night')).length;

    return [
      {
        id: 'total-employees',
        title: 'Total Employees',
        value: totalEmployees,
        subtext: 'Roster total',
        icon: PeopleOutlinedIcon,
        iconBg: 'bg-[var(--primary-main)]/10',
        iconColor: 'text-[var(--primary-main)]'
      },
      {
        id: 'present',
        title: 'Present',
        value: presentCount,
        subtext: 'On duty',
        icon: HowToRegOutlinedIcon,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600'
      },
      {
        id: 'absent',
        title: 'Absent',
        value: absentCount,
        subtext: 'Off duty',
        icon: PersonOffOutlinedIcon,
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600'
      },
      {
        id: 'attendance-rate',
        title: 'Attendance Rate',
        value: attendanceRate,
        subtext: 'Turnout',
        icon: PercentOutlinedIcon,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      {
        id: 'day-shift',
        title: 'Day Shift',
        value: dayShiftCount,
        subtext: 'Day roster',
        icon: WbSunnyOutlinedIcon,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600'
      },
      {
        id: 'night-shift',
        title: 'Night Shift',
        value: nightShiftCount,
        subtext: 'Night roster',
        icon: NightsStayOutlinedIcon,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600'
      }
    ];
  }, [attendanceList]);

  return {
    attendanceList,
    searchQuery,
    setSearchQuery,
    selectedIds,
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
    attendanceStats
  };
}
