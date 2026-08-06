'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ServiceCard from './ServiceCard';

export default function BrowseServices({ onNavigate }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services');
      setServices(response.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  const fixedServices = services.filter(s => s.serviceType === 'fixed');
  const quoteServices = services.filter(s => s.serviceType === 'quote');

  return (
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Chores</h1>

      {loading ? (
        <div className="text-center py-8">Loading services...</div>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fixed Price Services</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {fixedServices.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={() => {
                    localStorage.setItem('selectedServiceId', service.id);
                    localStorage.setItem('selectedServiceName', service.name);
                    onNavigate('book-job');
                  }}
                />
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quote-Based Services</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {quoteServices.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={() => {
                    localStorage.setItem('selectedServiceId', service.id);
                    localStorage.setItem('selectedServiceName', service.name);
                    onNavigate('book-job');
                  }}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
