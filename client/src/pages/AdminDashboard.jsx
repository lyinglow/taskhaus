import { useState, useEffect } from 'react';
import api from '../api';
import JobManagement from '../components/JobManagement';
import CrewManagement from '../components/CrewManagement';
import Ledger from '../components/Ledger';

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, crewRes] = await Promise.all([
        api.get('/admin/jobs'),
        api.get('/admin/crew')
      ]);
      setJobs(jobsRes.data);
      setCrew(crewRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobUpdated = async () => {
    const response = await api.get('/admin/jobs');
    setJobs(response.data);
  };

  const handleCrewUpdated = async () => {
    const response = await api.get('/admin/crew');
    setCrew(response.data);
  };

  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'jobs'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-800'
          }`}
        >
          Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('crew')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'crew'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-800'
          }`}
        >
          Crew ({crew.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'ledger'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-800'
          }`}
        >
          Ledger
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {activeTab === 'jobs' && (
            <JobManagement jobs={jobs} crew={crew} onJobUpdated={handleJobUpdated} />
          )}
          {activeTab === 'crew' && (
            <CrewManagement crew={crew} onCrewUpdated={handleCrewUpdated} />
          )}
          {activeTab === 'ledger' && <Ledger />}
        </>
      )}
    </div>
  );
}
