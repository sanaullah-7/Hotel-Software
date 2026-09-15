import { useState } from 'react';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import ManagerFilters from '../../Components/Managers/ManagerFilters.jsx';
import ManagerTable from '../../Components/Managers/ManagerTable.jsx';
import ManagerDetails from '../../Components/Managers/ManagerDetails.jsx';
import ConfirmModal from '../../Components/Common/confirmModel.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import { useManager } from '../../Hooks/useManager.js';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

export default function Managers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const {
    managers,
    total,
    loading,
    activateManager,
    suspendManager,
  } = useManager({ page, limit: 10, search, status });

  const [selectedManager, setSelectedManager] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [actionType, setActionType] = useState(null); // 'activate' | 'suspend'

  const handleOpenConfirm = (mgr, type) => {
    setConfirmTarget(mgr);
    setActionType(type);
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    if (actionType === 'suspend') {
      await suspendManager(confirmTarget.id, 'Administrative suspension');
    } else {
      await activateManager(confirmTarget.id);
    }
    setConfirmTarget(null);
    setActionType(null);
  };

  // KPI calculations
  const activeCount = managers.filter((m) => m.status === 'ACTIVE').length;
  const pendingCount = managers.filter((m) => m.status === 'PENDING').length;
  const suspendedCount = managers.filter((m) => m.status === 'SUSPENDED').length;

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Hotel Managers"
        subtitle="Manage certified hotel administrators and property general managers across Pakistan"
      />

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Managers</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{total || managers.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{activeCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Review</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserX size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suspended</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{suspendedCount}</div>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="card" style={{ padding: 20 }}>
        <ManagerFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />

        <ManagerTable
          managers={managers}
          loading={loading}
          onView={(m) => setSelectedManager(m)}
          onActivate={(m) => handleOpenConfirm(m, 'activate')}
          onSuspend={(m) => handleOpenConfirm(m, 'suspend')}
        />

        <div style={{ marginTop: 16 }}>
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={10}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Drawer */}
      <ManagerDetails
        manager={selectedManager}
        isOpen={Boolean(selectedManager)}
        onClose={() => setSelectedManager(null)}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmTarget)}
        onClose={() => {
          setConfirmTarget(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        title={actionType === 'suspend' ? 'Suspend Manager Account' : 'Reactivate Manager Account'}
        message={
          actionType === 'suspend'
            ? `Are you sure you want to suspend manager account for ${confirmTarget?.name}? They will immediately lose access to their hotel control panel.`
            : `Are you sure you want to reactivate access for ${confirmTarget?.name}?`
        }
        confirmText={actionType === 'suspend' ? 'Suspend Account' : 'Reactivate'}
        isDestructive={actionType === 'suspend'}
      />
    </div>
  );
}
