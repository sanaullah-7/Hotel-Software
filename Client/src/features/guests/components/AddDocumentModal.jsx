import React, { useState, useRef } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Close, DescriptionOutlined, UploadFileOutlined, CheckCircle, CloudUpload } from '@mui/icons-material';
import useModalFocus from '../../../components/common/useModalFocus';
import { fileService } from '../../../services/fileService';

const muiInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    color: '#6b7280',
    '&.Mui-focused': { color: '#1b7f43' }
  }
};

const DOC_TYPES = [
  'CNIC / National ID',
  'Profile Picture',
  'Passport',
  'Driver License',
  'Registration Form',
  'Visa Copy',
  'Corporate ID',
  'Other Document'
];

export default function AddDocumentModal({ isOpen, onClose, guest, defaultRoom, onSave }) {
  const { dialogRef, titleId } = useModalFocus({ open: isOpen, onClose });
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: 'National Identity / Document Scan',
    idType: 'CNIC / National ID',
    idNumber: '',
    room: defaultRoom || '101',
    status: 'Signed & Verified',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError(null);

    let documentUrl = '';

    try {
      if (selectedFile) {
        const folder = form.idType === 'Profile Picture' ? 'guests' : 'guest_documents';
        const uploadRes = await fileService.uploadFile(selectedFile, {
          folder,
          entity_ref: form.idType || 'GUEST_DOCUMENT'
        });
        documentUrl = uploadRes.file_url || '';
      }

      onSave({
        name: form.name,
        document_type: form.idType,
        idType: form.idType,
        document_number: form.idNumber.trim() || 'N/A',
        idNumber: form.idNumber.trim() || 'N/A',
        document_url: documentUrl,
        imageUrl: documentUrl,
        room_number: form.room,
        room: form.room,
        status: form.status,
        date: form.date,
        notes: form.notes
      });

      onClose();
    } catch (err) {
      console.error('Failed to upload document:', err);
      setUploadError(err.message || 'Failed to upload document file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[92vh] overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <UploadFileOutlined sx={{ fontSize: 20 }} />
            <div>
              <h2 id={titleId} className="text-[16px] font-bold">Attach Identity / Registration Document</h2>
              <p className="text-[11px] text-emerald-100 mt-0.5">Uploading for {guest?.name || 'Guest'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Close sx={{ fontSize: 18 }} />
          </button>
        </div>

        {uploadError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs border-b border-rose-100">
            {uploadError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-gray-200 hover:border-[#1b7f43] rounded-xl p-4 bg-gray-50/60 transition-colors flex flex-col items-center justify-center text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
            />
            {previewUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-28 object-contain rounded-lg border border-gray-200 shadow-2xs"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">{selectedFile?.name}</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-[#1b7f43] font-semibold hover:underline cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex flex-col items-center py-2"
              >
                <CloudUpload sx={{ fontSize: 32 }} className="text-gray-400 mb-1" />
                <p className="text-xs font-bold text-gray-700">Click to upload document photo or scan</p>
                <p className="text-[10.5px] text-gray-400 mt-0.5">JPEG, PNG, WEBP, or PDF (stored directly in Cloudinary)</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormControl size="small" fullWidth sx={muiInputSx}>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={form.idType}
                label="Document Type"
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({
                    ...form,
                    idType: val,
                    name: `${guest?.name || 'Guest'} ${val}`
                  });
                }}
              >
                {DOC_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Document / ID Number"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              placeholder="e.g. 42101-1234567-1 or USA-987654"
              sx={muiInputSx}
              size="small"
              fullWidth
            />

            <TextField
              label="Document Title / Reference"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={muiInputSx}
              size="small"
              fullWidth
            />

            <TextField
              label="Allocated Room"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              sx={muiInputSx}
              size="small"
              fullWidth
            />

            <FormControl size="small" fullWidth sx={muiInputSx}>
              <InputLabel>Verification Status</InputLabel>
              <Select
                value={form.status}
                label="Verification Status"
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <MenuItem value="Signed & Verified">Signed & Verified</MenuItem>
                <MenuItem value="Pending Signature">Pending Signature</MenuItem>
                <MenuItem value="Uploaded (Unverified)">Uploaded (Unverified)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="Registration Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              sx={muiInputSx}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <TextField
            label="Notes / Description"
            multiline
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Front desk verification or storage notes..."
            sx={muiInputSx}
            fullWidth
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-lg bg-[#1b7f43] text-white font-semibold text-xs hover:brightness-105 transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <CircularProgress size={14} color="inherit" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <span>Save Document</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
