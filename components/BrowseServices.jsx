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
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Services</h1>
      <p className="text-gray-600 mb-8">Browse and book services from The Garden Unit team</p>

      {loading ? (
        <div className="text-center py-8">Loading services...</div>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Garden Services</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {gardenServices.map(service => (
                <ServiceCard key={service.id} service={service} onSelect={() => selectService(service)} />
              ))}
            </div>
          </section>

          {otherServices.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Services</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {otherServices.map(service => (
                  <ServiceCard key={service.id} service={service} onSelect={() => selectService(service)} />
                ))}
              </div>
            </section>
          )}

          {quoteServices.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quote-Based Services</h2>
              <div className="grid gap-4 md:grid-cols-2">
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
