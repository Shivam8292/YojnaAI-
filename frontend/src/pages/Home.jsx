import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../translations';
import LanguageToggle from '../components/LanguageToggle';

const STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function Home() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('lang') || '');
  const [state, setState] = useState(localStorage.getItem('selectedState') || '');
  const [includeCentral, setIncludeCentral] = useState(
    localStorage.getItem('includeCentral') !== 'false'
  );
  const [includeState, setIncludeState] = useState(
    localStorage.getItem('includeState') !== 'false'
  );

  useEffect(() => {
    // Redirect if no language selected
    if (!localStorage.getItem('lang')) {
      navigate('/');
    }
  }, [navigate]);

  if (!lang) return null;
  const translations = t[lang];

  const handleNext = () => {
    if (!state) return;
    
    // Save settings
    localStorage.setItem('selectedState', state);
    localStorage.setItem('includeCentral', includeCentral.toString());
    localStorage.setItem('includeState', includeState.toString());
    
    navigate('/check');
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-background justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-10 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">सरकार साथी</h1>
            <p className="text-xs text-text-secondary font-bold">Sarkar Saathi</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-text-primary mb-8 text-center leading-snug">
          {translations.homeTitle}
        </h2>

        {/* Input Blocks */}
        <div className="space-y-6">
          {/* Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-text-primary">
              📌 {translations.selectState}
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 bg-white text-text-primary text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none min-h-[48px]"
            >
              <option value="">-- {translations.selectState} --</option>
              {STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Scheme Checkboxes */}
          <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
            <label className="text-sm font-extrabold text-text-secondary block mb-1">
              Filter By Type
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={includeCentral}
                onChange={(e) => setIncludeCentral(e.target.checked)}
                className="w-5 h-5 accent-primary rounded cursor-pointer"
              />
              <span className="text-base font-semibold text-text-primary">
                {translations.centralSchemes}
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={includeState}
                onChange={(e) => setIncludeState(e.target.checked)}
                className="w-5 h-5 accent-primary rounded cursor-pointer"
              />
              <span className="text-base font-semibold text-text-primary">
                {translations.stateSchemes}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="mt-12 space-y-4">
        {!state && (
          <p className="text-sm text-error text-center font-bold">
            ⚠️ {translations.stateRequired}
          </p>
        )}
        <button
          onClick={handleNext}
          disabled={!state}
          className={`w-full text-white font-extrabold py-3.5 px-6 rounded-xl text-lg shadow-sm transition-all duration-200 min-h-[48px] ${
            state 
              ? 'bg-primary hover:bg-opacity-95 cursor-pointer' 
              : 'bg-border text-text-secondary cursor-not-allowed'
          }`}
          aria-label={translations.getStarted}
        >
          {translations.getStarted} →
        </button>
      </div>

      <LanguageToggle onLanguageChange={(next) => setLang(next)} />
    </div>
  );
}
