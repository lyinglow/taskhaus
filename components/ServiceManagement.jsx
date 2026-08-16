'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function ServiceManagement({ services, onServicesUpdated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [toolsNeeded, setToolsNeeded] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('garden');
  const [requiresPhotoReview, setRequiresPhotoReview] = useState(true);
  const [partnerCredit, setPartnerCredit] = useState('');
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  const categoryLabel = (value) => (value === 'other' ? 'Other services' : 'Garden services');

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/services', {
        name,
        description,
        longDescription,
        toolsNeeded,
        serviceType: 'fixed',
        category,
        price: parseFloat(price),
        requiresPhotoReview,
        partnerCredit: partnerCredit || null,
        season: season || null,
      });
      setName('');
      setDescription('');
      setLongDescription('');
      setToolsNeeded('');
      setPrice('');
      setCategory('garden');
      setRequiresPhotoReview(true);
      setPartnerCredit('');
      setSeason('');
      setShowAddForm(false);
      onServicesUpdated();
    } catch (err) {
      console.error('Failed to add service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (serviceId) => {
    setLoading(true);
    try {
      await api.patch(`/services/${serviceId}`, {
        name: editData.name,
        description: editData.description,
        longDescription: editData.longDescription,
        toolsNeeded: editData.toolsNeeded,
        price: parseFloat(editData.price),
        category: editData.category,
        requiresPhotoReview: editData.requiresPhotoReview,
        partnerCredit: editData.partnerCredit || null,
        season: editData.season || null,
      });
      setEditingId(null);
      setEditData({});
      onServicesUpdated();
    } catch (err) {
      console.error('Failed to update service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to deactivate this service?')) return;
    setLoading(true);
    try {
      await api.patch(`/services/${serviceId}`, { isActive: false });
      onServicesUpdated();
    } catch (err) {
      console.error('Failed to delete service:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-stone-900">Services ({services.length})</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          {showAddForm ? 'Cancel' : '+ Add service'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-6 rounded-lg shadow mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Service name"
            required
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (shown on service cards)"
            rows={2}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            placeholder="Long description (shown on the booking/detail page)"
            rows={4}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <textarea
            value={toolsNeeded}
            onChange={(e) => setToolsNeeded(e.target.value)}
            placeholder="Tools needed (shown to team members on their job list)"
            rows={2}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price (£)"
            step="0.01"
            required
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="garden">Garden services</option>
            <option value="other">Other services</option>
          </select>
          <label className="flex items-start gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={requiresPhotoReview}
              onChange={(e) => setRequiresPhotoReview(e.target.checked)}
              className="mt-0.5"
            />
            <span>Team members must mark the job "ready for review" with an after photo before it can be completed</span>
          </label>
          <input
            type="text"
            value={partnerCredit}
            onChange={(e) => setPartnerCredit(e.target.value)}
            placeholder='Partner credit (optional), e.g. "Tools provided by Acme Hardware"'
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder='Season (optional), e.g. "Spring - Autumn" or "Year-round"'
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto sm:px-8 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add service'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {services.map((service) => (
            <div
              key={service.id}
              className="bg-white p-5 rounded-lg border border-stone-200"
            >
              {editingId === service.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Short description (shown on service cards)"
                    rows={2}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                  <textarea
                    value={editData.longDescription || ''}
                    onChange={(e) => setEditData({ ...editData, longDescription: e.target.value })}
                    placeholder="Long description (shown on the booking/detail page)"
                    rows={4}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                  <textarea
                    value={editData.toolsNeeded || ''}
                    onChange={(e) => setEditData({ ...editData, toolsNeeded: e.target.value })}
                    placeholder="Tools needed (shown to team members on their job list)"
                    rows={2}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={editData.price || ''}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    step="0.01"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                  <select
                    value={editData.category || 'garden'}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  >
                    <option value="garden">Garden services</option>
                    <option value="other">Other services</option>
                  </select>
                  <label className="flex items-start gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={editData.requiresPhotoReview ?? true}
                      onChange={(e) => setEditData({ ...editData, requiresPhotoReview: e.target.checked })}
                      className="mt-0.5"
                    />
                    <span>Team members must mark the job "ready for review" with an after photo before it can be completed</span>
                  </label>
                  <input
                    type="text"
                    value={editData.partnerCredit || ''}
                    onChange={(e) => setEditData({ ...editData, partnerCredit: e.target.value })}
                    placeholder='Partner credit (optional), e.g. "Tools provided by Acme Hardware"'
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={editData.season || ''}
                    onChange={(e) => setEditData({ ...editData, season: e.target.value })}
                    placeholder='Season (optional), e.g. "Spring - Autumn" or "Year-round"'
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(service.id)}
                      disabled={loading}
                      className="flex-1 sm:flex-none sm:px-6 bg-brand-700 text-white py-1 rounded text-sm font-semibold hover:bg-brand-800 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 sm:flex-none sm:px-6 bg-accent-600 text-white py-1 rounded text-sm font-semibold hover:bg-accent-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-stone-900">{service.name}</div>
                    <span className="text-xs font-medium text-accent-700 bg-accent-50 px-2 py-1 rounded-full whitespace-nowrap">
                      {categoryLabel(service.category)}
                    </span>
                  </div>
                  <div className="text-sm text-stone-600 mt-1">{service.description}</div>
                  <div className="text-base font-bold text-stone-900 mt-2"><span className="text-[13px] font-medium align-baseline">From </span>£{Number(service.price).toFixed(2)}</div>
                  <div className="text-xs text-stone-500 mt-1">
                    {service.requiresPhotoReview === false ? 'No photo review required' : 'Requires photo review before completion'}
                  </div>
                  {service.partnerCredit && (
                    <div className="text-xs text-accent-700 mt-1">🤝 {service.partnerCredit}</div>
                  )}
                  {service.season && (
                    <div className="text-xs text-stone-500 mt-1">📅 {service.season}</div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingId(service.id);
                        setEditData({
                          name: service.name,
                          description: service.description,
                          longDescription: service.longDescription,
                          toolsNeeded: service.toolsNeeded,
                          price: service.price,
                          category: service.category || 'garden',
                          requiresPhotoReview: service.requiresPhotoReview !== false,
                          partnerCredit: service.partnerCredit || '',
                          season: service.season || '',
                        });
                      }}
                      className="flex-1 sm:flex-none sm:px-6 bg-brand-600 text-white py-1 rounded text-sm font-semibold hover:bg-brand-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="flex-1 sm:flex-none sm:px-6 bg-red-600 text-white py-1 rounded text-sm font-semibold hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
        ))}
      </div>
    </div>
  );
}
