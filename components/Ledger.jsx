'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Spinner from './Spinner';

export default function Ledger({ jobs = [] }) {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const response = await api.get('/admin/ledger');
      setLedger(response.data);
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const csvEscape = (value) => {
    const s = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const exportSalesCSV = () => {
    const cost = (job) => job.finalPrice || job.quotedPrice || job.service?.price || '';
    const headers = ['Job ID', 'Date Booked', 'Date Completed', 'Customer', 'Service', 'Status', 'Team Member', 'Recurrence', 'Price (GBP)'];
    const rows = [...jobs]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(job => [
        job.id,
        job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-GB') : '',
        job.completedAt ? new Date(job.completedAt).toLocaleDateString('en-GB') : '',
        job.customerName || '',
        job.serviceName || job.customRequest || '',
        job.status,
        job.crewName || '',
        job.recurrence || '',
        cost(job),
      ]);

    const csv = [headers, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `garden-unit-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-10">
      <section>
        <div className="bg-white p-5 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-bold text-stone-900">Sales data</h2>
            <p className="text-sm text-stone-600">Download every booking as a CSV, then import it into Google Sheets.</p>
          </div>
          <button
            onClick={exportSalesCSV}
            disabled={jobs.length === 0}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 whitespace-nowrap"
          >
            Export sales CSV
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Team member earnings</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Team member</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Services</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {ledger?.summary?.map(row => (
                <tr key={row.id}>
                  <td className="px-6 py-4 text-sm font-medium text-stone-900">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{row.jobs_completed}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-stone-900">£{(row.earned || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Transactions</h2>
        <div className="space-y-3">
          {ledger?.detailed?.map(payment => (
            <div key={payment.id} className="bg-white p-5 rounded-lg border border-stone-200">
              <div className="flex justify-between">
                <div><div className="font-semibold text-stone-900">{payment.crewName}</div><div className="text-sm text-stone-600">{payment.serviceName}</div></div>
                <div className="text-right"><div className="text-lg font-bold text-stone-900">£{payment.amount.toFixed(2)}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
