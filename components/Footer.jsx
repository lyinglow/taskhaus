'use client';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-stone-200 bg-white mt-auto">
      <div className="container max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-sm text-stone-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} The Garden Unit</p>
          <a href="mailto:services@thegardenunit.co.uk" className="hover:text-brand-700">services@thegardenunit.co.uk</a>
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => onNavigate('about')}
            className="text-sm font-medium text-stone-600 hover:text-brand-700"
          >
            About
          </button>
          <button
            onClick={() => onNavigate('how-we-work')}
            className="text-sm font-medium text-stone-600 hover:text-brand-700"
          >
            How we work
          </button>
          <button
            onClick={() => onNavigate('feedback')}
            className="text-sm font-medium text-stone-600 hover:text-brand-700"
          >
            Feedback
          </button>
          <button
            onClick={() => onNavigate('partners')}
            className="text-sm font-medium text-stone-600 hover:text-brand-700"
          >
            Partners
          </button>
        </div>
      </div>
    </footer>
  );
}
