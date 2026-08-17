'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import Spinner from './Spinner';

export default function Ledger({ jobs = [] }) {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterTeamMember, setFilterTeamMember] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const transactionsRef = useRef(null);

  useEffect(() => {
    fetchLedger();
  }, []);

  const filterByTeamMember = (name) => {
    setFilterTeamMember(name);
    transactionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredTransactions = (ledger?.detailed || []).filter(p =>
    (!filterTeamMember || p.crewName === filterTeamMember) &&
    (!filterCustomer || p.customerName?.toLowerCase().includes(filterCustomer.toLowerCase())) &&
    (!filterAddress || p.customerAddress?.toLowerCase().includes(filterAddress.toLowerCase()))
  );

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

  const togglePaid = async (payment) => {
    const newStatus = payment.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.patch(`/admin/payments/${payment.id}`, { status: newStatus });
      fetchLedger();
    } catch (err) {
      console.error('Failed to update payment:', err);
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Still owed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {ledger?.summary?.map(row => (
                <tr
                  key={row.id}
                  onClick={() => filterByTeamMember(row.name)}
                  className="cursor-pointer hover:bg-stone-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-stone-900">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{row.jobs_completed}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-stone-900">£{(row.earned || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    {row.owed > 0 ? <span className="text-accent-700">£{row.owed.toFixed(2)}</span> : <span className="text-stone-400">£0.00</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section ref={transactionsRef}>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Transactions</h2>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <select
            value={filterTeamMember}
            onChange={(e) => setFilterTeamMember(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All team members</option>
            {ledger?.summary?.map(row => (
              <option key={row.id} value={row.name}>{row.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            placeholder="Filter by customer"
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            value={filterAddress}
            onChange={(e) => setFilterAddress(e.target.value)}
            placeholder="Filter by address"
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Address</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Team member</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Service</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700 whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredTransactions.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 text-sm font-medium text-stone-900 whitespace-nowrap">{payment.customerName}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{payment.customerAddress || '-'}</td>
                  <td className="px-6 py-4 text-sm text-stone-600 whitespace-nowrap">{payment.crewName}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{payment.serviceName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-stone-900 whitespace-nowrap">£{payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {payment.status === 'completed' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800">
                        Paid{payment.paidDate ? ` ${new Date(payment.paidDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-800">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => togglePaid(payment)}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                    >
                      {payment.status === 'completed' ? 'Mark unpaid' : 'Mark as paid'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-sm text-stone-500 text-center">No transactions match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
