import { useState } from 'react';
import Drawer from '../Common/Drawer.jsx';
import TicketStatusBadge from './TicketStatusBadge.jsx';
import { Send, Building2, Calendar } from 'lucide-react';

export default function TicketDetails({ ticket, isOpen, onClose, onReply, onStatusChange }) {
  const [replyText, setReplyText] = useState('');

  if (!ticket) return null;

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onReply) onReply(ticket.id, replyText);
    setReplyText('');
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Ticket ${ticket.id}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header summary */}
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{ticket.subject}</h3>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Building2 size={13} /> {ticket.hotelName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} /> {ticket.createdAt}
            </span>
          </div>
        </div>

        {/* Sender Info & Status Control */}
        <div className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{ticket.submittedBy}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ticket.email}</div>
          </div>
          {onStatusChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status:</span>
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                className="filter-select"
                style={{ padding: '4px 8px', fontSize: 12 }}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 14px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Conversation History
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
            {ticket.messages?.map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: msg.isStaff ? 'rgba(99,102,241,0.08)' : 'var(--bg-card-hover)',
                  border: msg.isStaff ? '1px solid rgba(99,102,241,0.2)' : '1px solid var(--border-color)',
                  marginLeft: msg.isStaff ? 20 : 0,
                  marginRight: msg.isStaff ? 0 : 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <strong style={{ color: msg.isStaff ? 'var(--accent-purple)' : 'inherit' }}>
                    {msg.sender}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>{msg.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Box */}
        <form onSubmit={handleSendReply} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Type your response to the hotel staff..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="search-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Send size={14} /> Send
          </button>
        </form>
      </div>
    </Drawer>
  );
}
