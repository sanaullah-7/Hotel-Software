import React from 'react';

/**
 * CategoryCard — colored tile for a menu category.
 * Uses category.color as the background (set as inline style),
 * keeping brand colors in global.css and category palette as UI data.
 */
export default function CategoryCard({ category, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: category.color }}
      className={`relative rounded-2xl p-4 text-left cursor-pointer transition-all duration-200 border-2 w-full
        ${isSelected
          ? 'ring-4 ring-white/50 scale-[1.03] shadow-xl brightness-110'
          : 'hover:scale-[1.02] hover:shadow-lg border-transparent'
        }`}
    >
      {/* Subtle radial gradient overlay for depth */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <span className="text-2xl leading-none">{category.emoji}</span>
        {isSelected && (
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
            <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
          </span>
        )}
      </div>

      <div className="relative mt-3">
        <p className="text-white font-bold text-[14px] leading-tight">{category.label}</p>
        <p className="text-white/70 text-[11px] mt-0.5">{category.items} Items</p>
      </div>
    </button>
  );
}
