import React from 'react';

export default function PageHeader({ title, children }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="flex space-x-2">
        {children}
      </div>
    </div>
  );
}
