import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-default)] text-[var(--text-primary)]">
      {children}
    </div>
  );
}
