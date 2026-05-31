import React from 'react';
import { t } from '../translations';

export default function SchemeCard({ scheme, onSelect }) {
  const lang = localStorage.getItem('lang') || 'hi';
  const translations = t[lang];

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      <div>
        <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1">
          {scheme.ministry || translations.centralSchemes}
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-3 leading-snug">
          {scheme.name}
        </h3>
        
        {scheme.benefit && (
          <div className="mb-3 bg-primary-light bg-opacity-50 p-2.5 rounded-lg">
            <span className="text-xs font-bold text-primary block mb-0.5">
              💰 {translations.benefitLabel}:
            </span>
            <p className="text-sm font-semibold text-text-primary">
              {scheme.benefit}
            </p>
          </div>
        )}

        {scheme.why_eligible && (
          <div className="text-sm text-text-secondary mb-4">
            <span className="font-bold text-text-primary block mb-1">
              ✨ {translations.whyEligibleLabel}
            </span>
            <p className="italic">"{scheme.why_eligible}"</p>
          </div>
        )}
      </div>

      <button
        onClick={() => onSelect(scheme.id)}
        className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors duration-200 text-sm min-h-[44px]"
        aria-label={`${translations.knowMore} about ${scheme.name}`}
      >
        {translations.knowMore} →
      </button>
    </div>
  );
}
