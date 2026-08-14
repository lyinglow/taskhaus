'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function JobManagement({ jobs, crew, onJobUpdated }) {
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({});
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const getStatusLabel = (status) => {
    const labels = { pending: 'Pending', quoted: 'Quote Sent', confirmed: 'Confirmed', review: 'Ready for Review', completed: 'Completed', cancelled: 'Cancelled' };
    return labels[status] || status;
  };

  const getCost = (job) => {
    if (job.finalPrice) return { label: 'Final price', value: job.finalPrice, from: false };
    if (job.quotedPrice) return { label: 'Quoted price', value: job.quotedPrice, from: false };
    if (job.service?.price) return { label: 'Base price', value: job.service.price, from: true };
    return null;
  };

  const recurrenceLabel = (recurrence) => {
    const labels = { weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly' };
    return labels[recurrence];
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const updates = { status: newStatus };
      if (formData.crewMemberId) updates.crewMemberId = parseInt(formData.crewMemberId);
      if (formData.timeWindow) updates.timeWindow = formData.timeWindow;
      if (formData.quotedPrice) updates.quotedPrice = parseFloat(formData.quotedPrice);

      await api.patch('/admin/jobs', { jobId, ...updates });
      setEditingJob(null);
      onJobUpdated();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const customers = Object.values(
    jobs.reduce((acc, job) => {
      if (!acc[job.parentId]) {
        acc[job.parentId] = {
          parentId: job.parentId,
          customerName: job.customerName,
          customerEmail: job.customerEmail,
          customerAddress: job.customerAddress,
          jobs: [],
        };
      }
      acc[job.parentId].jobs.push(job);
      return acc;
    }, {})
  ).sort((a, b) => {
    const aPending = a.jobs.some(j => j.status === 'pending' || j.status === 'quoted' || j.status === 'review');
    const bPending = b.jobs.some(j => j.status === 'pending' || j.status === 'quoted' || j.status === 'review');
    if (aPending !== bPending) return aPending ? -1 : 1;
    return a.customerName.localeCompare(b.customerName);
  });

  const JobRow = ({ job }) => {
    const cost = getCost(job);
    return (
    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-stone-900">{job.serviceName || 'Custom Request'}</h3>
          {job.serviceName && job.customRequest && (
            <p className="text-sm text-stone-600 mt-0.5">{job.customRequest}</p>
          )}
          {cost && (
            <p className="text-sm text-stone-600 mt-0.5">
              {cost.from && <span className="text-xs">From </span>}£{Number(cost.value).toFixed(2)}
              <span className="text-stone-400"> · {cost.label}</span>
            </p>
          )}
          {job.recurrence && (
            <p className="text-sm text-accent-700 mt-0.5">🔁 Repeats {recurrenceLabel(job.recurrence)}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${job.status === 'review' ? 'bg-accent-100 text-accent-800' : job.status === 'cancelled' ? 'bg-stone-200 text-stone-600' : 'bg-brand-100 text-brand-800'}`}>
          {getStatusLabel(job.status)}
        </span>
      </div>
      {(job.photoBeforeUrl || job.photoAfterUrl) && (
        <div className="flex gap-2 mb-2">
          {job.photoBeforeUrl && (
            <a href={job.photoBeforeUrl} target="_blank" rel="noopener noreferrer" className="block">
              <img src={job.photoBeforeUrl} alt="Before" className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
            </a>
          )}
          {job.photoAfterUrl && (
            <a href={job.photoAfterUrl} target="_blank" rel="noopener noreferrer" className="block">
              <img src={job.photoAfterUrl} alt="After" className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
            </a>
          )}
        </div>
      )}
      {editingJob === job.id ? (
        <div className="space-y-3 bg-white p-4 rounded mt-4">
          <select value={formData.crewMemberId || ''} onChange={(e) => setFormData({...formData, crewMemberId: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg">
            <option value="">Select team member...</option>
            {crew.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="text" placeholder="Time window" value={formData.timeWindow || ''} onChange={(e) => setFormData({...formData, timeWindow: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
          <input type="number" step="0.01" placeholder="Quote price" value={formData.quotedPrice || ''} onChange={(e) => setFormData({...formData, quotedPrice: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
          <button onClick={() => handleStatusChange(job.id, 'confirmed')} className="w-full bg-brand-700 text-white py-2 rounded font-semibold hover:bg-brand-800">
            Confirm & Notify
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-4">
          <button onClick={() => { setEditingJob(job.id); setFormData({crewMemberId: job.crewMemberId, timeWindow: job.timeWindow, quotedPrice: job.quotedPrice}); }} className="flex-1 bg-brand-600 text-white py-2 rounded font-semibold hover:bg-brand-700">
            Edit
          </button>
          {job.status === 'pending' && <button onClick={() => handleStatusChange(job.id, 'confirmed')} className="flex-1 bg-brand-700 text-white py-2 rounded font-semibold hover:bg-brand-800">Confirm</button>}
          {job.status === 'confirmed' && <button onClick={() => handleStatusChange(job.id, 'completed')} className="flex-1 bg-brand-700 text-white py-2 rounded font-semibold hover:bg-brand-800">Mark Done</button>}
          {job.status === 'review' && <button onClick={() => handleStatusChange(job.id, 'completed')} className="flex-1 bg-accent-600 text-white py-2 rounded font-semibold hover:bg-accent-700">Approve & Complete</button>}
        </div>
      )}
    </div>
    );
  };

  return (
    <div className="space-y-3">
      {customers.length === 0 ? (
        <p className="text-stone-600">No requests yet</p>
      ) : (
        customers.map(customer => {
          const pendingCount = customer.jobs.filter(j => j.status === 'pending' || j.status === 'quoted').length;
          const reviewCount = customer.jobs.filter(j => j.status === 'review').length;
          const isExpanded = expandedCustomer === customer.parentId;

          return (
            <div key={customer.parentId} className="bg-white rounded-lg border border-stone-200 overflow-hidden">
              <button
                onClick={() => setExpandedCustomer(isExpanded ? null : customer.parentId)}
                className="w-full flex justify-between items-center gap-3 p-5 text-left hover:bg-stone-50 transition"
              >
                <div>
                  <div className="font-bold text-stone-900">{customer.customerName}</div>
                  <div className="text-sm text-stone-600">{customer.customerAddress || 'No address on file'}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {reviewCount > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-800 whitespace-nowrap">
                      {reviewCount} ready for review
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-50 text-accent-700 whitespace-nowrap">
                      {pendingCount} pending
                    </span>
                  )}
                  <span className="text-sm text-stone-500">{customer.jobs.length} service{customer.jobs.length === 1 ? '' : 's'}</span>
                  <span className="text-stone-400">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5">
                  {customer.jobs.filter(j => j.status !== 'cancelled').map(job => <JobRow key={job.id} job={job} />)}
                  {customer.jobs.some(j => j.status === 'cancelled') && (
                    <>
                      <h4 className="text-sm font-semibold text-stone-500 mt-2 mb-3">Cancelled</h4>
                      {customer.jobs.filter(j => j.status === 'cancelled').map(job => <JobRow key={job.id} job={job} />)}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
