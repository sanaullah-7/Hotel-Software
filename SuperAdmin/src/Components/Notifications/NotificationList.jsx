import NotificationItem from './NotificationItem.jsx';
import EmptyState from '../Common/EmptyState.jsx';
import { Bell } from 'lucide-react';

export default function NotificationList({ notifications = [], onMarkRead }) {
  if (!notifications.length) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications"
        description="You are all caught up! There are no unread system notifications."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />
      ))}
    </div>
  );
}
