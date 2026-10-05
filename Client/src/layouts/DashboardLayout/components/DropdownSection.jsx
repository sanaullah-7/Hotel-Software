import React from 'react';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { SidebarSubItems } from './SidebarSubItems';

export const DropdownSection = ({
  isOpen,
  pathname,
  active,
  open,
  toggle,
  icon: Icon,
  label,
  items,
}) => {
  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={open}
        title={!isOpen ? label : undefined}
        className={`w-full flex items-center px-2 py-1.5 rounded-lg transition-all duration-200 cursor-pointer border-none text-left ${
          active
            ? 'bg-[#f0f9f4] text-[#1b7f43]'
            : 'hover:bg-[#dcefe5] text-gray-600 hover:text-[#1b7f43]'
        } ${isOpen ? 'justify-between' : 'justify-center'}`}
      >
        <div className="flex items-center min-w-0">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors ${
              active
                ? 'bg-[#e5f4eb] text-[#1b7f43]'
                : 'bg-gray-50 text-gray-400 group-hover:bg-[#cce7d6] group-hover:text-[#1b7f43]'
            }`}
          >
            <Icon sx={{ fontSize: 17 }} />
          </div>

          <span
            className={`ml-2.5 text-[12.5px] whitespace-nowrap transition-opacity duration-200 ${
              isOpen
                ? 'opacity-100 block truncate'
                : 'opacity-0 hidden'
            } ${
              active
                ? 'font-bold text-gray-900'
                : 'text-gray-600 font-medium'
            }`}
          >
            {label}
          </span>
        </div>

        {isOpen && (
          <div className="pr-1 shrink-0">
            <ChevronRightIcon
              sx={{ fontSize: 16 }}
              className={`transition-transform duration-300 ease-in-out ${
                active
                  ? 'text-[#1b7f43]'
                  : 'text-gray-400'
              } ${open ? 'rotate-90' : 'rotate-0'}`}
            />
          </div>
        )}
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen && open
            ? 'grid-rows-[1fr] opacity-100 mt-0.5'
            : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <SidebarSubItems items={items} pathname={pathname} />
        </div>
      </div>
    </li>
  );
};
