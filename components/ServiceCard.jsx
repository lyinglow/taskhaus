'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ServiceCard({ service, onSelect }) {
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [service.id]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/services/${service.id}/reviews`);
      setAvgRating(response.data.avgRating || 0);
      setReviewCount(response.data.totalReviews || 0);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border border-stone-200 cursor-pointer"
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="text-xl font-bold text-stone-900 leading-tight break-words">{service.name}</h3>
        {service.price ? (
          <div className="text-xl font-bold text-brand-700 whitespace-nowrap"><span className="text-[13px] font-medium align-baseline">From </span>£{Number(service.price).toFixed(2)}</div>
        ) : (
          <div className="text-lg font-semibold text-accent-600 whitespace-nowrap">Custom quote</div>
        )}
      </div>
      <p className="text-stone-600 text-sm mb-5">{service.description}</p>

      {service.partnerCredit && (
        <p className="text-xs text-accent-700 mb-4">🤝 {service.partnerCredit}</p>
      )}

      {reviewCount > 0 && (
        <div className="mb-5">
          <span className="text-yellow-500 font-semibold">★ {avgRating.toFixed(1)}</span>
          <span className="text-xs text-stone-500 ml-1">({reviewCount} reviews)</span>
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className="w-full sm:w-auto sm:px-8 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 transition"
      >
        Select
      </button>
    </div>
  );
}
