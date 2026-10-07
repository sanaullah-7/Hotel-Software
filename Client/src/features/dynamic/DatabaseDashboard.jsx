import { useEffect, useState } from 'react';
import { Bed, EventAvailable, Hotel, Payments, People, ReceiptLong } from '@mui/icons-material';
import api from '../../api/client.js';

const SOURCES = [
  ['Rooms', '/hotel/rooms', Bed],
  ['Guests', '/hotel/guests', People],
  ['Reservations', '/hotel/reservations', EventAvailable],
  ['Current Stays', '/hotel/stays', Hotel],
  ['Invoices', '/hotel/invoices', ReceiptLong],
  ['Payments', '/hotel/payments', Payments],
];

export default function DatabaseDashboard() {
  const [metrics, setMetrics] = useState({});
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all(SOURCES.map(async ([label, path]) => {
      const response = await api.get(path, { limit: 200 });
      return [label, Number(response.meta?.total ?? response.data?.length ?? 0)];
    })).then(entries => active && setMetrics(Object.fromEntries(entries))).catch(err => active && setError(err.message));
    return () => { active = false; };
  }, []);
  return <div className="p-4 space-y-5"><div><h1 className="text-2xl font-bold">Hotel Dashboard</h1><p className="text-sm text-slate-500">Live operational totals from MongoDB</p></div>{error && <div className="rounded-lg bg-red-50 p-3 text-red-700">{error}</div>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{SOURCES.map(([label,,Icon]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><Icon className="text-emerald-600" /></div><div className="mt-3 text-3xl font-bold">{metrics[label] ?? '…'}</div></div>)}</div></div>;
}

