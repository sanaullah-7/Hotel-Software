export default function NotificationBadge({ count = 0 }) {
  if (count <= 0) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 18,
        height: 18,
        padding: '0 5px',
        borderRadius: 999,
        background: '#ef4444',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
