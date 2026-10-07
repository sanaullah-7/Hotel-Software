import { useEffect, useState } from 'react';
import { Alert, Button, MenuItem, TextField } from '@mui/material';
import { settingsService } from '../../services/dataService.js';

const PROFILE_FIELDS = ['property_name','legal_name','email','phone','address','city','country','currency','timezone','logo_url'];
const POLICY_FIELDS = ['check_in_time','check_out_time','cancellation_policy','early_checkin_policy','late_checkout_policy','no_show_policy','pet_policy','smoking_policy','age_policy'];

export default function DatabaseSettings({ type }) {
  const profile = type === 'profile';
  const fields = profile ? PROFILE_FIELDS : POLICY_FIELDS;
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { (profile ? settingsService.getProfile() : settingsService.getPolicies()).then(response => setForm(response.data || {})).catch(err => setError(err.message)); }, [profile]);
  const save = async event => {
    event.preventDefault(); setError(''); setMessage('');
    try { const response = profile ? await settingsService.updateProfile(form) : await settingsService.updatePolicies(form); setForm(response.data); setMessage('Saved to the shared database.'); }
    catch (err) { setError(err.message); }
  };
  return <form onSubmit={save} className="p-4 space-y-4"><div><h1 className="text-2xl font-bold">{profile ? 'Hotel Profile' : 'Hotel Policies'}</h1><p className="text-sm text-slate-500">These settings are loaded from MongoDB.</p></div>{error && <Alert severity="error">{error}</Alert>}{message && <Alert severity="success">{message}</Alert>}<div className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-2">{fields.map(field => <TextField key={field} label={field.replaceAll('_',' ')} value={form[field] ?? ''} onChange={e => setForm(previous => ({...previous,[field]:e.target.value}))} />)}{!profile && <><TextField select label="ID verification required" value={String(form.id_verification_required ?? true)} onChange={e => setForm(previous => ({...previous,id_verification_required:e.target.value === 'true'}))}><MenuItem value="true">Yes</MenuItem><MenuItem value="false">No</MenuItem></TextField><TextField select label="Pets allowed" value={String(form.pets_allowed ?? false)} onChange={e => setForm(previous => ({...previous,pets_allowed:e.target.value === 'true'}))}><MenuItem value="true">Yes</MenuItem><MenuItem value="false">No</MenuItem></TextField></>}</div><Button type="submit" variant="contained">Save changes</Button></form>;
}
