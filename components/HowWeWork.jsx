'use client';

import Image from 'next/image';

export default function HowWeWork({ onBack }) {
  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden">
      <Image src="/garden-mist-bg.png" alt="" fill className="object-cover -z-10 grayscale" sizes="100vw" />
      <div className="absolute inset-0 bg-stone-50/70" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900 mb-6">How We Work</h1>

          <div className="space-y-5 text-stone-700">
            <p>
              Every job booked through The Garden Unit is planned, checked and signed off
              by an adult on our team, so you can trust that the work is overseen from
              start to finish and delivered to a high standard.
            </p>

            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Bins</h2>
              <p>
                Some services may need access to your brown or green bin. Brown bins are
                used for green waste only.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Power &amp; Water</h2>
              <p>
                For certain services we may need to use your power or water supply. We'll
                always be upfront about this when the job is confirmed.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Tools</h2>
              <p>
                We bring our own tools and equipment for our other services, so there's
                nothing you need to provide.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Leaving Things Right</h2>
              <p>
                Every service is left clean and tidy once the job is done.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Not Happy With Something?</h2>
              <p>
                If you're not happy with the service you received, please email us at{' '}
                <a href="mailto:services@thegardenunit.co.uk" className="font-semibold text-brand-700 hover:text-brand-800">
                  services@thegardenunit.co.uk
                </a>{' '}
                and we'll rectify the issue as soon as possible.
              </p>
            </div>

            <p>
              Our team is young and still finding their way, working hard for hard-earned
              money. Your patience, kindness and support mean a lot to them.
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
