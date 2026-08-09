'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function CrewPortal() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/crew/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error('Failed to fetch jobs:', err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusLabel = (status) => {
    const labels = { pending: 'Pending', quoted: 'Quote Sent', confirmed: 'Confirmed', completed: 'Completed' };
    return labels[status] || status;
  };

  const activeJobs = jobs.filter(j => j.status !== 'completed');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const JobCard = ({ job }) => (
    <div className="bg-white p-5 rounded-lg border border-stone-200 mb-3">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-stone-900">{job.serviceName || job.customRequest}</h3>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 whitespace-nowrap">
          {getStatusLabel(job.status)}
        </span>
      </div>
      <div className="text-sm text-stone-600">{job.customerName}</div>
      {job.customerAddress && <div className="text-sm text-stone-600">{job.customerAddress}</div>}
      {job.timeWindow && <div className="text-sm text-stone-600 mt-1">Time: {job.timeWindow}</div>}
      {job.serviceDescription && (
        <div className="text-sm text-stone-600 mt-2">{job.serviceDescription}</div>
      )}
      {job.toolsNeeded && (
        <div className="mt-3 bg-accent-50 text-accent-700 text-sm p-3 rounded-lg">
          <span className="font-semibold">Tools needed: </span>{job.toolsNeeded}
        </div>
      )}
    </div>
  );

  return (
    <div className="container max-w-2xl py-10 mx-auto px-4">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">My Jobs</h1>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-stone-100 p-10 rounded-lg text-center">
          <p className="text-stone-600">No jobs assigned to you yet.</p>
        </div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Active</h2>
            {activeJobs.length === 0 ? (
              <p className="text-stone-600">No active jobs</p>
            ) : (
              activeJobs.map(job => <JobCard key={job.id} job={job} />)
            )}
          </section>

          {completedJobs.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-stone-900 mb-4">Completed</h2>
              {completedJobs.map(job => <JobCard key={job.id} job={job} />)}
            </section>
          )}
        </>
      )}
    </div>
  );
}
