import { useState, useEffect } from 'react';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import TicketFilters from '../../Components/Support/TicketFilters.jsx';
import TicketTable from '../../Components/Support/TicketTable.jsx';
import TicketDetails from '../../Components/Support/TicketDetails.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import { SupportService } from '../../Services/SupportService.js';
import { MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function SupportTicket() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await SupportService.getTickets({ status, priority, search, page, limit: 10 });
      setTickets(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [status, priority, search, page]);

  const handleReply = async (ticketId, message) => {
    await SupportService.replyTicket(ticketId, message);
    const updated = await SupportService.getTicketById(ticketId);
    setSelectedTicket(updated);
    fetchTickets();
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    await SupportService.updateTicketStatus(ticketId, newStatus);
    const updated = await SupportService.getTicketById(ticketId);
    setSelectedTicket(updated);
    fetchTickets();
  };

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Support & Inquiries"
        subtitle="Manage tickets and questions submitted by hotel staff and property managers"
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Tickets</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{total || tickets.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Open Tickets</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{openCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>In Progress</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{inProgressCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resolved</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{resolvedCount}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <TicketFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          priority={priority}
          onPriorityChange={setPriority}
        />

        <TicketTable
          tickets={tickets}
          loading={loading}
          onView={(t) => setSelectedTicket(t)}
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

      <TicketDetails
        ticket={selectedTicket}
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        onReply={handleReply}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
