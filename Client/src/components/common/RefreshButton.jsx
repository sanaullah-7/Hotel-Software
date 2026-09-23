import React from 'react';
import { Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Standard Refresh Action Button with loading spin animation support and consistent sizing.
 */
export default function RefreshButton({
  onClick,
  title = 'Refresh',
  loading = false,
  variant = 'circle', // 'circle' | 'square' | 'button'
  size = 'md', // 'sm' | 'md'
  className = '',
  color = 'primary'
}) {
  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs disabled:opacity-50 ${className}`}
      >
        <RefreshIcon
          sx={{ fontSize: size === 'sm' ? 16 : 18 }}
          className={`${loading ? 'animate-spin' : ''} text-[var(--primary-main)]`}
        />
        <span>{title}</span>
      </button>
    );
  }

  if (variant === 'square') {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        disabled={loading}
        className={`p-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer disabled:opacity-50 ${className}`}
      >
        <RefreshIcon
          sx={{ fontSize: size === 'sm' ? 16 : 18 }}
          className={loading ? 'animate-spin' : ''}
        />
      </button>
    );
  }

  // Default: 'circle'
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={loading}
      className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer disabled:opacity-50 ${className}`}
    >
      <RefreshIcon
        sx={{ fontSize: size === 'sm' ? 18 : 20 }}
        className={`${loading ? 'animate-spin' : ''} text-[var(--primary-main)]`}
      />
    </button>
  );
}
