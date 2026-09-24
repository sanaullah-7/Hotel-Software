export const assignedMuiInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    color: '#374151',
    '& fieldset': { borderColor: '#d1d5db' },
    '&:hover fieldset': { borderColor: 'var(--primary-main)' },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--primary-main)',
      borderWidth: '1px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#4b5563',
    '&.Mui-focused': { color: 'var(--primary-main)' },
  },
  '& .MuiInputBase-input': {
    color: '#374151',
    '&::placeholder': { color: '#9ca3af', opacity: 1 },
  },
};
