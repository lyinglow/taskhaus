'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import ServiceCard from './ServiceCard';
import ServiceIdeasSection from './ServiceIdeasSection';
import Spinner from './Spinner';

export default function BrowseServices({ onNavigate, searchFocusToken }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchServices();
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchFocusToken) searchInputRef.current?.focus();
  }, [searchFocusToken]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const pendingCount = jobs.filter(j => j.status === 'pending' || j.status === 'quoted').length;
  const confirmedCount = jobs.filter(j => j.status === 'confirmed' || j.status === 'review').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;

  const matchesSearch = (service) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      service.name?.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query) ||
      service.longDescription?.toLowerCase().includes(query)
    );
  };

  const filteredServices = services.filter(matchesSearch);
  const gardenServices = filteredServices.filter(s => s.serviceType === 'fixed' && s.category !== 'other');
  const otherServices = filteredServices.filter(s => s.serviceType === 'fixed' && s.category === 'other');
  const quoteServices = filteredServices.filter(s => s.serviceType === 'quote');
  const noResults = search.trim() && filteredServices.length === 0;

  const selectService = (service) => {
    localStorage.setItem('selectedServiceId', service.id);
    localStorage.setItem('selectedServiceName', service.name);
    localStorage.setItem('selectedServiceDescription', service.description || '');
    localStorage.setItem('selectedServiceLongDescription', service.longDescription || service.description || '');
    localStorage.setItem('selectedServicePrice', service.price ?? '');
    localStorage.setItem('selectedServiceSeason', service.season || '');
    localStorage.setItem('selectedServiceExtras', JSON.stringify(service.extras || []));
    onNavigate('book-job');
  };

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Available services</h1>
      <p className="text-stone-600 mb-3">From garden upkeep like grass cutting and hedge trimming to everyday help like bin duties and local errands, our team can lend a hand around your home. Pick a service below and book in a couple of taps.</p>
      <p className="text-sm text-stone-500 mb-6">Prices marked "From" are starting prices: the size of your garden or the scope of the job can affect the final cost, which we'll always confirm with you before any work begins.</p>

      <div className="relative mb-8">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {jobs.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-10">
          <button type="button" onClick={() => onNavigate('job-history-pending')} className="bg-white p-4 rounded-lg border border-stone-200 text-center hover:shadow-lg hover:border-brand-300 transition">
            <div className="text-2xl font-bold text-stone-900">{pendingCount}</div>
            <div className="text-sm text-stone-600">Pending</div>
          </button>
          <button type="button" onClick={() => onNavigate('job-history-confirmed')} className="bg-white p-4 rounded-lg border border-stone-200 text-center hover:shadow-lg hover:border-brand-300 transition">
            <div className="text-2xl font-bold text-stone-900">{confirmedCount}</div>
            <div className="text-sm text-stone-600">Confirmed</div>
          </button>
          <button type="button" onClick={() => onNavigate('job-history-completed')} className="bg-white p-4 rounded-lg border border-stone-200 text-center hover:shadow-lg hover:border-brand-300 transition">
            <div className="text-2xl font-bold text-stone-900">{completedCount}</div>
            <div className="text-sm text-stone-600">Completed</div>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : noResults ? (
        <div className="bg-stone-100 p-10 rounded-lg text-center">
          <p className="text-stone-600">No services match "{search}".</p>
        </div>
      ) : (
        <>
          {gardenServices.length > 0 && (
            <section className="mb-14">
              <h2 className="text-2xl font-bold text-stone-900 mb-5">Garden services</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {gardenServices.map(service => (
                  <ServiceCard key={service.id} service={service} onSelect={() => selectService(service)} />
                ))}
              </div>
            </section>
          )}

          {otherServices.length > 0 && (
            <section className="mb-14">
              <h2 className="text-2xl font-bold text-stone-900 mb-5">Other services</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {otherServices.map(service => (
                  <ServiceCard key={service.id} service={service} onSelect={() => selectService(service)} />
                ))}
              </div>
            </section>
          )}

          <ServiceIdeasSection />

          {quoteServices.length > 0 && (
            <section className="mb-14">
              <h2 className="text-2xl font-bold text-stone-900 mb-5">Quote-based services</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {quoteServices.map(service => (
                  <ServiceCard key={service.id} service={service} onSelect={() => selectService(service)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
