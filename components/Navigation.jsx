'use client';

import { useState } from 'react';

export default function Navigation({ isAdmin, currentUser, onLogout, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = isAdmin
    ? [{ label: 'Dashboard', page: 'admin-dashboard' }]
    : [
        { label: 'Services', page: 'browse-services' },
        { label: 'My Services', page: 'job-history' },
        { label: 'Profile', page: 'profile' },
        { label: 'About', page: 'about' },
      ];

  const go = (page) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <button
          type="button"
          onClick={() => go(isAdmin ? 'admin-dashboard' : 'browse-services')}
          className="text-left"
        >
          <h1 className="text-xl font-bold text-blue-600">The Garden Unit</h1>
          {currentUser && <p className="text-sm text-gray-600">{currentUser.name}</p>}
        </button>

        <div className="hidden md:flex gap-2">
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => go(link.page)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
          >
            Logout
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
        >
          <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-700 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 px-4 py-3 space-y-1">
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => go(link.page)}
              className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
