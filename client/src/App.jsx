import { useState, useEffect } from 'react';
import './index.css';
import Login from './pages/Login';
import Register from './pages/Register';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BrowseServices from './pages/BrowseServices';
import BookJob from './pages/BookJob';
import JobHistory from './pages/JobHistory';
import ReviewJob from './pages/ReviewJob';
import Navigation from './components/Navigation';

export default function App() {
  const [page, setPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdminToken = localStorage.getItem('isAdmin');
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(isAdminToken === 'true');
      const parentId = localStorage.getItem('parentId');
      const userName = localStorage.getItem('userName');
      setUser({ parentId, name: userName });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    setPage('home');
  };

  const handleLogin = (token, parentId, name, adminFlag = false) => {
    localStorage.setItem('token', token);
    localStorage.setItem('parentId', parentId);
    localStorage.setItem('userName', name);
    localStorage.setItem('isAdmin', adminFlag);
    setIsLoggedIn(true);
    setIsAdmin(adminFlag);
    setUser({ parentId, name });
    setPage(adminFlag ? 'admin-dashboard' : 'parent-dashboard');
  };

  if (!isLoggedIn) {
    if (page === 'login') {
      return <Login onLogin={handleLogin} onSwitchPage={() => setPage('register')} />;
    } else if (page === 'register') {
      return <Register onRegister={handleLogin} onSwitchPage={() => setPage('login')} />;
    } else if (page === 'admin-login') {
      return <Login isAdmin={true} onLogin={handleLogin} onSwitchPage={() => setPage('home')} />;
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Chore Service</h1>
            <p className="text-xl text-gray-600">Get your neighborhood chores done!</p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => setPage('login')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Parent Login
            </button>
            <button
              onClick={() => setPage('register')}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Parent Sign Up
            </button>
            <button
              onClick={() => setPage('admin-login')}
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
            >
              Admin Login
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation isAdmin={isAdmin} currentUser={user} onLogout={handleLogout} onNavigate={setPage} />
      <div className="pb-20">
        {page === 'parent-dashboard' && <ParentDashboard onNavigate={setPage} />}
        {page === 'browse-services' && <BrowseServices onNavigate={setPage} />}
        {page === 'book-job' && <BookJob onNavigate={setPage} />}
        {page === 'job-history' && <JobHistory onNavigate={setPage} />}
        {page.startsWith('review-') && <ReviewJob jobId={parseInt(page.split('-')[1])} onNavigate={setPage} />}
        {page === 'admin-dashboard' && <AdminDashboard onNavigate={setPage} />}
      </div>
    </div>
  );
}
