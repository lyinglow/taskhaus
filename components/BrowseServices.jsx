'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ServiceCard from './ServiceCard';

export default function BrowseServices({ onNavigate }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchServices();
    fetchJobs();
  }, []);

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

  const gardenServices = services.filter(s => s.serviceType === 'fixed' && s.category !== 'other');
  const otherServices = services.filter(s => s.serviceType === 'fixed' && s.category === 'other');
  const quoteServices = services.filter(s => s.serviceType === 'quote');

  const selectService = (service) => {
    localStorage.setItem('selectedServiceId', service.id);
    localStorage.setItem('selectedServiceName', service.name);
    localStorage.setItem('selectedServiceDescription', service.description || '');
    localStorage.setItem('selectedServiceLongDescription', service.longDescription || service.description || '');
    localStorage.setItem('selectedServicePrice', service.price ?? '');
    onNavigate('book-job');
  };

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Available Services</h1>
      <p className="text-stone-600 mb-6">Browse and book services from The Garden Unit team</p>

      {jobs.length > 0 && (
        <button
          onClick={() => onNavigate('job-history')}
          className="w-full grid grid-cols-3 gap-3 mb-10 text-left"
        >
          <div className="bg-white p-4 rounded-lg border border-stone-200 text-center hover:shadow-lg transition">
            <div className="text-2xl font-bold text-stone-900">{pendingCount}</div>
            <div className="text-sm text-stone-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 text-center hover:shadow-lg transition">
            <div className="text-2xl font-bold text-stone-900">{confirmedCount}</div>
            <div className="text-sm text-stone-600">Confirmed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 text-center hover:shadow-lg transition">
            <div className="text-2xl font-bold text-stone-900">{completedCount}</div>
            <div className="text-sm text-stone-600">Completed</div>
          </div>
        </button>
      )}

      {loading ? (
        <div className="text-center py-8">Loading services...</div>
      ) : (
        <>
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-stone-900 mb-5">Garden Services</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {gardenServices.map(service => (
                <ServiceCard key={service.id} service={service} onSelect={() => selectService(service)} />
              ))}
            </div>
          </section>

          {otherServices.length > 0 && (
            <section className="mb-14">
              <h2 className="text-2xl font-bold text-stone-900 mb-5">Other Services</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {otherServices.map(service => (
                  <ServiceCard key={service.id} service={service} onSelect={() => selectService(service)} />
                ))}
              </div>
            </section>
          )}

          {quoteServices.length > 0 && (
            <section className="mb-14">
              <h2 className="text-2xl font-bold text-stone-900 mb-5">Quote-Based Services</h2>
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
