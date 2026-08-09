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
  const [migrateStatus, setMigrateStatus] = useState('');

  const runJobColumnsMigration = async () => {
    setMigrateStatus('Running...');
    try {
      const res = await api.post('/admin/migrate-job-columns');
      setMigrateStatus(res.data.message || 'Done.');
    } catch (err) {
      setMigrateStatus(err.response?.data?.error || 'Migration failed');
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

  const cost = (job) => job.finalPrice || job.quotedPrice || job.service?.price || 0;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const pendingCount = jobs.filter(j => j.status === 'pending' || j.status === 'quoted').length;
  const activeCount = jobs.filter(j => j.status === 'confirmed').length;
  const completedThisWeek = jobs.filter(j => j.status === 'completed' && j.completedAt && new Date(j.completedAt) >= weekAgo);
  const revenueThisWeek = completedThisWeek.reduce((sum, j) => sum + cost(j), 0);

  return (
    <div className="container max-w-6xl py-10 mx-auto px-4">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Admin Dashboard</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-stone-700 mb-2">One-time setup: adds recurrence and before/after photo columns to jobs.</p>
        <button
          onClick={runJobColumnsMigration}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700"
        >
          Run Migration
        </button>
        {migrateStatus && <p className="text-sm text-stone-700 mt-2">{migrateStatus}</p>}
      </div>

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-stone-200">
            <div className="text-2xl font-bold text-stone-900">{pendingCount}</div>
            <div className="text-sm text-stone-600">Pending requests</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200">
            <div className="text-2xl font-bold text-stone-900">{activeCount}</div>
            <div className="text-sm text-stone-600">Confirmed jobs</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200">
            <div className="text-2xl font-bold text-stone-900">{completedThisWeek.length}</div>
            <div className="text-sm text-stone-600">Completed this week</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200">
            <div className="text-2xl font-bold text-stone-900">£{revenueThisWeek.toFixed(2)}</div>
            <div className="text-sm text-stone-600">Revenue this week</div>
          </div>
        </div>
      )}

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
