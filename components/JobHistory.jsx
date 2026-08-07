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

  const getCost = (job) => {
    if (job.finalPrice) return { label: 'Price', value: job.finalPrice, from: false };
    if (job.quotedPrice) return { label: 'Quote', value: job.quotedPrice, from: false };
    if (job.service?.price) return { label: 'Cost', value: job.service.price, from: true };
    return null;
  };

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Current Tasks</h1>

      {loading ? (
        <div className="text-center py-8">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-stone-100 p-10 rounded-lg text-center">
          <p className="text-stone-600 mb-4">You haven't booked any services yet.</p>
          <button onClick={() => onNavigate('browse-services')} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition">
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {jobs.map(job => {
            const cost = getCost(job);
            return (
            <div
              key={job.id}
              onClick={() => onNavigate(`job-detail-${job.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(`job-detail-${job.id}`); } }}
              className="bg-white p-5 rounded-lg border border-stone-200 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{job.serviceName || job.customRequest}</h3>
                  <div className="text-sm text-stone-600">Service #{job.id}</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800">
                  {getStatusLabel(job.status)}
                </span>
              </div>
              {job.crewName && <div className="text-sm text-stone-600">Team Member: {job.crewName}</div>}
              {job.timeWindow && <div className="text-sm text-stone-600">Time: {job.timeWindow}</div>}
              {cost && (
                <div className="text-base font-bold text-stone-900 mt-1">
                  {cost.label}: {cost.from && <span className="text-[13px] font-medium align-baseline">From </span>}£{Number(cost.value).toFixed(2)}
                </div>
              )}
              {job.status === 'completed' && !job.review && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate(`review-${job.id}`); }}
                  className="mt-3 w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700"
                >
                  Leave a Review
                </button>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
