import { useState } from 'react';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import ReceptionistFilter from '../../Components/Receptionist/ReceptionistFilter.jsx';
import ReceptionistTable from '../../Components/Receptionist/ReceptionistTable.jsx';
import ReceptionistDetails from '../../Components/Receptionist/ReceptionistDetails.jsx';
import ConfirmModal from '../../Components/Common/confirmModel.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import { useReceptionist } from '../../Hooks/useReceptionist.js';
import { Users, UserCheck, Clock, UserX } from 'lucide-react';

export default function Receptionist() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const {
    receptionists,
    total,
    loading,
    activateReceptionist,
    suspendReceptionist,
  } = useReceptionist({ page, limit: 10, search, status });

  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [actionType, setActionType] = useState(null);

  const handleOpenConfirm = (rec, type) => {
    setConfirmTarget(rec);
    setActionType(type);
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    if (actionType === 'suspend') {
      await suspendReceptionist(confirmTarget.id, 'Administrative action');
    } else {
      await activateReceptionist(confirmTarget.id);
    }
    setConfirmTarget(null);
    setActionType(null);
  };

  const activeCount = receptionists.filter((r) => r.status === 'ACTIVE').length;
  const pendingCount = receptionists.filter((r) => r.status === 'PENDING').length;
  const suspendedCount = receptionists.filter((r) => r.status === 'SUSPENDED').length;

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Receptionists & Front Desk Staff"
        subtitle="Manage hotel desk operators, receptionists, and booking clerks across Pakistan"
      />

      {/* Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Receptionists</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{total || receptionists.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Front Desk</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{activeCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Onboarding</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserX size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suspended Staff</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{suspendedCount}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 20 }}>
        <ReceptionistFilter
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />

        <ReceptionistTable
          receptionists={receptionists}
          loading={loading}
          onView={(r) => setSelectedReceptionist(r)}
          onActivate={(r) => handleOpenConfirm(r, 'activate')}
          onSuspend={(r) => handleOpenConfirm(r, 'suspend')}
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
      <ReceptionistDetails
        receptionist={selectedReceptionist}
        isOpen={Boolean(selectedReceptionist)}
        onClose={() => setSelectedReceptionist(null)}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmTarget)}
        onClose={() => {
          setConfirmTarget(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        title={actionType === 'suspend' ? 'Suspend Receptionist' : 'Reactivate Receptionist'}
        message={
          actionType === 'suspend'
            ? `Are you sure you want to suspend front desk staff member ${confirmTarget?.name}?`
            : `Are you sure you want to activate front desk staff member ${confirmTarget?.name}?`
        }
        confirmText={actionType === 'suspend' ? 'Suspend Account' : 'Reactivate'}
        isDestructive={actionType === 'suspend'}
      />
    </div>
  );
}
