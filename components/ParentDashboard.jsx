'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ParentDashboard({ onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingJobs = jobs.filter(j => j.status === 'pending' || j.status === 'quoted');
  const confirmedJobs = jobs.filter(j => j.status === 'confirmed');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  return (
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome!</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <button
            onClick={() => onNavigate('browse-services')}
            className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold">Browse Chores</div>
          </button>
          <button
            onClick={() => onNavigate('job-history')}
            className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold">My Jobs</div>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {pendingJobs.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Awaiting Confirmation</h2>
              <div className="space-y-3">
                {pendingJobs.map(job => (
                  <div key={job.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="font-semibold text-gray-900">
                      {job.serviceName || job.customRequest || 'Custom Request'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Status: {job.status}</div>
                    {job.status === 'quoted' && job.quotedPrice && (
                      <div className="text-lg font-bold text-gray-900 mt-2">Quote: ${job.quotedPrice}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {confirmedJobs.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Scheduled Jobs</h2>
              <div className="space-y-3">
                {confirmedJobs.map(job => (
                  <div key={job.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="font-semibold text-gray-900">{job.serviceName}</div>
                    <div className="text-sm text-gray-600 mt-1">Crew: {job.crewName || 'TBD'}</div>
                    <div className="text-sm text-gray-600">Time: {job.timeWindow || 'TBD'}</div>
                    {job.finalPrice && (
                      <div className="text-sm font-semibold text-gray-900 mt-2">Price: ${job.finalPrice}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {completedJobs.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Jobs</h2>
              <div className="space-y-3">
                {completedJobs.map(job => (
                  <div key={job.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="font-semibold text-gray-900">{job.serviceName}</div>
                    <div className="text-sm text-gray-600 mt-1">Completed: {job.completedAt?.split('T')[0]}</div>
                    {job.review ? (
                      <div className="mt-2 bg-white p-2 rounded">
                        <div className="text-yellow-500">★ {job.review.rating}/5</div>
                        {job.review.comment && <div className="text-sm text-gray-600">{job.review.comment}</div>}
                      </div>
                    ) : (
                      <button
                        onClick={() => onNavigate(`review-${job.id}`)}
                        className="mt-2 text-sm bg-white text-blue-600 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50"
                      >
                        Leave Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {jobs.length === 0 && (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <p className="text-gray-600 mb-4">No jobs yet. Get started by browsing chores!</p>
              <button
                onClick={() => onNavigate('browse-services')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Browse Chores
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
