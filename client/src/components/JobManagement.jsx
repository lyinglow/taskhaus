import { useState } from 'react';
import api from '../api';

export default function JobManagement({ jobs, crew, onJobUpdated }) {
  const [editingJob, setEditingJob] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const pendingJobs = jobs.filter(j => j.status === 'pending' || j.status === 'quoted');
  const confirmedJobs = jobs.filter(j => j.status === 'confirmed');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const handleEdit = (job) => {
    setEditingJob(job.id);
    setFormData({
      crewMemberId: job.crew_member_id || '',
      timeWindow: job.time_window || '',
      quotedPrice: job.quoted_price || '',
      jobDate: job.job_date || '',
      notes: job.notes || ''
    });
  };

  const handleSave = async (jobId) => {
    setError('');
    try {
      await api.patch(`/admin/jobs/${jobId}`, {
        crewMemberId: formData.crewMemberId ? parseInt(formData.crewMemberId) : undefined,
        timeWindow: formData.timeWindow,
        quotedPrice: formData.quotedPrice ? parseFloat(formData.quotedPrice) : undefined,
        jobDate: formData.jobDate,
        notes: formData.notes,
        status: formData.status
      });

      setEditingJob(null);
      onJobUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    setError('');
    try {
      await api.patch(`/admin/jobs/${jobId}`, { status: newStatus });
      onJobUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    }
  };

  const JobRow = ({ job, section }) => (
    <div key={job.id} className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-gray-900">Job #{job.id}</h3>
          <p className="text-sm text-gray-600">{job.parent_name} • {job.parent_email}</p>
          <p className="text-sm text-gray-600">{job.service_name || job.custom_request}</p>
        </div>
        <button
          onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
          className="text-gray-600 hover:text-gray-900"
        >
          {expandedJob === job.id ? '▼' : '▶'}
        </button>
      </div>

      {expandedJob === job.id && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {editingJob === job.id ? (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Crew</label>
                <select
                  value={formData.crewMemberId}
                  onChange={(e) => setFormData({ ...formData, crewMemberId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select crew member...</option>
                  {crew.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (age {c.age})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Window</label>
                <input
                  type="text"
                  value={formData.timeWindow}
                  onChange={(e) => setFormData({ ...formData, timeWindow: e.target.value })}
                  placeholder="e.g., Saturday 10am-12pm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Date</label>
                <input
                  type="date"
                  value={formData.jobDate}
                  onChange={(e) => setFormData({ ...formData, jobDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {job.service_type === 'quote' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quote Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quotedPrice}
                    onChange={(e) => setFormData({ ...formData, quotedPrice: e.target.value })}
                    placeholder="$0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{error}</div>}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData({ ...formData, status: 'confirmed' });
                    handleSave(job.id);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
                >
                  Confirm & Notify
                </button>
                <button
                  onClick={() => setEditingJob(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Crew:</span>
                <span className="text-sm text-gray-600 ml-2">{job.crew_name || 'Not assigned'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Time:</span>
                <span className="text-sm text-gray-600 ml-2">{job.time_window || 'Not set'}</span>
              </div>
              {job.quoted_price && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Quote:</span>
                  <span className="text-sm text-gray-600 ml-2">${job.quoted_price}</span>
                </div>
              )}
              {job.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Notes:</span>
                  <p className="text-sm text-gray-600 mt-1">{job.notes}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(job)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
                >
                  Edit
                </button>
                {section === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(job.id, 'confirmed')}
                    className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
                  >
                    Confirm
                  </button>
                )}
                {section === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(job.id, 'completed')}
                    className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Jobs</h2>
        {pendingJobs.length === 0 ? (
          <p className="text-gray-600">No pending jobs</p>
        ) : (
          <div>{pendingJobs.map(job => <JobRow key={job.id} job={job} section="pending" />)}</div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmed Jobs</h2>
        {confirmedJobs.length === 0 ? (
          <p className="text-gray-600">No confirmed jobs</p>
        ) : (
          <div>{confirmedJobs.map(job => <JobRow key={job.id} job={job} section="confirmed" />)}</div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Jobs</h2>
        {completedJobs.length === 0 ? (
          <p className="text-gray-600">No completed jobs</p>
        ) : (
          <div className="space-y-2">
            {completedJobs.map(job => (
              <div key={job.id} className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm">
                <div className="font-semibold text-gray-900">Job #{job.id}</div>
                <div className="text-gray-600">{job.service_name} • {job.parent_name}</div>
                <div className="text-gray-600">Crew: {job.crew_name}</div>
                <div className="text-gray-600">Completed: {job.completed_at?.split('T')[0]}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
