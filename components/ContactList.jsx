'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Spinner from './Spinner';

export default function ContactList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/admin/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const query = search.trim().toLowerCase();
  const filteredCustomers = customers.filter(c =>
    !query ||
    c.name?.toLowerCase().includes(query) ||
    c.email?.toLowerCase().includes(query) ||
    c.phone?.toLowerCase().includes(query) ||
    c.address?.toLowerCase().includes(query)
  );

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-stone-900">Contacts ({customers.length})</h2>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, phone or address"
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
      />

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Address</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Jobs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td className="px-6 py-4 text-sm font-medium text-stone-900 whitespace-nowrap">{customer.name}</td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="text-brand-700 hover:text-brand-800">{customer.phone}</a>
                  ) : (
                    <span className="text-stone-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <a href={`mailto:${customer.email}`} className="text-brand-700 hover:text-brand-800">{customer.email}</a>
                </td>
                <td className="px-6 py-4 text-sm text-stone-600">{customer.address || <span className="text-stone-400">-</span>}</td>
                <td className="px-6 py-4 text-sm text-stone-600">{customer.jobCount}</td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-sm text-stone-500 text-center">No contacts match "{search}".</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
