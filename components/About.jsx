'use client';

import Image from 'next/image';

export default function About({ onBack }) {
  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden">
      <Image src="/garden-mist-bg.png" alt="" fill className="object-cover -z-10 grayscale" sizes="100vw" />
      <div className="absolute inset-0 bg-stone-50/70" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900 mb-6">About The Garden Unit</h1>

          <div className="space-y-5 text-stone-700">
            <p>
              The Garden Unit is a local neighbourhood service run and managed by a small
              team of young entrepreneurs aged 12 and up, offering a trusted, reliable
              helping hand for local families and a chance to earn some extra money
              along the way.
            </p>
            <p>
              Every booking is reviewed and coordinated by an adult, so you can book with
              confidence knowing quality and safety come first.
            </p>
            <p>
              We take pride in the work we do, from garden maintenance to bin cleaning, and
              every booking helps our team build real-world experience in running a
              business, managing schedules and delivering great service.
            </p>
            <p>
              Thank you for supporting local, youth-run enterprise.
            </p>
          </div>
        </div>

        {onBack && (
          <div className="text-center mt-6">
            <button
              onClick={onBack}
              className="text-brand-700 hover:text-brand-800 font-medium"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
