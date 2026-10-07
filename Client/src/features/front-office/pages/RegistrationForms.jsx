import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Description from '@mui/icons-material/Description';
import Search from '@mui/icons-material/Search';
import FileDownload from '@mui/icons-material/FileDownload';
import Add from '@mui/icons-material/Add';
import Print from '@mui/icons-material/Print';
import Visibility from '@mui/icons-material/Visibility';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { registrationFormService } from '../../../services/registrationFormService';

export default function RegistrationForms() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [formsList, setFormsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await registrationFormService.getRegistrationForms();
      const rawData = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const mapped = rawData.map(f => ({
        id: f._id,
        formNo: f.form_no || f.formNo || 'REG-FORM',
        guest: f.guest_name || f.guest || 'Guest',
        idType: f.id_type || f.idType || 'ID',
        idNumber: f.id_number || f.idNumber || 'N/A',
        room: f.room_number || f.room || 'N/A',
        date: f.completed_at ? new Date(f.completed_at).toLocaleDateString() : (f.created_at ? new Date(f.created_at).toLocaleDateString() : new Date().toLocaleDateString()),
        status: f.status || 'Signed & Verified',
        termsAccepted: f.terms_accepted,
        raw: f,
      }));
      setFormsList(mapped);
    } catch (err) {
      console.error('Failed to load registration forms from backend:', err);
      setSnackbar({ open: true, message: 'Failed to load registration forms from database.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this registration form?')) return;
    try {
      await registrationFormService.deleteRegistrationForm(id);
      setSnackbar({ open: true, message: 'Registration form deleted successfully.', severity: 'info' });
      fetchForms();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to delete registration form', severity: 'error' });
    }
  };

  const handlePrint = (form, e) => {
    e?.stopPropagation();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Registration Form - ${form.formNo}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #1b7f43; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #1b7f43; font-size: 24px; }
            .header p { margin: 4px 0 0; color: #666; font-size: 13px; }
            .section { margin-bottom: 20px; }
            .field { margin-bottom: 8px; font-size: 14px; }
            .field strong { display: inline-block; width: 160px; color: #111; }
            .badge { display: inline-block; padding: 4px 10px; background: #e2f8e9; color: #1b7f43; font-weight: bold; border-radius: 4px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #ccc; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HOTEL GUEST REGISTRATION FORM</h1>
            <p>Form ID: ${form.formNo} &bull; Generated on: ${new Date().toLocaleString()}</p>
          </div>
          <div class="section">
            <div class="field"><strong>Status:</strong> <span class="badge">${form.status}</span></div>
            <div class="field"><strong>Guest Name:</strong> ${form.guest}</div>
            <div class="field"><strong>ID / Document:</strong> ${form.idType} (${form.idNumber})</div>
            <div class="field"><strong>Allocated Room:</strong> Room ${form.room}</div>
            <div class="field"><strong>Registration Date:</strong> ${form.date}</div>
          </div>
          <div class="footer">
            <p>Guest Signature: _______________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Front Desk Officer: _______________________</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportCSV = () => {
    if (!formsList.length) return;
    const headers = ['Form ID', 'Guest Name', 'ID Type', 'Document No', 'Allocated Room', 'Registration Date', 'Status'];
    const rows = formsList.map(f => [
      `"${f.formNo}"`,
      `"${f.guest}"`,
      `"${f.idType}"`,
      `"${f.idNumber}"`,
      `"${f.room}"`,
      `"${f.date}"`,
      `"${f.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registration_forms_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredForms = formsList.filter(form => {
    const matchesSearch = form.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.formNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.idNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' ? true :
      activeTab === 'Verified' ? form.status.includes('Verified') :
      form.status.includes('Pending');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="animate-fade-in pb-4 space-y-2">
      <div className="h-1"></div>

      {/* REGISTRATION FORMS TABLE */}
      <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1 overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-2 sm:p-2.5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-2 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[13px] lg:text-[14px]">
            Registration Forms List
          </h3>

          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar */}
            <div className="relative w-28 md:w-40 xl:w-48 shrink">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 15 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
              />
            </div>

            {/* Segmented Filter Control */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {['All', 'Verified', 'Pending'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-1 text-[10.5px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10 font-bold' 
                      : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CSV Export Button */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center space-x-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded-lg text-[10.5px] font-bold shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <FileDownload sx={{ fontSize: 13 }} className="text-gray-500" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>
            
            <button 
              onClick={() => navigate('/front-office/registration-forms/new')}
              className="bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1 rounded-lg text-[10.5px] font-bold shadow-xs transition-all flex items-center cursor-pointer shrink-0"
            >
              <Add sx={{ fontSize: 14 }} className="mr-0.5" /> New Registration
            </button>
          </div>
        </div>

        <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700">Form ID</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700">Guest Name</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700">ID Type</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700">Document No</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700">Allocated Room</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700">Registration Date</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700">Status</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center">
                    <CircularProgress size={24} sx={{ color: '#1b7f43' }} />
                    <p className="text-gray-500 text-xs mt-2">Loading registration forms from database...</p>
                  </td>
                </tr>
              ) : filteredForms.length > 0 ? (
                filteredForms.map((form, idx) => (
                  <tr 
                    key={form.id || idx} 
                    onClick={() => { setSelectedForm(form); setViewModalOpen(true); }}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer border-b border-gray-50"
                  >
                    <td className="py-1.5 px-2.5 font-bold text-[11px] text-gray-800">{form.formNo}</td>
                    <td className="py-1.5 px-2.5 font-semibold text-[11.5px] text-gray-900">{form.guest}</td>
                    <td className="py-1.5 px-2.5 text-[11px] text-gray-600">{form.idType}</td>
                    <td className="py-1.5 px-2.5 text-[11px] text-gray-600">{form.idNumber}</td>
                    <td className="py-1.5 px-2.5 font-semibold text-[11.5px] text-gray-800">Room {form.room}</td>
                    <td className="py-1.5 px-2.5 text-[11px] text-gray-500">{form.date}</td>
                    <td className="py-1.5 px-2.5">
                      <span className={`px-1.5 py-0.5 text-[9.5px] font-bold rounded-sm ${
                        form.status.includes('Verified') ? 'bg-[#e2f8e9] text-[#1b7f43]' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {form.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5 text-center" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={(e) => handlePrint(form, e)}
                        title="Print Registration Form" 
                        className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer mr-0.5 rounded hover:bg-gray-100"
                      >
                        <Print sx={{ fontSize: 15 }} />
                      </button>
                      <button 
                        onClick={() => { setSelectedForm(form); setViewModalOpen(true); }}
                        title="View Details" 
                        className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer mr-0.5 rounded hover:bg-gray-100"
                      >
                        <Visibility sx={{ fontSize: 15 }} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(form.id, e)}
                        title="Delete Form" 
                        className="text-red-400 hover:text-red-600 p-1 cursor-pointer rounded hover:bg-red-50"
                      >
                        <DeleteOutlined sx={{ fontSize: 15 }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 text-[11.5px]">
                    No registration forms found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      <Dialog 
        open={viewModalOpen} 
        onClose={() => setViewModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '15px', color: '#1f2937', pb: 1, borderBottom: '1px solid #f3f4f6' }}>
          Registration Form Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedForm && (
            <div className="space-y-3 text-[12.5px] text-gray-700">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-500">Form Number:</span>
                <span className="font-bold text-gray-900">{selectedForm.formNo}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-500">Guest Name:</span>
                <span className="font-bold text-gray-900">{selectedForm.guest}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-500">ID Type:</span>
                <span>{selectedForm.idType}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-500">Document / ID Number:</span>
                <span className="font-mono text-gray-800">{selectedForm.idNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-500">Allocated Room:</span>
                <span className="font-semibold text-[#1b7f43]">Room {selectedForm.room}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-500">Registration Date:</span>
                <span>{selectedForm.date}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-500">Status:</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#e2f8e9] text-[#1b7f43]">
                  {selectedForm.status}
                </span>
              </div>
              {selectedForm.raw?.special_requests && (
                <div className="py-1">
                  <span className="font-semibold text-gray-500 block mb-1">Special Requests:</span>
                  <p className="bg-gray-50 p-2 rounded text-gray-600 text-xs">{selectedForm.raw.special_requests}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #f3f4f6' }}>
          {selectedForm && (
            <Button 
              onClick={(e) => handlePrint(selectedForm, e)} 
              variant="outlined" 
              size="small"
              startIcon={<Print sx={{ fontSize: 16 }} />}
              sx={{ borderColor: '#e5e7eb', color: '#374151', textTransform: 'none' }}
            >
              Print Form
            </Button>
          )}
          <Button 
            onClick={() => setViewModalOpen(false)} 
            variant="contained" 
            size="small"
            sx={{ backgroundColor: '#1b7f43', textTransform: 'none', '&:hover': { backgroundColor: '#166534' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
