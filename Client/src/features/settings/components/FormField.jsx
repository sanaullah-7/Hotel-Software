import React from 'react';

export default function FormField({ label, icon: Icon, value, onChange, name, placeholder, multiline = false, rows = 3 }) {
  return (
    <div className="relative group w-full">
      <fieldset className="border border-gray-300 group-focus-within:border-[var(--primary-main)] rounded-md px-3 py-1.5 transition-colors bg-white">
        <legend className="px-1 text-xs font-semibold text-gray-500 group-focus-within:text-[var(--primary-main)] transition-colors select-none">
          {label}
        </legend>
        <div className="flex items-center gap-3 px-1 py-1">
          {Icon && (
            <Icon
              sx={{ fontSize: 20 }}
              className="text-gray-600 group-focus-within:text-[var(--primary-main)] shrink-0 transition-colors"
            />
          )}
          {multiline ? (
            <textarea
              name={name}
              rows={rows}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-gray-800 text-sm font-medium resize-y"
            />
          ) : (
            <input
              type="text"
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-gray-800 text-sm font-medium"
            />
          )}
        </div>
      </fieldset>
    </div>
  );
}
