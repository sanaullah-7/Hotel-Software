
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import CustomButton from './CustomButton';

/**
 * A reusable Modal component for confirmations or alerts.
 */
export default function ActionModal({ 
  open, 
  title, 
  description, 
  onClose, 
  onConfirm, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary'
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="text-gray-800 font-bold">{title}</DialogTitle>
      
      <DialogContent>
        <DialogContentText className="text-gray-600 mt-2">
          {description}
        </DialogContentText>
      </DialogContent>

      <DialogActions className="p-4 bg-gray-50 border-t border-gray-100">
        <CustomButton onClick={onClose} variant="outlined" color="inherit">
          {cancelText}
        </CustomButton>
        <CustomButton onClick={onConfirm} variant="contained" color={confirmColor}>
          {confirmText}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
