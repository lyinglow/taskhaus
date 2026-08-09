'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import Spinner from './Spinner';

export default function Profile({ onProfileUpdated }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/customer/profile');
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      address: profile.address || '',
      marketingOptIn: profile.marketingOptIn || false
    });
    setError('');
    setSuccess(false);
    setEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await api.patch('/customer/profile', formData);
      setProfile(response.data);
      localStorage.setItem('userName', response.data.name);
      setEditing(false);
      setSuccess(true);
      if (onProfileUpdated) onProfileUpdated(response.data.name);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-8 flex justify-center"><Spinner /></div>;
  if (!profile) return <div className="container py-8">{error || 'Profile not found'}</div>;

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden">
      <Image src="/garden-mist-bg.png" alt="" fill className="object-cover -z-10 grayscale" sizes="100vw" />
      <div className="absolute inset-0 bg-stone-50/70" />
      <div className="relative z-10 max-w-2xl mx-auto">
      <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">My Profile</h1>

        {success && !editing && (
          <div className="bg-brand-50 text-brand-700 p-3 rounded-lg text-sm mb-6">Profile updated successfully.</div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={formData.marketingOptIn}
                onChange={(e) => setFormData({ ...formData, marketingOptIn: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
              />
              Send me emails about new services and offers
            </label>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 bg-accent-600 text-white py-2 rounded-lg font-semibold hover:bg-accent-700 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="text-sm font-medium text-stone-500">Full Name</div>
              <div className="text-stone-900">{profile.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-stone-500">Email</div>
              <div className="text-stone-900">{profile.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-stone-500">Phone</div>
              <div className="text-stone-900">{profile.phone || 'Not provided'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-stone-500">Address</div>
              <div className="text-stone-900">{profile.address || 'Not provided'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-stone-500">Marketing Emails</div>
              <div className="text-stone-900">{profile.marketingOptIn ? 'Subscribed' : 'Not subscribed'}</div>
            </div>

            <button
              onClick={startEditing}
              className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 transition mt-2"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
