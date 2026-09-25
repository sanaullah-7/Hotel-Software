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
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { getParkingSpaces, addParkingSpace, deleteParkingSpace, updateParkingSpaceStatus } from '../state/carParkingStore';

export default function ManageSpacesModal({ open, onClose }) {
  const [spaces, setSpaces] = useState([]);
  const [newSpaceNumber, setNewSpaceNumber] = useState('');

  useEffect(() => {
    if (open) {
      refreshSpaces();
    }
  }, [open]);

  const refreshSpaces = () => {
    setSpaces(getParkingSpaces());
  };

  const handleAddSpace = () => {
    if (!newSpaceNumber.trim()) return;
    
    // Check if exists
    if (spaces.some(s => s.number.toLowerCase() === newSpaceNumber.toLowerCase())) {
      alert(`Parking space ${newSpaceNumber} already exists!`);
      return;
    }
    
    addParkingSpace(newSpaceNumber);
    setNewSpaceNumber('');
    refreshSpaces();
  };

  const handleDeleteSpace = (number, status) => {
    if (status === 'Occupied') {
      alert(`Cannot delete space ${number} because it is currently occupied.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete parking space ${number}?`)) {
      deleteParkingSpace(number);
      refreshSpaces();
    }
  };

  const handleToggleBlock = (number, status) => {
    if (status === 'Occupied') {
      alert(`Cannot block space ${number} because it is currently occupied.`);
      return;
    }
    const newStatus = status === 'Blocked' ? 'Available' : 'Blocked';
    updateParkingSpaceStatus(number, newStatus);
    refreshSpaces();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1b7f43', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Manage Parking Spaces
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, bgcolor: 'white' }}>
        <Box sx={{ p: 3, display: 'flex', gap: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.5 }}>
              New Space Number <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <TextField 
              size="small" 
              fullWidth 
              placeholder="e.g. P-31" 
              value={newSpaceNumber}
              onChange={(e) => setNewSpaceNumber(e.target.value)}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button variant="contained" onClick={handleAddSpace} sx={{ bgcolor: '#1b7f43', '&:hover': { bgcolor: '#166534' }, whiteSpace: 'nowrap', height: '40px', boxShadow: 'none', textTransform: 'none', fontWeight: 600 }}>
              + Add Space
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 600 }}>
            Total Spaces Configured: {spaces.length}
          </Typography>
        </Box>
        
        <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
          {spaces.map((space, index) => (
            <ListItem 
              key={space.id} 
              divider={index !== spaces.length - 1}
              sx={{ '&:hover': { bgcolor: '#f8fafc' }, px: 3 }}
            >
              <ListItemText 
                primary={<Typography fontWeight={600} color="#1e293b">{space.number}</Typography>} 
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={space.status} 
                  size="small" 
                  sx={{ 
                    width: 80, fontSize: '11px', fontWeight: 600, height: '22px',
                    bgcolor: space.status === 'Available' ? '#dcfce7' : space.status === 'Occupied' ? '#fee2e2' : '#f1f5f9',
                    color: space.status === 'Available' ? '#166534' : space.status === 'Occupied' ? '#991b1b' : '#475569',
                  }}
                />
                
                <IconButton 
                  size="small" 
                  title={space.status === 'Blocked' ? 'Unblock Space' : 'Block Space'}
                  onClick={() => handleToggleBlock(space.number, space.status)}
                  disabled={space.status === 'Occupied'}
                >
                  {space.status === 'Blocked' ? <CheckCircleIcon color="success" /> : <BlockIcon color="action" />}
                </IconButton>
                
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => handleDeleteSpace(space.number, space.status)}
                  disabled={space.status === 'Occupied'}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
          {spaces.length === 0 && (
            <Typography sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No parking spaces configured.</Typography>
          )}
        </List>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#1e293b', bgcolor: '#f1f5f9', px: 3, '&:hover': { bgcolor: '#e2e8f0' }, textTransform: 'none', fontWeight: 600 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
