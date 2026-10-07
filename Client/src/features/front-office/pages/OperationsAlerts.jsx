import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Dropdown from '../../../components/ui/Dropdown';
import {
  Notifications as NotificationsIcon,
  PendingActions as PendingActionsIcon,
  TaskAlt as TaskAltIcon,
  Hub as HubIcon,
  Star as StarIcon,
  CleaningServices as CleaningServicesIcon,
  Build as BuildIcon,
  Restaurant as RestaurantIcon,
  Security as SecurityIcon,
  Search as SearchIcon,
  Campaign as CampaignIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  ReportProblem as ReportProblemIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import operationsAlertService from '../../../services/operationsAlertService';
import {
  toFrontendOperationsAlert,
  toFrontendOperationsAlertList,
  toBackendOperationsAlertPayload,
} from '../adapters/operationsAlertAdapter';

// ---- Department visual theme (icon, colors) — reused across load bars + alert cards ----
const DEPARTMENTS = {
  'VIP Arrivals': { icon: StarIcon, color: '#2e7d32', bg: '#edf7ed' },
  'Housekeeping': { icon: CleaningServicesIcon, color: '#10b981', bg: '#ecfdf5' },
  'Maintenance': { icon: BuildIcon, color: '#f97316', bg: '#fff7ed' },
  'Dining & F&B': { icon: RestaurantIcon, color: '#a855f7', bg: '#f3e8ff' },
  'Security & Front Desk': { icon: SecurityIcon, color: '#2e7d32', bg: '#edf7ed' },
  'General': { icon: HubIcon, color: '#64748b', bg: '#f1f5f9' },
};
const DEFAULT_DEPARTMENT = 'VIP Arrivals';

const PRIORITY_STYLES = {
  Critical: 'bg-[#fee2e2] text-[#dc2626]',
  High: 'bg-[#ffedd5] text-[#ea580c]',
  Medium: 'bg-[#edf7ed] text-[#2e7d32]',
  Low: 'bg-[#f1f5f9] text-[#64748b]',
};

const STATUS_STYLES = {
  Open: 'bg-white text-[#dc2626] border border-[#fecaca]',
  'In Progress': 'bg-white text-[#ea580c] border border-[#fed7aa]',
  Resolved: 'bg-white text-[#10b981] border border-[#a7f3d0]',
};

const PRIORITY_OPTIONS = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Resolved'];

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    fontSize: '11.5px',
    height: '28px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    height: '28px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '11.5px',
    color: '#6b7280',
    transform: 'translate(10px, 5px) scale(1)',
    '&.Mui-focused': { color: '#1b7f43' }
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(10px, -8px) scale(0.75)',
  },
};

