'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import JobManagement from './JobManagement';
import CrewManagement from './CrewManagement';
import ServiceManagement from './ServiceManagement';
import Ledger from './Ledger';

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [crew, setCrew] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, crewRes, servicesRes] = await Promise.all([
        api.get('/admin/jobs'),
        api.get('/admin/crew'),
        api.get('/services')
      ]);
      setJobs(jobsRes.data);
      setCrew(crewRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl py-8 mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {['jobs', 'services', 'crew', 'ledger'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'
            }`}
          >
            {tab === 'jobs' ? `Requests (${jobs.length})` : tab === 'services' ? `Services (${services.length})` : tab === 'crew' ? `Team Members (${crew.length})` : 'Ledger'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-8">Loading...</div> : (
        <>
          {activeTab === 'jobs' && <JobManagement jobs={jobs} crew={crew} onJobUpdated={loadData} />}
          {activeTab === 'services' && <ServiceManagement services={services} onServicesUpdated={loadData} />}
          {activeTab === 'crew' && <CrewManagement crew={crew} onCrewUpdated={loadData} />}
          {activeTab === 'ledger' && <Ledger />}
        </>
      )}
    </div>
  );
}
