import React from 'react';
import { Link } from 'react-router-dom';

export const SidebarSubItems = ({ items, pathname }) => {
  return (
    <div className="bg-[#f0f4fa] rounded-xl p-1 space-y-0.5">
      {items.map((subItem) => {
        const isSelected = pathname === subItem.path;

        return (
          <Link
            key={subItem.id}
            to={subItem.path}
            aria-current={isSelected ? 'page' : undefined}
            className={`flex items-center px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer no-underline ${
              isSelected
                ? 'bg-[#dcefe5] text-[#1b7f43]'
                : 'hover:bg-[#dcefe5] text-slate-600 hover:text-[#1b7f43]'
            }`}
          >
            {isSelected ? (
              <div className="w-2 h-2 rounded-full bg-[#1b7f43] ring-2 ring-[#1b7f43]/20 mr-2 shrink-0" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-[#86efac] mr-2 shrink-0 ml-0.5" />
            )}

            <span className={`text-[11.5px] font-semibold transition-colors ${
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
