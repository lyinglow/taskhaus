'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Login from '@/components/Login';
import Register from '@/components/Register';
import AdminDashboard from '@/components/AdminDashboard';
import BrowseServices from '@/components/BrowseServices';
import BookJob from '@/components/BookJob';
import JobHistory from '@/components/JobHistory';
import JobDetail from '@/components/JobDetail';
import ReviewJob from '@/components/ReviewJob';
import Profile from '@/components/Profile';
import About from '@/components/About';
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
      const adminFlag = isAdminToken === 'true';
      setIsLoggedIn(true);
      setIsAdmin(adminFlag);
      const customerId = localStorage.getItem('customerId');
      const userName = localStorage.getItem('userName');
      setUser({ customerId, name: userName });
      setPage(adminFlag ? 'admin-dashboard' : 'browse-services');
    }
    setLoading(false);
  }, []);

  const handleProfileUpdated = (newName) => {
    setUser((prev) => ({ ...prev, name: newName }));
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    setPage('home');
  };

  const handleLogin = (token, customerId, name, adminFlag = false) => {
    localStorage.setItem('token', token);
    localStorage.setItem('customerId', customerId);
    localStorage.setItem('userName', name);
    localStorage.setItem('isAdmin', adminFlag);
    setIsLoggedIn(true);
    setIsAdmin(adminFlag);
    setUser({ customerId, name });
    setPage(adminFlag ? 'admin-dashboard' : 'browse-services');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isLoggedIn) {
    if (page === 'login') {
      return <Login onLogin={handleLogin} onSwitchPage={() => setPage('register')} onCancel={() => setPage('home')} />;
    } else if (page === 'register') {
      return <Register onRegister={handleLogin} onSwitchPage={() => setPage('login')} onCancel={() => setPage('home')} />;
    } else if (page === 'admin-login') {
      return <Login isAdmin={true} onLogin={handleLogin} onSwitchPage={() => setPage('home')} onCancel={() => setPage('home')} />;
    } else if (page === 'about') {
      return <About onBack={() => setPage('home')} />;
    } else {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
          <Image src="/garden-mist-bg.png" alt="" fill priority className="object-cover -z-10 grayscale" sizes="100vw" />
          <div className="absolute inset-0 bg-stone-50/60" />
          <button
            onClick={() => setPage('admin-login')}
            className="absolute top-4 right-4 z-10 text-sm font-medium text-stone-600 hover:text-stone-900 bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition"
          >
            Admin Login
          </button>
          <div className="relative z-10 text-center mb-10">
            <h1 className="text-4xl font-bold text-stone-900 mb-3">The Garden Unit</h1>
            <p className="text-xl text-stone-700">Local garden and home help</p>
          </div>
          <div className="relative z-10 space-y-4 w-full max-w-sm">
            <button
              onClick={() => setPage('login')}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              Customer Login
            </button>
            <button
              onClick={() => setPage('register')}
              className="w-full bg-accent-600 text-white py-3 rounded-lg font-semibold hover:bg-accent-700 transition"
            >
              Customer Sign Up
            </button>
            <button
              onClick={() => setPage('about')}
              className="w-full text-brand-700 hover:text-brand-800 font-medium py-2 transition"
            >
              About Us
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation isAdmin={isAdmin} currentUser={user} onLogout={handleLogout} onNavigate={setPage} />
      <div className="pb-20">
        {page === 'browse-services' && <BrowseServices onNavigate={setPage} />}
        {page === 'book-job' && <BookJob onNavigate={setPage} />}
        {page === 'job-history' && <JobHistory onNavigate={setPage} />}
        {page.startsWith('job-detail-') && <JobDetail jobId={parseInt(page.split('-')[2])} onNavigate={setPage} />}
        {page === 'profile' && <Profile onProfileUpdated={handleProfileUpdated} />}
        {page === 'about' && <About />}
        {page.startsWith('review-') && <ReviewJob jobId={parseInt(page.split('-')[1])} onNavigate={setPage} />}
        {page === 'admin-dashboard' && <AdminDashboard onNavigate={setPage} />}
      </div>
    </div>
  );
}
