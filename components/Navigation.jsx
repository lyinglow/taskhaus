'use client';

export default function Navigation({ isAdmin, currentUser, onLogout, onNavigate }) {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-600">Chore Service</h1>
          {currentUser && <p className="text-sm text-gray-600">{currentUser.name}</p>}
        </div>
        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('browse-services')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                Browse
              </button>
              <button
                onClick={() => onNavigate('job-history')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                My Jobs
              </button>
            </>
          )}
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
