import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress, Alert, Snackbar } from '@mui/material';

import staffService from '../../../features/staff/services/staffService';
import staffAdapter from '../../../features/staff/adapters/staffAdapter';

import StaffProfileHeader from './components/StaffProfileHeader';
import StaffProfileTabs from './components/StaffProfileTabs';
import StaffOverviewTab from './components/StaffOverviewTab';
import StaffPersonalTab from './components/StaffPersonalTab';
import StaffQualificationsTab from './components/StaffQualificationsTab';
import StaffAttendanceLeavesTab from './components/StaffAttendanceLeavesTab';
import EditStaffModal from './EditStaffModal';
import DeleteStaffConfirmationModal from './components/DeleteStaffConfirmationModal';

export default function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State synced with URL query (?tab=overview)
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Staff data states
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Leave requests state from backend
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Handle Tab Switch
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  // Authoritative Backend Staff Fetch
  const fetchStaff = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getEmployeeById(id);
      const empData = res?.data;
      if (empData) {
        setStaff(staffAdapter.toUI(empData));
      } else {
        setStaff(null);
        setError('Staff member not found.');
      }
    } catch (err) {
      console.error('Failed to load employee from server:', err);
      setError(err?.response?.data?.message || err?.message || 'Employee not found on server.');
      setStaff(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Authoritative Backend Leaves Fetch
  const fetchLeaveRequests = useCallback(async (employeeId) => {
    if (!employeeId) return;
    try {
      setIsLoadingLeaves(true);
      const res = await staffService.getLeaveRequests({ employee_id: employeeId });
      const leaves = Array.isArray(res?.data) ? res.data : (res?.data?.leaveRequests || []);
      setLeaveRequests(leaves);
    } catch (err) {
      console.warn('Could not fetch leave requests for employee:', err);
      setLeaveRequests([]);
    } finally {
      setIsLoadingLeaves(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (staff?._id || staff?.id) {
      fetchLeaveRequests(staff._id || staff.id);
    }
  }, [staff?._id, staff?.id, fetchLeaveRequests]);

  // Handle Staff Deletion / Termination
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await staffService.deleteEmployee(id);
      setSnackbar({
        open: true,
        message: 'Staff member terminated successfully.',
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/hr/staff');
      }, 700);
    } catch (err) {
      console.error('Failed to terminate employee:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to terminate employee.';
      setSnackbar({
        open: true,
        message: errMsg,
        severity: 'error'
      });
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditSaveSuccess = () => {
    setIsEditModalOpen(false);
    setSnackbar({
      open: true,
      message: 'Staff profile updated successfully!',
      severity: 'success'
    });
    fetchStaff();
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px] text-gray-500 gap-3">
        <CircularProgress size={28} sx={{ color: '#1b7f43' }} />
        <span className="text-xs font-semibold text-gray-600">Loading staff member details...</span>
      </div>
    );
  }

  // Not Found or Error State
  if (!staff || error) {
    return (
      <div className="p-4 max-w-xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-gray-900">Staff Member Not Found</h2>
          <p className="text-xs text-gray-500">{error || 'The requested staff profile does not exist.'}</p>
          <div className="pt-2">
            <Link
              to="/hr/staff"
              className="inline-flex items-center px-4 py-2 bg-[#1b7f43] text-white text-xs font-bold rounded-xl hover:brightness-105 transition shadow-xs"
            >
              Back to Staff Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* 1. Profile Header Hero Banner */}
      <StaffProfileHeader
        staff={staff}
        onEditClick={() => setIsEditModalOpen(true)}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
      />

      {/* 2. Interactive Navigation Tabs */}
      <StaffProfileTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 3. Tab Contents */}
      <div className="mt-2">
        {activeTab === 'overview' && (
          <StaffOverviewTab
            staff={staff}
            onSwitchTab={handleTabChange}
          />
        )}

        {activeTab === 'personal' && (
          <StaffPersonalTab
            staff={staff}
          />
        )}

        {activeTab === 'qualifications' && (
          <StaffQualificationsTab
            staff={staff}
          />
        )}

        {activeTab === 'attendance' && (
          <StaffAttendanceLeavesTab
            staff={staff}
            leaveRequests={leaveRequests}
            isLoadingLeaves={isLoadingLeaves}
          />
        )}
      </div>

      {/* Edit Staff Modal Dialog */}
      <EditStaffModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        staff={staff}
        onSaveSuccess={handleEditSaveSuccess}
      />

      {/* Delete / Terminate Staff Confirmation Dialog */}
      <DeleteStaffConfirmationModal
        open={isDeleteModalOpen}
        staffName={staff.name}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Feedback Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
