'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function ServiceManagement({ services, onServicesUpdated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('garden');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const categoryLabel = (value) => (value === 'other' ? 'Other Services' : 'Garden Services');

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/services', {
        name,
        description,
        serviceType: 'fixed',
        category,
        price: parseFloat(price),
      });
      setName('');
      setDescription('');
      setPrice('');
      setCategory('garden');
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
        price: parseFloat(editData.price),
        category: editData.category,
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
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Service</h2>
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Service name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price (£)"
            step="0.01"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="garden">Garden Services</option>
            <option value="other">Other Services</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Service'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Services ({services.length})</h2>
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              {editingId === service.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={editData.price || ''}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <select
                    value={editData.category || 'garden'}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="garden">Garden Services</option>
                    <option value="other">Other Services</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(service.id)}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-1 rounded text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-300 text-gray-700 py-1 rounded text-sm font-semibold hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-gray-900">{service.name}</div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                      {categoryLabel(service.category)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                  <div className="text-lg font-bold text-gray-900 mt-2">£{Number(service.price).toFixed(2)}</div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingId(service.id);
                        setEditData({
                          name: service.name,
                          description: service.description,
                          price: service.price,
                          category: service.category || 'garden',
                        });
                      }}
                      className="flex-1 bg-blue-600 text-white py-1 rounded text-sm font-semibold hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="flex-1 bg-red-600 text-white py-1 rounded text-sm font-semibold hover:bg-red-700"
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
    </div>
  );
}
