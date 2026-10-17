import React from 'react';

export const NavGroupHeader = ({ title, isOpen }) => {
  if (!isOpen) {
    return <div className="my-1.5 border-t border-gray-100" />;
  }
  return (
    <li className="pt-2 pb-0.5 px-2 list-none">
      <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider block">
        {title}
      </span>
    </li>
  );
};
