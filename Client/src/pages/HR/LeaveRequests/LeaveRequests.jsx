import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Snackbar, Alert, CircularProgress, Button } from '@mui/material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RefreshIcon from '@mui/icons-material/Refresh';

import MetricCards from '../components/MetricCards';
import { LeaveRequestsTable } from '../../../features/staff/components/leave/LeaveRequestsTable';
import { ApplyLeaveModal } from '../../../features/staff/components/leave/ApplyLeaveModal';
import staffService from '../../../features/staff/services/staffService';
import staffAdapter from '../../../features/staff/adapters/staffAdapter';

import '../../../features/assigned-ui/formStyles.css';
import '../../../features/assigned-ui/toolbarStyles.css';

export default function LeaveRequests() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [employees, setEmployees] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Column visibility
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    select: true,
    id: false,
    empId: false,
    name: true,
    department: true,
    designation: false,
    leaveType: true,
    status: true,
    from: true,
    to: true,
    days: true,
    approvedBy: true,
    reason: false,
    actions: true
  });

  // Modal Dialog state (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalForm, setModalForm] = useState({
    employee_id: '',
    name: '',
    department: '',
    designation: '',
    leaveType: 'Special Leave',
    status: 'Pending',
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    days: 1,
    approved_by: '',
    approvedBy: '',
    reason: ''
  });

  // Toast notification
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Authoritative Backend Data Fetch
  const loadLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await staffService.getLeaveRequests({ limit: 200 });
      const rawList = res?.data || [];
      const adapted = staffAdapter.toLeaveListUI(rawList);
      setData(adapted);
    } catch (err) {
      console.error('Failed to load leave requests from server:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to load leave requests';
      setFetchError(errMsg);
      setData([]); // CRITICAL: NEVER fall back to mock data
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await staffService.getEmployees({ limit: 100 });
      const rawList = res?.data || [];
      const adapted = staffAdapter.toListUI(rawList);
      setEmployees(adapted);
    } catch (err) {
      console.error('Failed to load employees for leave modal:', err);
    }
  }, []);

  useEffect(() => {
    loadLeaveRequests();
    loadEmployees();
  }, [loadLeaveRequests, loadEmployees]);

  // Handle Search & Filtering
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.leaveType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.approvedBy && item.approvedBy.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [data, searchTerm]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Select all handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => staffService.deleteLeaveRequest(id)));
      setSelectedIds([]);
      setSnackbar({ open: true, message: 'Selected leave requests removed', severity: 'info' });
      loadLeaveRequests();
    } catch (err) {
      console.error('Failed to bulk delete leave requests:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to delete selected requests',
        severity: 'error'
      });
      loadLeaveRequests();
    }
  };

  // Single Delete
  const handleDeleteRow = async (id) => {
    try {
      await staffService.deleteLeaveRequest(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setSnackbar({ open: true, message: 'Leave request deleted successfully', severity: 'info' });
      loadLeaveRequests();
    } catch (err) {
      console.error('Failed to delete leave request:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to delete leave request',
        severity: 'error'
      });
    }
  };

  // Refresh
  const handleRefresh = () => {
    setSelectedIds([]);
    setSearchTerm('');
    setPage(0);
    loadLeaveRequests();
    loadEmployees();
    setSnackbar({ open: true, message: 'Data refreshed successfully', severity: 'success' });
  };

  // Export PDF
  const handleExportPdf = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();

      const tableHeaders = [['Name', 'Department', 'Leave Type', 'Status', 'From', 'To', 'Days', 'Approved By']];
      const tableData = filteredData.map((row) => [
        row.name,
        row.department,
        row.leaveType,
        row.status,
        row.from,
        row.to,
        row.days,
        row.approvedBy
      ]);

      doc.setFontSize(16);
      doc.text('Hotel Management - Leave Requests Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

      autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: 28,
        theme: 'grid',
        headStyles: { fillColor: [93, 95, 239], textColor: [255, 255, 255] }
      });

      doc.save('Leave_Requests.pdf');
      setSnackbar({ open: true, message: 'PDF exported successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to export PDF', severity: 'error' });
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const exportRows = filteredData.map((row) => ({
        'Employee ID': row.empId,
        Name: row.name,
        Department: row.department,
        'Leave Type': row.leaveType,
        Status: row.status,
        'From Date': row.from,
        'To Date': row.to,
        'No of Days': row.days,
        'Approved By': row.approvedBy,
        Reason: row.reason
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'LeaveRequests');
      XLSX.writeFile(workbook, 'Leave_Requests.xlsx');
      setSnackbar({ open: true, message: 'Excel file exported successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to export Excel', severity: 'error' });
    }
  };

  // Modal Open for Add
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalError(null);
    const firstEmp = employees[0] || {};
    setModalForm({
      employee_id: firstEmp.id || '',
      name: firstEmp.name || '',
      department: firstEmp.department || 'General',
      designation: firstEmp.designation || 'Staff',
      leaveType: 'Special Leave',
      status: 'Pending',
      from: new Date().toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
      days: 1,
      approved_by: '',
      approvedBy: '',
      reason: ''
    });
    setIsModalOpen(true);
  };

  // Modal Open for Edit
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setModalError(null);
    setModalForm({
      employee_id: item.employeeId || '',
      name: item.name || '',
      department: item.department || '',
      designation: item.designation || '',
      leaveType: item.leaveType || 'Special Leave',
      status: item.status || 'Pending',
      from: item.from || '',
      to: item.to || '',
      days: item.days || 1,
      approved_by: item.approvedById || '',
      approvedBy: item.approvedBy === '-' ? '' : item.approvedBy,
      reason: item.reason || ''
    });
    setIsModalOpen(true);
  };

  // Modal Save
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!modalForm.employee_id && !modalForm.name?.trim()) {
      setSnackbar({ open: true, message: 'Please select an employee', severity: 'error' });
      return;
    }
    if (!modalForm.reason?.trim()) {
      setSnackbar({ open: true, message: 'Reason is required', severity: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      const payload = staffAdapter.toLeaveBackendPayload(modalForm);

      if (editingItem) {
        await staffService.updateLeaveRequest(editingItem.id, payload);
        setSnackbar({ open: true, message: 'Leave request updated successfully', severity: 'success' });
      } else {
        await staffService.createLeaveRequest(payload);
        setSnackbar({ open: true, message: 'New leave request created!', severity: 'success' });
      }

      setIsModalOpen(false);
      loadLeaveRequests();
    } catch (err) {
      console.error('Failed to save leave request:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save leave request';
      setModalError(errMsg);
      setSnackbar({ open: true, message: errMsg, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle column
  const toggleColumn = (col) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  // Dynamic Leave Management Summary Statistics
  const leaveStats = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const totalRequests = list.length;
    const pendingRequests = list.filter((item) => (item.status || '').toLowerCase() === 'pending').length;
    const approvedRequests = list.filter((item) => (item.status || '').toLowerCase() === 'approved').length;
    const rejectedRequests = list.filter((item) => (item.status || '').toLowerCase() === 'rejected').length;

    const employeesOnLeave = new Set(
      list
        .filter((item) => (item.status || '').toLowerCase() === 'approved')
        .map((item) => item.empId || item.name)
        .filter(Boolean)
    ).size;

    const totalLeaveDays = list.reduce((sum, item) => sum + (Number(item.days) || 0), 0);

    return [
      {
        id: 'total-requests',
        title: 'Total Requests',
        value: totalRequests,
        subtext: 'All records',
        icon: AssignmentOutlinedIcon,
        iconBg: 'bg-[var(--primary-main)]/10',
        iconColor: 'text-[var(--primary-main)]'
      },
      {
        id: 'pending-requests',
        title: 'Pending Requests',
        value: pendingRequests,
        subtext: 'Needs review',
        icon: PendingActionsOutlinedIcon,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600'
      },
      {
        id: 'approved-requests',
        title: 'Approved Requests',
        value: approvedRequests,
        subtext: 'Granted',
        icon: CheckCircleOutlinedIcon,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600'
      },
      {
        id: 'rejected-requests',
        title: 'Rejected Requests',
        value: rejectedRequests,
        subtext: 'Declined',
        icon: CancelOutlinedIcon,
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600'
      },
      {
        id: 'employees-on-leave',
        title: 'Employees on Leave',
        value: employeesOnLeave,
        subtext: 'Active staff',
        icon: GroupOutlinedIcon,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      {
        id: 'total-leave-days',
        title: 'Total Leave Days',
        value: totalLeaveDays,
        subtext: 'Days total',
        icon: DateRangeIcon,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600'
      }
    ];
  }, [data]);

  return (
    <div className="animate-fade-in">
      <MetricCards cards={leaveStats} compactSubtext />

      {fetchError && (
        <div className="my-3">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadLeaveRequests} startIcon={<RefreshIcon />}>
                Retry
              </Button>
            }
          >
            {fetchError}
          </Alert>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-[6px] border border-gray-100 p-8 flex flex-col items-center justify-center gap-3 text-gray-500 mt-1.5">
          <CircularProgress size={32} sx={{ color: '#5d5fef' }} />
          <span className="text-sm">Loading leave requests from server...</span>
        </div>
      ) : (
        <LeaveRequestsTable
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setPage={setPage}
          selectedIds={selectedIds}
          handleBulkDelete={handleBulkDelete}
          filterAnchorEl={filterAnchorEl}
          setFilterAnchorEl={setFilterAnchorEl}
          handleOpenAddModal={handleOpenAddModal}
          handleRefresh={handleRefresh}
          handleExportExcel={handleExportExcel}
          handleExportPdf={handleExportPdf}
          visibleColumns={visibleColumns}
          paginatedData={paginatedData}
          handleSelectAll={handleSelectAll}
          handleSelectRow={handleSelectRow}
          handleOpenEditModal={handleOpenEditModal}
          handleDeleteRow={handleDeleteRow}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          page={page}
          filteredData={filteredData}
          toggleColumn={toggleColumn}
        />
      )}

      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        modalForm={modalForm}
        setModalForm={setModalForm}
        handleSaveModal={handleSaveModal}
        employees={employees}
        isSubmitting={isSubmitting}
        error={modalError}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
