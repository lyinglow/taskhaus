'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function ServiceIdeaManagement({ ideas, onIdeasUpdated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/service-ideas', { name, description });
      setName('');
      setDescription('');
      setShowAddForm(false);
      onIdeasUpdated();
    } catch (err) {
      console.error('Failed to add service idea:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    setLoading(true);
    try {
      await api.patch(`/admin/service-ideas/${id}`, {
        name: editData.name,
        description: editData.description,
      });
      setEditingId(null);
      setEditData({});
      onIdeasUpdated();
    } catch (err) {
      console.error('Failed to update service idea:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove this service idea?')) return;
    setLoading(true);
    try {
      await api.patch(`/admin/service-ideas/${id}`, { isActive: false });
      onIdeasUpdated();
    } catch (err) {
      console.error('Failed to remove service idea:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-stone-900">Possible services ({ideas.length})</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          {showAddForm ? 'Cancel' : '+ Add idea'}
        </button>
      </div>

      <p className="text-sm text-stone-600 mb-4">
        Services listed here aren't bookable yet - customers can just say they're interested,
        so you can see demand before deciding whether to add them properly.
      </p>

      {showAddForm && (
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-6 rounded-lg shadow mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Idea name, e.g. "Car washing"'
            required
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            rows={2}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto sm:px-8 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add idea'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {ideas.length === 0 ? (
          <p className="text-stone-600">No service ideas yet</p>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="bg-white p-5 rounded-lg border border-stone-200">
              {editingId === idea.id ? (
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
                    placeholder="Short description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(idea.id)}
                      disabled={loading}
                      className="px-6 bg-brand-700 text-white py-1 rounded text-sm font-semibold hover:bg-brand-800 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-6 bg-accent-600 text-white py-1 rounded text-sm font-semibold hover:bg-accent-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-stone-900">{idea.name}</div>
                    <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-1 rounded-full whitespace-nowrap">
                      {idea.interestCount} interested
                    </span>
                  </div>
                  {idea.description && <div className="text-sm text-stone-600 mt-1">{idea.description}</div>}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingId(idea.id);
                        setEditData({ name: idea.name, description: idea.description || '' });
                      }}
                      className="px-6 bg-brand-600 text-white py-1 rounded text-sm font-semibold hover:bg-brand-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(idea.id)}
                      className="px-6 bg-red-600 text-white py-1 rounded text-sm font-semibold hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
