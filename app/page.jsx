'use client';

import { useState, useEffect } from 'react';
import Login from '@/components/Login';
import Register from '@/components/Register';
import ParentDashboard from '@/components/ParentDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import BrowseServices from '@/components/BrowseServices';
import BookJob from '@/components/BookJob';
import JobHistory from '@/components/JobHistory';
import ReviewJob from '@/components/ReviewJob';
import Navigation from '@/components/Navigation';

export default function Home() {
  const [page, setPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">The Garden Unit</h1>
            <p className="text-xl text-gray-600">Professional service management</p>
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
