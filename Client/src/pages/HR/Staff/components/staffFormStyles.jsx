import React from 'react';

// Section Header with pastel icon badge - Compact padding
export const SectionHeader = ({
  icon: Icon,
  title,
  badgeBg = '#eef2ff',
  iconColor = '#5d5fef'
}) => (
  <div className="flex items-center gap-2.5 mb-3.5 mt-6 first:mt-1">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-105"
      style={{ backgroundColor: badgeBg, color: iconColor }}
    >
      <Icon sx={{ fontSize: 18 }} />
    </div>
    <h3 className="text-[16px] font-bold text-gray-800 tracking-tight">{title}</h3>
  </div>
);

// Consistent styled input SX for standard height and modern Luxuria aesthetics
export const inputStyle = {
  '& .MuiOutlinedInput-root': {
    height: '48px',
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    fontSize: '14.5px',
    color: '#1e293b',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: '#d1d5db',
      borderWidth: '1.2px',
    },
    '&:hover fieldset': {
      borderColor: 'var(--primary-main)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--primary-main)',
      borderWidth: '1.5px',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 1px var(--primary-main)',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    color: '#4b5563',
    '&.Mui-focused': {
      color: 'var(--primary-main)',
      fontWeight: 500,
    },
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.85)',
    backgroundColor: '#ffffff',
    padding: '0 4px',
  },
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
  },
};

// Date input specific styling with end calendar icon
export const dateInputStyle = {
  ...inputStyle,
  '& input::-webkit-calendar-picker-indicator': {
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  },
};

// Multiline textarea style - Compact
export const multilineStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    fontSize: '14.5px',
    color: '#1e293b',
    padding: '10px 12px',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: '#d1d5db',
      borderWidth: '1.2px',
    },
    '&:hover fieldset': {
      borderColor: 'var(--primary-main)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--primary-main)',
      borderWidth: '1.5px',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 1px var(--primary-main)',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    color: '#4b5563',
    '&.Mui-focused': {
      color: 'var(--primary-main)',
      fontWeight: 500,
    },
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.85)',
    backgroundColor: '#ffffff',
    padding: '0 4px',
  },
};

// Generate random employee ID
export const generateEmployeeId = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const chars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EMP${digits}${chars}`;
};
