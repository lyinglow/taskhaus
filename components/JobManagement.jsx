'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function JobManagement({ jobs, crew, onJobUpdated }) {
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({});

  const pendingJobs = jobs.filter(j => j.status === 'pending' || j.status === 'quoted');
  const confirmedJobs = jobs.filter(j => j.status === 'confirmed');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const updates = { status: newStatus };
      if (formData.crewMemberId) updates.crewMemberId = parseInt(formData.crewMemberId);
      if (formData.timeWindow) updates.timeWindow = formData.timeWindow;
      if (formData.quotedPrice) updates.quotedPrice = parseFloat(formData.quotedPrice);

      await api.patch(`/admin/jobs/${jobId}`, updates);
      setEditingJob(null);
      onJobUpdated();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const JobRow = ({ job }) => (
    <div key={job.id} className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-gray-900">Service #{job.id}</h3>
          <p className="text-sm text-gray-600">{job.customerName} • {job.customerEmail}</p>
          <p className="text-sm text-gray-600">{job.serviceName || job.customRequest}</p>
        </div>
      </div>
      {editingJob === job.id ? (
        <div className="space-y-3 bg-gray-50 p-4 rounded mt-4">
          <select value={formData.crewMemberId || ''} onChange={(e) => setFormData({...formData, crewMemberId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Select team member...</option>
            {crew.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="text" placeholder="Time window" value={formData.timeWindow || ''} onChange={(e) => setFormData({...formData, timeWindow: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="number" placeholder="Quote price" value={formData.quotedPrice || ''} onChange={(e) => setFormData({...formData, quotedPrice: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <button onClick={() => handleStatusChange(job.id, 'confirmed')} className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700">
            Confirm & Notify
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-4">
          <button onClick={() => { setEditingJob(job.id); setFormData({crewMemberId: job.crewMemberId, timeWindow: job.timeWindow, quotedPrice: job.quotedPrice}); }} className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
            Edit
          </button>
          {job.status === 'pending' && <button onClick={() => handleStatusChange(job.id, 'confirmed')} className="flex-1 bg-green-600 text-white py-2 rounded font-semibold">Confirm</button>}
          {job.status === 'confirmed' && <button onClick={() => handleStatusChange(job.id, 'completed')} className="flex-1 bg-green-600 text-white py-2 rounded font-semibold">Mark Done</button>}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Services</h2>
        {pendingJobs.length === 0 ? <p className="text-gray-600">No pending services</p> : pendingJobs.map(job => <JobRow key={job.id} job={job} />)}
      </section>
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmed Services</h2>
        {confirmedJobs.length === 0 ? <p className="text-gray-600">No confirmed services</p> : confirmedJobs.map(job => <JobRow key={job.id} job={job} />)}
      </section>
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Services</h2>
        {completedJobs.length === 0 ? <p className="text-gray-600">No completed services</p> : completedJobs.map(job => <div key={job.id} className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm"><div className="font-semibold">Service #{job.id}</div><div className="text-gray-600">{job.serviceName} • {job.customerName}</div></div>)}
      </section>
    </div>
  );
}
