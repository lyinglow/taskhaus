'use client';

import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

const OFFER_OPTIONS = [
  { value: 'tools', label: 'Tools or equipment' },
  { value: 'materials', label: 'Better-priced materials (mulch, sand, soil, etc.)' },
  { value: 'discounts', label: 'Trade discounts' },
  { value: 'other', label: 'Something else' }
];

export default function Partners({ onBack }) {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [offerTypes, setOfferTypes] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleOffer = (value) => {
    setOfferTypes((prev) => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/partners', {
        businessName,
        contactName,
        email,
        phone: phone || null,
        offerTypes: offerTypes.map(v => OFFER_OPTIONS.find(o => o.value === v)?.label || v),
        message: message || null
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden">
      <Image src="/garden-mist-bg.png" alt="" fill className="object-cover -z-10 grayscale" sizes="100vw" />
      <div className="absolute inset-0 bg-stone-50/70" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">Partner with us</h1>
          <p className="text-stone-600 mb-8">
            We're always keen to work with local businesses who can help us do a better job for
            our customers - whether that's tools and equipment, better-priced materials like mulch,
            sand or soil, or trade discounts of any kind. Partners who supply what we use are proudly
            credited as "Provided by" on the relevant service, so it's a chance to get your business
            in front of local families too. Tell us a bit about what you can offer below.
          </p>

          {submitted ? (
            <div className="bg-brand-50 text-brand-800 p-4 rounded-lg text-sm">
              Thanks for getting in touch! We'll be in contact soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Business name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Contact name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">What can you offer?</label>
                <div className="space-y-2">
                  {OFFER_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-stone-700">
                      <input
                        type="checkbox"
                        checked={offerTypes.includes(option.value)}
                        onChange={() => toggleOffer(option.value)}
                        className="rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tell us more (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto sm:px-8 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {loading ? 'Sending...' : 'Get in touch'}
              </button>
            </form>
          )}
        </div>

        {onBack && (
          <div className="text-center mt-6">
            <button onClick={onBack} className="text-brand-700 hover:text-brand-800 font-medium">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