export default function OperationsAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Broadcast Modal State (Fully controlled)
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDept, setAlertDept] = useState(DEFAULT_DEPARTMENT);
  const [alertPriority, setAlertPriority] = useState('High');
  const [alertLocation, setAlertLocation] = useState('');
  const [alertGuest, setAlertGuest] = useState('');
  const [alertAssignedTo, setAlertAssignedTo] = useState('');
  const [alertAction, setAlertAction] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [broadcastSentMsg, setBroadcastSentMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await operationsAlertService.getOperationsAlerts();
      const rawList = Array.isArray(res?.data)
        ? res.data
        : (Array.isArray(res) ? res : (res?.data?.alerts || []));
      const adapted = toFrontendOperationsAlertList(rawList);
      setAlerts(adapted);
    } catch (err) {
      setError(err?.message || 'Failed to load operations alerts from server.');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // ---- Derived summary counts (live — computed reactively from backend records) ----
  const activeCount = alerts.filter(a => a.status !== 'Resolved').length;
  const criticalCount = alerts.filter(a => a.priority === 'Critical' && a.status !== 'Resolved').length;
  const inProgressCount = alerts.filter(a => a.status === 'In Progress').length;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved').length;

  const departmentLoad = useMemo(() => {
    return Object.keys(DEPARTMENTS).map(dept => {
      const active = alerts.filter(a => a.department === dept && a.status !== 'Resolved').length;
      return { dept, active };
    });
  }, [alerts]);
  const maxLoad = Math.max(1, ...departmentLoad.map(d => d.active));

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (deptFilter !== 'All' && a.department !== deptFilter) return false;
      if (priorityFilter !== 'All' && a.priority !== priorityFilter) return false;
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = (a.title && a.title.toLowerCase().includes(q)) ||
          (a.location && a.location.toLowerCase().includes(q)) ||
          (a.guest && a.guest.toLowerCase().includes(q)) ||
          (a.id && a.id.toLowerCase().includes(q)) ||
          (a.reportedBy && a.reportedBy.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [alerts, deptFilter, priorityFilter, statusFilter, searchQuery]);

  const handleReset = () => {
    setSearchQuery('');
    setDeptFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
  };

  const handleEscalate = async (alert) => {
    const alertId = alert._id || alert.id;
    if (!alertId || actionLoadingId) return;
    setActionLoadingId(alertId);
    try {
      const payload = toBackendOperationsAlertPayload({ severity: 'Critical' }, { isUpdate: true });
      const res = await operationsAlertService.updateOperationsAlert(alertId, payload);
      const updated = toFrontendOperationsAlert(res?.data?.alert || res?.data || res);
      setAlerts(prev => prev.map(a => (a._id === alertId || a.id === alertId) ? updated : a));
    } catch (err) {
      setError(err?.message || 'Failed to escalate alert urgency.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcknowledge = async (alert) => {
    const alertId = alert._id || alert.id;
    if (!alertId || actionLoadingId) return;
    setActionLoadingId(alertId);
    try {
      const payload = toBackendOperationsAlertPayload({ status: 'In Progress' }, { isUpdate: true });
      const res = await operationsAlertService.updateOperationsAlert(alertId, payload);
      const updated = toFrontendOperationsAlert(res?.data?.alert || res?.data || res);
      setAlerts(prev => prev.map(a => (a._id === alertId || a.id === alertId) ? updated : a));
    } catch (err) {
      setError(err?.message || 'Failed to acknowledge alert.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResolve = async (alert) => {
    const alertId = alert._id || alert.id;
    if (!alertId || actionLoadingId) return;
    setActionLoadingId(alertId);
    try {
      const payload = toBackendOperationsAlertPayload({ status: 'Resolved' }, { isUpdate: true });
      const res = await operationsAlertService.updateOperationsAlert(alertId, payload);
      const updated = toFrontendOperationsAlert(res?.data?.alert || res?.data || res);
      setAlerts(prev => prev.map(a => (a._id === alertId || a.id === alertId) ? updated : a));
    } catch (err) {
      setError(err?.message || 'Failed to resolve alert.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetModalForm = () => {
    setAlertTitle('');
    setAlertDept(DEFAULT_DEPARTMENT);
    setAlertPriority('High');
    setAlertLocation('');
    setAlertGuest('');
    setAlertAssignedTo('');
    setAlertAction('');
    setAlertDescription('');
    setModalError(null);
  };

  const handleSendBroadcast = async () => {
    if (!alertTitle.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setModalError(null);

    try {
      const rawFormData = {
        title: alertTitle.trim(),
        message: alertDescription.trim() || 'Broadcast message triggered manually via Front Office Dashboard.',
        department: alertDept,
        priority: alertPriority,
        status: 'Open',
        action_required: alertAction.trim() || 'Acknowledge and proceed as instructed.',
        location: alertLocation.trim() || 'Front Desk Broadcast',
        guest_name: alertGuest.trim() || 'Multiple/None',
        reported_by: 'Front Office',
        assigned_to: alertAssignedTo.trim() || `${alertDept} Team`,
      };

      const payload = toBackendOperationsAlertPayload(rawFormData);
      const res = await operationsAlertService.createOperationsAlert(payload);
      const createdDoc = res?.data?.alert || res?.data || res;
      const adapted = toFrontendOperationsAlert(createdDoc);

      setAlerts(prev => [adapted, ...prev]);
      setBroadcastOpen(false);
      resetModalForm();
      setBroadcastSentMsg(`Broadcast "${adapted.title}" dispatched and saved successfully.`);
      setTimeout(() => setBroadcastSentMsg(''), 4000);
    } catch (err) {
      setModalError(err?.message || 'Failed to dispatch alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-2.5 pb-3">
      {/* Error Alert Banner */}
      {error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchAlerts}
            className="px-2.5 py-1 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors cursor-pointer text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-0.5">
        <div className="bg-white p-2.5 sm:p-3 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{activeCount}</div>
            <div className="text-xs text-gray-500 font-medium whitespace-nowrap">Active Alerts</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <NotificationsIcon sx={{ fontSize: 17 }} />
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{criticalCount}</div>
            <div className="text-xs text-gray-500 font-medium whitespace-nowrap">Critical & Urgent</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 shrink-0">
            <ReportProblemIcon sx={{ fontSize: 17 }} />
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{inProgressCount}</div>
            <div className="text-xs text-gray-500 font-medium whitespace-nowrap">In Progress</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600 shrink-0">
            <PendingActionsIcon sx={{ fontSize: 17 }} />
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{resolvedCount}</div>
            <div className="text-xs text-gray-500 font-medium whitespace-nowrap">Resolved Today</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 text-green-600 shrink-0">
            <TaskAltIcon sx={{ fontSize: 17 }} />
          </div>
        </div>
      </div>

      {/* DEPARTMENT OPERATIONS LOAD */}
      <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-3">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Department Operations Load</h2>
          </div>
          <span className="text-gray-400 font-normal text-[11px]">Click a department to filter active tickets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {departmentLoad.map(({ dept, active }) => {
            const theme = DEPARTMENTS[dept] ?? DEPARTMENTS[DEFAULT_DEPARTMENT];
            const isActive = deptFilter === dept;
            return (
              <button
                key={dept}
                onClick={() => setDeptFilter(isActive ? 'All' : dept)}
                className={`text-left border rounded-[6px] p-2.5 flex flex-col gap-1.5 transition-all cursor-pointer ${
                  isActive ? 'border-[#1b7f43] ring-1 ring-[#1b7f43]/30 bg-[#edf7ed]' : 'border-gray-100 hover:border-gray-200 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-slate-800 font-bold text-[12px] leading-tight truncate">{dept}</span>
                    <span className="text-gray-500 font-normal text-[10.5px]">{active} active</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200/80 rounded-full h-[5px] mt-0.5">
                  <div
                    className="h-[5px] rounded-full transition-all"
                    style={{ width: `${Math.round((active / maxLoad) * 100)}%`, backgroundColor: active > 0 ? theme.color : '#cbd5e1' }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH BAR & FILTERS */}
      <div className="bg-white rounded-[6px] border border-gray-100 shadow-sm p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts by task, room, guest, or staff..."
                className="w-full pl-8 pr-3 py-1 border border-gray-200 rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow h-[28px]"
              />
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
            </div>
            <span className="text-[#1b7f43] bg-[#edf7ed] text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {filteredAlerts.length} matching
            </span>
          </div>

          {/* Right Action */}
          <button
            onClick={() => setBroadcastOpen(true)}
            className="flex items-center gap-1.5 bg-[#1b7f43] hover:brightness-105 text-white px-3 h-[28px] rounded-[6px] text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <CampaignIcon sx={{ fontSize: 15 }} />
            Broadcast Alert
          </button>
        </div>

        {broadcastSentMsg && (
          <p className="text-xs font-semibold text-[#10b981] flex items-center gap-1 mt-2">
            {broadcastSentMsg}
          </p>
        )}

        {/* FILTER CHIPS + DROPDOWNS */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setDeptFilter('All')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                deptFilter === 'All' ? 'bg-[#1b7f43] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.keys(DEPARTMENTS).map(dept => (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                  deptFilter === dept ? 'bg-[#1b7f43] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Dropdown
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              fullWidth={false}
              formControlSx={{ minWidth: 90, ...muiSelectSx }}
              optionSx={{ fontSize: 11.5 }}
            />
            <Dropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth={false}
              formControlSx={{ minWidth: 90, ...muiSelectSx }}
              optionSx={{ fontSize: 11.5 }}
            />
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 h-[28px] border border-gray-200 rounded-[6px] text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ALERTS LIST */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="bg-white rounded-[6px] border border-gray-100 p-8 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-[#1b7f43] border-t-transparent rounded-full animate-spin" />
            <span>Loading operations alerts...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-[6px] border border-gray-100 p-8 text-center text-gray-400 text-xs">
            No alerts match your current filters.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isResolved = alert.status === 'Resolved';
            const alertId = alert._id || alert.id;
            const isActionLoading = actionLoadingId === alertId;

            return (
              <div key={alertId} className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2.5 mb-1.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <h3 className="text-[13px] font-bold text-slate-800 leading-tight">{alert.title}</h3>
                        <span className="text-[9.5px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded font-mono">{alert.id}</span>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-[4px] whitespace-nowrap ${PRIORITY_STYLES[alert.priority] || 'bg-gray-100 text-gray-700'}`}>{alert.priority}</span>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-[4px] whitespace-nowrap ${STATUS_STYLES[alert.status] || 'bg-gray-100 text-gray-700'}`}>{alert.status}</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10.5px] text-gray-500 font-normal">
                        <span className="flex items-center gap-1">{alert.time}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">{alert.location}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">{alert.guest}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">By {alert.reportedBy} ({alert.reportedAgo})</span>
                      </div>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#1b7f43] border border-[#a7f3d0] bg-[#edf7ed] px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                    {alert.assignedTo}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11.5px] text-gray-600 leading-normal my-1.5">{alert.description}</p>

                {/* Action Required box */}
                <div className="bg-[#edf7ed] border border-[#d1fae5] rounded-[6px] px-2.5 py-1.5 mb-2 flex items-start gap-1.5">
                  <p className="text-[11px] text-[#1b7f43] leading-snug">
                    <span className="font-bold">Action Required:</span> {alert.action}
                  </p>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-50">
                  {isResolved ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#10b981]">
                      <CheckCircleIcon sx={{ fontSize: 13 }} /> Resolved
                    </span>
                  ) : alert.priority !== 'Critical' ? (
                    <button
                      onClick={() => handleEscalate(alert)}
                      disabled={isActionLoading}
                      className="flex items-center gap-1 text-[10.5px] font-bold text-[#ef4444] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isActionLoading ? 'Updating...' : 'Escalate Urgency'}
                    </button>
                  ) : <span />}

                  {!isResolved && (
                    <div className="flex items-center gap-1.5">
                      {alert.status !== 'In Progress' && (
                        <button
                          onClick={() => handleAcknowledge(alert)}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-1 bg-[#1b7f43] hover:brightness-105 text-white px-2.5 py-0.5 rounded-[4px] text-[10.5px] font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isActionLoading ? 'Updating...' : 'Acknowledge'}
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(alert)}
                        disabled={isActionLoading}
                        className="inline-flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-0.5 rounded-[4px] text-[10.5px] font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isActionLoading ? 'Updating...' : 'Mark Resolved'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BROADCAST ALERT MODAL */}
      {broadcastOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => !isSubmitting && setBroadcastOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-[650px] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#2e7d32] p-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-[50px] h-[50px] rounded-full border border-white/30 bg-white/10 flex items-center justify-center shrink-0">
                  <CampaignIcon sx={{ fontSize: 24 }} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white text-[18px] font-bold leading-tight mb-1">Dispatch Operations Alert</h2>
                  <p className="text-green-100 text-[12px] font-medium leading-tight">Broadcast critical task to hotel operational staff</p>
                </div>
              </div>
              <button
                disabled={isSubmitting}
                onClick={() => setBroadcastOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {modalError && (
                <div role="alert" className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                  {modalError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Row 1 */}
                <div className="col-span-1">
                  <TextField 
                    fullWidth 
                    label="Alert Title / Summary*" 
                    variant="outlined" 
                    size="small"
                    value={alertTitle} 
                    onChange={(e) => setAlertTitle(e.target.value)}
                    disabled={isSubmitting}
                    InputProps={{ startAdornment: <InputAdornment position="start"><NotificationsIcon sx={{ fontSize: 16 }} /></InputAdornment> }}
                  />
                </div>
                <div className="hidden md:block"></div>

                {/* Row 2 */}
                <FormControl fullWidth size="small">
                  <InputLabel>Department / Category*</InputLabel>
                  <Select 
                    label="Department / Category*" 
                    value={alertDept} 
                    onChange={(e) => setAlertDept(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <MenuItem value="VIP Arrivals">VIP Arrivals</MenuItem>
                    <MenuItem value="Housekeeping">Housekeeping</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Dining & F&B">Dining &amp; F&amp;B</MenuItem>
                    <MenuItem value="Security & Front Desk">Security &amp; Front Desk</MenuItem>
                    <MenuItem value="General">General</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small">
                  <InputLabel>Priority Level*</InputLabel>
                  <Select 
                    label="Priority Level*" 
                    value={alertPriority} 
                    onChange={(e) => setAlertPriority(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <MenuItem value="Critical">Critical</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>

                {/* Row 3 */}
                <TextField 
                  fullWidth 
                  label="Room / Location (Optional)" 
                  variant="outlined" 
                  size="small"
                  value={alertLocation}
                  onChange={(e) => setAlertLocation(e.target.value)}
                  disabled={isSubmitting}
                  InputProps={{ startAdornment: <InputAdornment position="start"><RoomIcon sx={{ fontSize: 16 }} /></InputAdornment> }}
                />
                <TextField 
                  fullWidth 
                  label="Guest Name (Optional)" 
                  variant="outlined" 
                  size="small"
                  value={alertGuest}
                  onChange={(e) => setAlertGuest(e.target.value)}
                  disabled={isSubmitting}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 16 }} /></InputAdornment> }}
                />

                {/* Row 4 */}
                <div className="col-span-1">
                  <TextField 
                    fullWidth 
                    label="Assign To Staff / Team (Optional)" 
                    variant="outlined" 
                    size="small"
                    value={alertAssignedTo}
                    onChange={(e) => setAlertAssignedTo(e.target.value)}
                    disabled={isSubmitting}
                    InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ fontSize: 16 }} /></InputAdornment> }}
                  />
                </div>
                <div className="hidden md:block"></div>

                {/* Row 5 */}
                <div className="col-span-1">
                  <TextField 
                    fullWidth 
                    label="Specific Action Required*" 
                    variant="outlined" 
                    size="small"
                    value={alertAction}
                    onChange={(e) => setAlertAction(e.target.value)}
                    disabled={isSubmitting}
                    InputProps={{ startAdornment: <InputAdornment position="start"><TaskAltIcon sx={{ fontSize: 16 }} /></InputAdornment> }}
                  />
                </div>
                <div className="hidden md:block"></div>

                {/* Row 6 */}
                <div className="col-span-1 md:col-span-2">
                  <TextField 
                    fullWidth 
                    label="Detailed Operational Instructions / Description*" 
                    variant="outlined" 
                    multiline 
                    rows={3}
                    value={alertDescription}
                    onChange={(e) => setAlertDescription(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-6 mt-2">
              <button
                disabled={isSubmitting}
                onClick={() => { setBroadcastOpen(false); resetModalForm(); }}
                className="text-[#1b7f43] text-[13px] font-bold hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={!alertTitle.trim() || isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#2e7d32] hover:bg-[#1b5e20] disabled:opacity-50 text-white text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <SendIcon sx={{ fontSize: 15 }} />
                {isSubmitting ? 'Broadcasting...' : 'Broadcast Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
