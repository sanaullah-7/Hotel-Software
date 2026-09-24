import React from 'react';

export default function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${
        checked ? 'bg-[#4f46e5]' : 'bg-[#cbd5e1]'
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-[#4f46e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
}
