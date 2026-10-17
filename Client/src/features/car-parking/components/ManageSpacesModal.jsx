import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { parkingService } from '../../../services/parkingService';
import { toFrontendSpaces } from '../adapters/parkingAdapter';
import { PARKING_UPDATED_EVENT } from '../state/carParkingStore';

export default function ManageSpacesModal({ open, onClose, onSuccess }) {
  const [spaces, setSpaces] = useState([]);
  const [newSpaceNumber, setNewSpaceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      refreshSpaces();
    }
  }, [open]);

  const refreshSpaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const backendSpaces = await parkingService.getSpaces();
      setSpaces(toFrontendSpaces(backendSpaces));
    } catch (err) {
      console.error('Failed to load parking spaces:', err);
      setError(err?.message || 'Failed to load spaces from server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSpace = async () => {
    const trimmed = newSpaceNumber.trim().toUpperCase();
    if (!trimmed) return;
    
    // Check if exists locally
    if (spaces.some((s) => s.number.toUpperCase() === trimmed)) {
      setError(`Parking space ${trimmed} already exists!`);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await parkingService.createSpace({ space_number: trimmed });
      setNewSpaceNumber('');
      await refreshSpaces();
      window.dispatchEvent(new Event(PARKING_UPDATED_EVENT));
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to add space:', err);
      setError(err?.message || 'Failed to create parking space');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpace = async (number, status, id) => {
    if (status === 'Occupied') {
      setError(`Cannot delete space ${number} because it is currently occupied.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete parking space ${number}?`)) {
      setError(null);
      try {
        await parkingService.deleteSpace(id || number);
        await refreshSpaces();
        window.dispatchEvent(new Event(PARKING_UPDATED_EVENT));
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error('Failed to delete space:', err);
        setError(err?.message || 'Failed to delete parking space');
      }
    }
  };

  const handleToggleBlock = async (number, status, id) => {
    if (status === 'Occupied') {
      setError(`Cannot block space ${number} because it is currently occupied.`);
      return;
    }
    const newStatus = status === 'Blocked' ? 'AVAILABLE' : 'BLOCKED';
    setError(null);
    try {
      await parkingService.updateSpaceStatus(id || number, newStatus);
      await refreshSpaces();
      window.dispatchEvent(new Event(PARKING_UPDATED_EVENT));
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to update space status:', err);
      setError(err?.message || 'Failed to update space status');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', overflow: 'hidden' } }}>
      <DialogTitle sx={{ m: 0, px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1b7f43', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
          Manage Parking Spaces
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }, p: 0.5 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, bgcolor: 'white' }}>
        {error && (
          <Box sx={{ p: 1.5 }}>
            <Alert severity="error" sx={{ fontSize: '11.5px' }}>
              {error}
            </Alert>
          </Box>
        )}

        <Box sx={{ p: 2.5, display: 'flex', gap: 1.5, borderBottom: '1px solid #e2e8f0', alignItems: 'flex-end' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
              New Space Number <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <TextField 
              size="small" 
              fullWidth 
              placeholder="e.g. P-31" 
              value={newSpaceNumber}
              onChange={(e) => setNewSpaceNumber(e.target.value)}
              inputProps={{ style: { fontSize: '12px', padding: '6px 10px' } }}
            />
          </Box>
          <Box>
            <Button 
              variant="contained" 
              onClick={handleAddSpace} 
              disabled={isSubmitting}
              sx={{ bgcolor: '#1b7f43', '&:hover': { bgcolor: '#166534' }, whiteSpace: 'nowrap', height: '32px', boxShadow: 'none', textTransform: 'none', fontWeight: 600, fontSize: '11.5px', px: 2, borderRadius: '6px' }}
            >
              {isSubmitting ? <CircularProgress size={14} sx={{ color: 'white', mr: 0.5 }} /> : null}
              + Add Space
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 600, fontSize: '11.5px' }}>
            Total Spaces Configured: {spaces.length}
          </Typography>
        </Box>
        
        {isLoading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ color: '#1b7f43' }} />
          </Box>
        ) : (
          <List sx={{ maxHeight: 350, overflow: 'auto', p: 0 }}>
            {spaces.map((space, index) => (
              <ListItem 
                key={space.id || space.number} 
                divider={index !== spaces.length - 1}
                sx={{ '&:hover': { bgcolor: '#f8fafc' }, px: 2.5, py: 1 }}
              >
                <ListItemText 
                  primary={<Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '12px' }}>{space.number}</Typography>} 
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip 
                    label={space.status} 
                    size="small" 
                    sx={{ 
                      width: 72, fontSize: '10px', fontWeight: 600, height: '20px',
                      bgcolor: space.status === 'Available' ? '#dcfce7' : space.status === 'Occupied' ? '#fee2e2' : '#f1f5f9',
                      color: space.status === 'Available' ? '#166534' : space.status === 'Occupied' ? '#991b1b' : '#475569',
                    }}
                  />
                  
                  <IconButton 
                    size="small" 
                    title={space.status === 'Blocked' ? 'Unblock Space' : 'Block Space'}
                    onClick={() => handleToggleBlock(space.number, space.status, space.id)}
                    disabled={space.status === 'Occupied'}
                    sx={{ p: 0.5 }}
                  >
                    {space.status === 'Blocked' ? <CheckCircleIcon sx={{ fontSize: 16 }} color="success" /> : <BlockIcon sx={{ fontSize: 16 }} color="action" />}
                  </IconButton>
                  
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteSpace(space.number, space.status, space.id)}
                    disabled={space.status === 'Occupied'}
                    sx={{ p: 0.5 }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 2.5, py: 1.5, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#1e293b', bgcolor: '#f1f5f9', px: 2.5, py: 0.5, '&:hover': { bgcolor: '#e2e8f0' }, textTransform: 'none', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
