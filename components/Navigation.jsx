'use client';

import { useState } from 'react';

export default function Navigation({ isAdmin, isCrew, currentUser, onLogout, onNavigate, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const showSearch = !isAdmin && !isCrew && onSearch;

  const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const links = isAdmin
    ? [{ label: 'Dashboard', page: 'admin-dashboard' }]
    : isCrew
    ? [{ label: 'My jobs', page: 'crew-portal' }]
    : [
        { label: 'Services', page: 'browse-services' },
        { label: 'Current tasks', page: 'job-history' },
        { label: 'Profile', page: 'profile' },
        { label: 'Feedback', page: 'feedback' },
      ];

  const homePage = isAdmin ? 'admin-dashboard' : isCrew ? 'crew-portal' : 'browse-services';

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
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => go(homePage)}
            className="text-left"
          >
            <h1 className="text-xl font-bold text-brand-700">The Garden Unit</h1>
          </button>

          <div className="md:hidden flex items-center gap-1">
            {showSearch && (
              <button
                type="button"
                onClick={onSearch}
                aria-label="Search services"
                className="flex items-center justify-center w-10 h-10 text-stone-600"
              >
                <SearchIcon />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            >
              <span className={`block w-6 h-0.5 bg-stone-700 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-stone-700 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-stone-700 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        <div className="hidden md:flex gap-2 items-center mt-3 pt-3 border-t border-stone-100">
          {showSearch && (
            <button
              type="button"
              onClick={onSearch}
              aria-label="Search services"
              className="p-2 text-stone-600 hover:bg-stone-100 rounded"
            >
              <SearchIcon />
            </button>
          )}
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => go(link.page)}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            className="p-2 text-red-600 hover:bg-red-50 rounded ml-auto"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-stone-200 px-4 py-3 space-y-1">
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => go(link.page)}
              className="w-full text-left px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded"
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
