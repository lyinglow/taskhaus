'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function JobHistory({ onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = { pending: 'Pending Review', quoted: 'Quote Received', confirmed: 'Confirmed', completed: 'Completed' };
    return labels[status] || status;
  };

  return (
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Services</h1>

      {loading ? (
        <div className="text-center py-8">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">You haven't booked any services yet.</p>
          <button onClick={() => onNavigate('browse-services')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{job.serviceName || job.customRequest}</h3>
                  <div className="text-sm text-gray-600">Service #{job.id}</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-800">
                  {getStatusLabel(job.status)}
                </span>
              </div>
              {job.crewName && <div className="text-sm text-gray-600">Team Member: {job.crewName}</div>}
              {job.timeWindow && <div className="text-sm text-gray-600">Time: {job.timeWindow}</div>}
              {job.finalPrice && <div className="text-lg font-bold text-gray-900">£{Number(job.finalPrice).toFixed(2)}</div>}
              {job.status === 'completed' && !job.review && (
                <button onClick={() => onNavigate(`review-${job.id}`)} className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
                  Leave a Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
