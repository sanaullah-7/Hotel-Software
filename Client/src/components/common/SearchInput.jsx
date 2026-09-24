import React from 'react';
import { Search as SearchIcon, Close as ClearIcon } from '@mui/icons-material';

/**
 * Standard Search Input component with consistent icon placement, styling, and sizing across modules.
 */
export default function SearchInput({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  iconPosition = 'right',
  variant = 'default', // 'default' | 'slate' | 'pill'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  inputClassName = '',
  width = 'w-full'
}) {
  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  const handleClear = () => {
    if (typeof onClear === 'function') {
      onClear();
    } else if (typeof onChange === 'function') {
      onChange({ target: { value: '' } });
    }
  };

  // Sizing & padding classes based on icon position and variant
  let heightPaddingClasses = 'py-1.5 text-[13px]';
  if (size === 'sm') heightPaddingClasses = 'py-1 text-xs';
  if (size === 'lg') heightPaddingClasses = 'py-2.5 text-sm';

  let iconPaddingClasses = iconPosition === 'left' ? 'pl-9 pr-3' : 'pl-3 pr-8';
  if (value && onClear && iconPosition === 'right') {
    iconPaddingClasses = 'pl-3 pr-14';
  }

  let variantClasses = 'border border-gray-300 rounded-md bg-white focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]';
  if (variant === 'slate') {
    variantClasses = 'bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1b7f43]/20 focus:border-[#1b7f43]';
  } else if (variant === 'pill') {
    variantClasses = 'border border-gray-200 rounded-full bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400';
  }

  return (
    <div className={`relative flex items-center ${width} ${className}`}>
      {iconPosition === 'left' && (
        <SearchIcon
          sx={{ fontSize: size === 'sm' ? 15 : 18 }}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      )}

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`w-full ${heightPaddingClasses} ${iconPaddingClasses} text-gray-700 focus:outline-none transition-all ${variantClasses} ${inputClassName}`}
      />

      {value && onClear && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute ${
            iconPosition === 'right' ? 'right-7' : 'right-2.5'
          } top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full`}
        >
          <ClearIcon sx={{ fontSize: 14 }} />
        </button>
      )}

      {iconPosition === 'right' && (
        <SearchIcon
          sx={{ fontSize: size === 'sm' ? 16 : 18 }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      )}
    </div>
  );
}
