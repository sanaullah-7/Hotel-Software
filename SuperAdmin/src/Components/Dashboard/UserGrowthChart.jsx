import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const tooltipStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-lg)' };

export default function UserGrowthChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="managers"      name="Managers"      stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="receptionists" name="Receptionists" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
