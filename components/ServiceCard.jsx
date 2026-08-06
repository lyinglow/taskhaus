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
      const response = await api.get(`/api/services/${service.id}/reviews`);
      setAvgRating(response.data.avgRating || 0);
      setReviewCount(response.data.totalReviews || 0);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{service.description}</p>

      <div className="flex justify-between items-center mb-4">
        <div>
          {service.price ? (
            <div className="text-2xl font-bold text-green-600">${service.price}</div>
          ) : (
            <div className="text-lg font-semibold text-blue-600">Custom Quote</div>
          )}
        </div>
        {reviewCount > 0 && (
          <div className="text-right">
            <div className="text-yellow-500 font-semibold">★ {avgRating.toFixed(1)}</div>
            <div className="text-xs text-gray-500">{reviewCount} reviews</div>
          </div>
        )}
      </div>

      <button
        onClick={onSelect}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Select
      </button>
    </div>
  );
}
