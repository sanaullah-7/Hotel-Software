import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import api from '../../api/client.js';

export default function StayOperations() {
  const [stays, setStays] = useState([]);
  const [form, setForm] = useState({ reservation_id: '', room_id: '', primary_guest_id: '', total_guests: 1, notes: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { const response = await api.get('/hotel/stays', { limit: 200 }); setStays(response.data || []); }
    catch (err) { setError(err.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const checkIn = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await api.post('/hotel/stays/check-in', Object.fromEntries(Object.entries(form).filter(([, value]) => value !== '')));
      setForm({ reservation_id: '', room_id: '', primary_guest_id: '', total_guests: 1, notes: '' });
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const checkOut = async id => {
    setBusy(true); setError('');
    try { await api.post(`/hotel/stays/${id}/check-out`, {}); await load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return <div className="animate-fade-in p-4 space-y-5">
    <div><h1 className="text-2xl font-bold text-slate-900">Check-in / Check-out</h1><p className="text-sm text-slate-500">Live stay operations saved to MongoDB</p></div>
    {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
    <form onSubmit={checkIn} className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3">
      <TextField required label="Reservation ID" value={form.reservation_id} onChange={e => setForm({...form, reservation_id:e.target.value})} />
      <TextField label="Room ID (optional)" value={form.room_id} onChange={e => setForm({...form, room_id:e.target.value})} />
      <TextField label="Guest ID (optional)" value={form.primary_guest_id} onChange={e => setForm({...form, primary_guest_id:e.target.value})} />
      <TextField type="number" label="Total guests" value={form.total_guests} inputProps={{ min: 1 }} onChange={e => setForm({...form, total_guests:Number(e.target.value)})} />
      <TextField label="Notes" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
      <Button disabled={busy} type="submit" variant="contained">Check in guest</Button>
    </form>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Stay</th><th className="p-3 text-left">Reservation</th><th className="p-3 text-left">Guest</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Arrival</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{stays.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-500">No stays found.</td></tr> : stays.map(stay => <tr key={stay._id} className="border-t"><td className="p-3">{stay.stay_number || stay._id}</td><td className="p-3">{stay.reservation_id?._id || stay.reservation_id}</td><td className="p-3">{stay.primary_guest_id?.first_name ? `${stay.primary_guest_id.first_name} ${stay.primary_guest_id.last_name}` : stay.primary_guest_id?._id || stay.primary_guest_id}</td><td className="p-3">{stay.status}</td><td className="p-3">{stay.actual_check_in ? new Date(stay.actual_check_in).toLocaleString() : '—'}</td><td className="p-3 text-right">{stay.status === 'IN_HOUSE' && <Button disabled={busy} color="warning" onClick={() => checkOut(stay._id)}>Check out</Button>}</td></tr>)}</tbody></table></div>
  </div>;
}
