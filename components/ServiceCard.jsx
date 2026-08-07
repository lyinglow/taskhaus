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
      className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition border border-gray-200 cursor-pointer"
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="text-lg font-bold text-gray-900 break-words">{service.name}</h3>
        {service.price ? (
          <div className="text-2xl font-bold text-green-600 whitespace-nowrap">£{Number(service.price).toFixed(2)}</div>
        ) : (
          <div className="text-lg font-semibold text-blue-600 whitespace-nowrap">Custom Quote</div>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-4">{service.description}</p>

      {reviewCount > 0 && (
        <div className="mb-4">
          <span className="text-yellow-500 font-semibold">★ {avgRating.toFixed(1)}</span>
          <span className="text-xs text-gray-500 ml-1">({reviewCount} reviews)</span>
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Select
      </button>
    </div>
  );
}
