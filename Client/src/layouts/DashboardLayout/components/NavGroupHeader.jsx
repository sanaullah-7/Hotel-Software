import React from 'react';

export const NavGroupHeader = ({ title, isOpen }) => {
  if (!isOpen) {
    return <div className="my-2 border-t border-gray-100" />;
  }
  return (
    <li className="pt-3 pb-1 px-3 list-none">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
        {title}
      </span>
    </li>
  );
};
