import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function DeleteStaffConfirmationModal({
  open,
  staffName,
  onClose,
  onConfirm,
  isDeleting = false
}) {
  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          p: 1
        }
      }}
    >
      <DialogContent className="text-center pt-6 pb-2">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
          <WarningAmberRoundedIcon sx={{ fontSize: 28 }} />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1.5">
          Terminate Staff Member?
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto">
          Are you sure you want to terminate <strong className="text-gray-800">{staffName}</strong>?
          Their employment record will be updated to Terminated.
        </p>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, justifyContent: 'center', gap: 1.5 }}>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          {isDeleting ? (
            <>
              <CircularProgress size={14} color="inherit" />
              <span>Terminating...</span>
            </>
          ) : (
            <span>Yes, Terminate Staff</span>
          )}
        </button>
      </DialogActions>
    </Dialog>
  );
}
