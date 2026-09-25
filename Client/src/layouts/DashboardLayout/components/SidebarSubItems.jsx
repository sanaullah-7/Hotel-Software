import React from 'react';
import { Link } from 'react-router-dom';

export const SidebarSubItems = ({ items, pathname }) => {
  return (
    <div className="bg-[#f0f4fa] rounded-2xl p-1.5 space-y-1">
      {items.map((subItem) => {
        const isSelected = pathname === subItem.path;

        return (
          <Link
            key={subItem.id}
            to={subItem.path}
            className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer no-underline ${
              isSelected
                ? 'bg-[#dcefe5] text-[#1b7f43]'
                : 'hover:bg-[#dcefe5] text-slate-600 hover:text-[#1b7f43]'
            }`}
          >
            {isSelected ? (
              <div className="w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-3 ring-[#1b7f43]/20 mr-3 shrink-0" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#86efac] mr-3 shrink-0 ml-0.5" />
            )}

            <span className={`text-[12.5px] font-semibold transition-colors ${
              isSelected ? 'text-[#1b7f43]' : 'text-slate-600 group-hover:text-[#1b7f43]'
            }`}>
              {subItem.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
