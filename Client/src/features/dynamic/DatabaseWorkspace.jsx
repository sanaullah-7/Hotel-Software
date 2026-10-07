import { useCallback, useEffect, useMemo, useState } from 'react';
import { Add, DeleteOutlined, EditOutlined, Refresh, Search } from '@mui/icons-material';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import dataService from '../../services/dataService.js';
import api from '../../api/client.js';

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length} items` : value.name || value._id || 'Details';
  if (/^\d{4}-\d{2}-\d{2}T/.test(String(value))) return new Date(value).toLocaleString();
  return String(value);
};

const normalizePayload = (form, fields) => Object.fromEntries(fields.map(field => {
  let value = form[field.name];
  if (field.type === 'number' && value !== '') value = Number(value);
  if (field.type === 'json' && value !== '') value = JSON.parse(value);
  if (value === 'true') value = true;
  if (value === 'false') value = false;
  return [field.name, value];
}).filter(([, value]) => value !== ''));

export default function DatabaseWorkspace({ config }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = config.path ? await api.get(config.path, { limit: 200 }) : await dataService.list(config.resource, { limit: 200 });
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [config.path, config.resource]);

  useEffect(() => { load(); }, [load]);

  const columns = useMemo(() => {
    const configured = config.fields.map(field => field.name);
    const available = configured.filter(key => records.some(record => record[key] !== undefined));
    return available.length ? available.slice(0, 7) : Object.keys(records[0] || {}).filter(key => !['hotelId','__v'].includes(key)).slice(0, 7);
  }, [records, config.fields]);
  const filtered = records.filter(record => JSON.stringify(record).toLowerCase().includes(search.toLowerCase()));

  const beginCreate = () => { setEditing(null); setForm({}); setOpen(true); };
  const beginEdit = record => {
    setEditing(record);
    setForm(Object.fromEntries(config.fields.map(field => [field.name, field.type === 'date' && record[field.name] ? String(record[field.name]).slice(0,10) : record[field.name] ?? ''])));
    setOpen(true);
  };
  const save = async () => {
    try {
      const payload = normalizePayload(form, config.fields);
      if (config.path) {
        if (editing) await api.put(`${config.path}/${editing._id}`, payload);
        else await api.post(config.path, payload);
      } else if (editing) await dataService.update(config.resource, editing._id, payload);
      else await dataService.create(config.resource, payload);
      setOpen(false); await load();
    } catch (err) { setError(err.message); }
  };
  const remove = async record => {
    if (!window.confirm(`Delete this ${config.title.toLowerCase()} record?`)) return;
    try { config.path ? await api.delete(`${config.path}/${record._id}`) : await dataService.remove(config.resource, record._id); await load(); }
    catch (err) { setError(err.message); }
  };
  const cancel = async record => {
    const reason = window.prompt('Cancellation reason (optional)');
    if (reason === null) return;
    try { await api.post(`${config.path}/${record._id}/cancel`, { cancellation_reason: reason }); await load(); }
    catch (err) { setError(err.message); }
  };

  return <div className="animate-fade-in p-4 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900">{config.title}</h1><p className="text-sm text-slate-500">Live data from MongoDB</p></div>
      <div className="flex gap-2">
        <Button onClick={load} startIcon={<Refresh />} variant="outlined">Refresh</Button>
        {!config.readOnly && <Button onClick={beginCreate} startIcon={<Add />} variant="contained">Add record</Button>}
      </div>
    </div>
    {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
    <TextField value={search} onChange={e => setSearch(e.target.value)} size="small" placeholder="Search live records" slotProps={{ input: { startAdornment: <Search className="mr-2 text-slate-400" /> } }} />
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm"><thead className="bg-slate-50"><tr>{columns.map(column => <th key={column} className="px-4 py-3 text-left font-semibold capitalize">{column.replaceAll('_',' ')}</th>)}{!config.readOnly && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead>
      <tbody>{loading ? <tr><td colSpan={columns.length + 1} className="p-8 text-center">Loading…</td></tr> : filtered.length === 0 ? <tr><td colSpan={columns.length + 1} className="p-8 text-center text-slate-500">No database records found.</td></tr> : filtered.map(record => <tr key={record._id} className="border-t border-slate-100">{columns.map(column => <td key={column} className="max-w-xs truncate px-4 py-3">{formatValue(record[column])}</td>)}{!config.readOnly && <td className="whitespace-nowrap px-4 py-3 text-right">{config.allowEdit !== false && <button aria-label="Edit" onClick={() => beginEdit(record)} className="p-2 text-blue-600"><EditOutlined fontSize="small" /></button>}{config.cancelable && record.status !== 'CANCELLED' && <Button size="small" color="warning" onClick={() => cancel(record)}>Cancel</Button>}{config.allowDelete !== false && <button aria-label="Delete" onClick={() => remove(record)} className="p-2 text-red-600"><DeleteOutlined fontSize="small" /></button>}</td>}</tr>)}</tbody></table>
    </div>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{editing ? 'Edit' : 'Add'} {config.title}</DialogTitle><DialogContent className="space-y-4 pt-3!">{config.fields.map(field => field.type === 'select' ? <TextField key={field.name} select fullWidth label={field.label} required={field.required} value={form[field.name] ?? ''} onChange={e => setForm(previous => ({...previous,[field.name]:e.target.value}))}>{field.options.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}</TextField> : <TextField key={field.name} fullWidth type={field.type} label={field.label} required={field.required} value={form[field.name] ?? ''} onChange={e => setForm(previous => ({...previous,[field.name]:e.target.value}))} slotProps={field.type === 'date' ? { inputLabel: { shrink: true } } : undefined} />)}</DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} variant="contained">Save</Button></DialogActions></Dialog>
  </div>;
}


