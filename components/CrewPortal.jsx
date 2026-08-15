'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Spinner from './Spinner';

const compressImage = (file, maxDim = 1000, quality = 0.7) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = height * (maxDim / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = width * (maxDim / height);
        height = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function CrewPortal() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [markingReady, setMarkingReady] = useState({});

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    api.get('/crew/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error('Failed to fetch jobs:', err))
      .finally(() => setLoading(false));
  };

  const getStatusLabel = (status) => {
    const labels = { pending: 'Pending', quoted: 'Quote sent', confirmed: 'Confirmed', review: 'Awaiting admin review', completed: 'Completed' };
    return labels[status] || status;
  };

  const getCost = (job) => job.finalPrice || job.quotedPrice || job.servicePrice || 0;

  const now = new Date();
  const completedThisMonth = jobs.filter(j => {
    if (j.status !== 'completed' || !j.completedAt) return false;
    const d = new Date(j.completedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyValue = completedThisMonth.reduce((sum, j) => sum + getCost(j), 0);

  const handlePhotoChange = async (jobId, type, file) => {
    if (!file) return;
    const key = `${jobId}-${type}`;
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const dataUrl = await compressImage(file);
      const field = type === 'before' ? 'photoBeforeUrl' : 'photoAfterUrl';
      await api.patch(`/crew/jobs/${jobId}`, { [field]: dataUrl });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, [field]: dataUrl } : j));
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const markReadyForReview = async (jobId) => {
    setMarkingReady(prev => ({ ...prev, [jobId]: true }));
    try {
      await api.patch(`/crew/jobs/${jobId}`, { status: 'review' });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'review' } : j));
    } catch (err) {
      console.error('Failed to mark job ready for review:', err);
    } finally {
      setMarkingReady(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const activeJobs = jobs.filter(j => j.status !== 'completed');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const PhotoSlot = ({ job, type, label }) => {
    const key = `${job.id}-${type}`;
    const url = type === 'before' ? job.photoBeforeUrl : job.photoAfterUrl;
    return (
      <label className="flex-1 cursor-pointer">
        <div className="text-xs font-medium text-stone-500 mb-1">{label}</div>
        {url ? (
          <img src={url} alt={label} className="w-full aspect-square object-cover rounded-lg border border-stone-200" />
        ) : (
          <div className="w-full aspect-square rounded-lg border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-xs text-center px-2">
            {uploading[key] ? 'Uploading...' : `+ Add ${label.toLowerCase()} photo`}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handlePhotoChange(job.id, type, e.target.files?.[0])}
        />
      </label>
    );
  };

  const JobCard = ({ job }) => (
    <div className="bg-white p-5 rounded-lg border border-stone-200 mb-3">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-stone-900">{job.serviceName || job.customRequest}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${job.status === 'review' ? 'bg-accent-100 text-accent-800' : 'bg-brand-100 text-brand-800'}`}>
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
      <div className="flex gap-3 mt-4">
        <PhotoSlot job={job} type="before" label="Before" />
        <PhotoSlot job={job} type="after" label="After" />
      </div>
      {job.status === 'confirmed' && job.requiresPhotoReview !== false && (
        <button
          onClick={() => markReadyForReview(job.id)}
          disabled={!job.photoAfterUrl || markingReady[job.id]}
          className="w-full sm:w-auto sm:px-8 mt-3 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {markingReady[job.id] ? 'Marking...' : 'Job ready for review'}
        </button>
      )}
      {job.status === 'confirmed' && job.requiresPhotoReview !== false && !job.photoAfterUrl && (
        <p className="text-xs text-stone-500 mt-1 text-center">Add an "after" photo before marking ready for review</p>
      )}
      {job.status === 'review' && (
        <p className="text-sm text-accent-700 mt-3 text-center">✓ Waiting on admin to do the final check</p>
      )}
    </div>
  );

  return (
    <div className="container max-w-2xl py-10 mx-auto px-4">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">My jobs</h1>

      {!loading && jobs.length > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-lg p-5 mb-8 flex gap-8">
          <div>
            <div className="text-2xl font-bold text-brand-800">{completedThisMonth.length}</div>
            <div className="text-sm text-stone-600">Jobs completed this month</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-800">£{monthlyValue.toFixed(2)}</div>
            <div className="text-sm text-stone-600">Value of work this month</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
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
