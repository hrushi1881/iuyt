import React from 'react';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive }) => {
  // In a real app, you'd use a router's isActive check
  const active = isActive || window.location.pathname === to;

  return (
    <a
      href={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </a>
  );
};