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
  const [updateStatus, setUpdateStatus] = useState('');

  const runDescriptionUpdate = async () => {
    setUpdateStatus('Running...');
    try {
      const res = await api.post('/admin/update-service-descriptions');
      let msg = res.data.message || 'Done.';
      if (res.data.actualNames?.length) {
        msg += `\n\nCurrent service names in database:\n${res.data.actualNames.join(', ')}`;
      }
      setUpdateStatus(msg);
      loadData();
    } catch (err) {
      setUpdateStatus(err.response?.data?.error || 'Update failed');
    }
  };

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
    <div className="container max-w-6xl py-10 mx-auto px-4">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Admin Dashboard</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-stone-700 mb-2">One-time setup: writes richer descriptions to all 11 existing services.</p>
        <button
          onClick={runDescriptionUpdate}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700"
        >
          Update Descriptions
        </button>
        {updateStatus && <p className="text-sm text-stone-700 mt-2 whitespace-pre-line">{updateStatus}</p>}
      </div>

      <div className="flex gap-4 mb-8 border-b border-stone-200 overflow-x-auto">
        {['jobs', 'services', 'crew', 'ledger'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold border-b-2 transition whitespace-nowrap flex-shrink-0 ${
              activeTab === tab ? 'text-brand-700 border-brand-600' : 'text-stone-600 border-transparent'
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
