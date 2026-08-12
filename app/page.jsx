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
import HowWeWork from '@/components/HowWeWork';
import CrewLogin from '@/components/CrewLogin';
import CrewPortal from '@/components/CrewPortal';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Spinner from '@/components/Spinner';

export default function Home() {
  const [page, setPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCrew, setIsCrew] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchFocusToken, setSearchFocusToken] = useState(0);

  const handleSearch = () => {
    setPage('browse-services');
    setSearchFocusToken((t) => t + 1);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdminToken = localStorage.getItem('isAdmin');
    const isCrewToken = localStorage.getItem('isCrew');
    if (token) {
      const adminFlag = isAdminToken === 'true';
      const crewFlag = isCrewToken === 'true';
      setIsLoggedIn(true);
      setIsAdmin(adminFlag);
      setIsCrew(crewFlag);
      const customerId = localStorage.getItem('customerId');
      const userName = localStorage.getItem('userName');
      setUser({ customerId, name: userName });
      setPage(adminFlag ? 'admin-dashboard' : crewFlag ? 'crew-portal' : 'browse-services');
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
    setIsCrew(false);
    setUser(null);
    setPage('home');
  };

  const handleLogin = (token, customerId, name, adminFlag = false) => {
    localStorage.setItem('token', token);
    localStorage.setItem('customerId', customerId);
    localStorage.setItem('userName', name);
    localStorage.setItem('isAdmin', adminFlag);
    localStorage.setItem('isCrew', false);
    setIsLoggedIn(true);
    setIsAdmin(adminFlag);
    setIsCrew(false);
    setUser({ customerId, name });
    setPage(adminFlag ? 'admin-dashboard' : 'browse-services');
  };

  const handleCrewLogin = (token, crewMemberId, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('customerId', crewMemberId);
    localStorage.setItem('userName', name);
    localStorage.setItem('isAdmin', false);
    localStorage.setItem('isCrew', true);
    setIsLoggedIn(true);
    setIsAdmin(false);
    setIsCrew(true);
    setUser({ name });
    setPage('crew-portal');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
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
    } else if (page === 'how-we-work') {
      return <HowWeWork onBack={() => setPage('home')} />;
    } else if (page === 'crew-login') {
      return <CrewLogin onLogin={handleCrewLogin} onCancel={() => setPage('home')} />;
    } else {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
          <Image src="/garden-mist-bg.png" alt="" fill priority className="object-cover -z-10 grayscale" sizes="100vw" />
          <div className="absolute inset-0 bg-stone-50/60" />
          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
            <button
              onClick={() => setPage('admin-login')}
              className="text-sm font-medium text-stone-600 hover:text-stone-900 bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition"
            >
              Admin Login
            </button>
            <button
              onClick={() => setPage('crew-login')}
              className="text-sm font-medium text-stone-600 hover:text-stone-900 bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition"
            >
              Team Login
            </button>
          </div>
          <div className="relative z-10 text-center mb-10 max-w-sm">
            <h1 className="text-4xl font-bold text-stone-900 mb-3">The Garden Unit</h1>
            <p className="text-xl text-stone-700 mb-3">Local garden and home help</p>
            <p className="text-stone-600">Grass cutting, hedge trimming and garden tidy-ups, plus everyday help like bin duties and local errands. Booked in a couple of taps, done by our supervised local team.</p>
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
              Sign up for free
            </button>
            <div className="flex justify-center gap-6 pt-2">
              <button
                onClick={() => setPage('about')}
                className="text-brand-700 hover:text-brand-800 font-medium text-sm"
              >
                About Us
              </button>
              <button
                onClick={() => setPage('how-we-work')}
                className="text-brand-700 hover:text-brand-800 font-medium text-sm"
              >
                How We Work
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navigation isAdmin={isAdmin} isCrew={isCrew} currentUser={user} onLogout={handleLogout} onNavigate={setPage} onSearch={handleSearch} />
      <div className="flex-1">
        {page === 'browse-services' && <BrowseServices onNavigate={setPage} searchFocusToken={searchFocusToken} />}
        {page === 'book-job' && <BookJob onNavigate={setPage} />}
        {page === 'job-history' && <JobHistory onNavigate={setPage} />}
        {page.startsWith('job-detail-') && <JobDetail jobId={parseInt(page.split('-')[2])} onNavigate={setPage} />}
        {page === 'profile' && <Profile onProfileUpdated={handleProfileUpdated} />}
        {page === 'about' && <About />}
        {page === 'how-we-work' && <HowWeWork />}
        {page.startsWith('review-') && <ReviewJob jobId={parseInt(page.split('-')[1])} onNavigate={setPage} />}
        {page === 'admin-dashboard' && <AdminDashboard onNavigate={setPage} />}
        {page === 'crew-portal' && <CrewPortal />}
      </div>
      {!isAdmin && !isCrew && <Footer onNavigate={setPage} />}
    </div>
  );
}
