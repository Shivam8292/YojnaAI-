import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../translations';

export default function LanguageSelect() {
  const navigate = useNavigate();

  const handleSelect = (lang) => {
    localStorage.setItem('lang', lang);
    navigate('/home');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-primary mb-2">
            सरकार साथी
          </h1>
          <p className="text-text-secondary font-bold text-sm tracking-wide">
            SARKAR SAATHI
          </p>
          <div className="w-12 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
        </div>

        <p className="text-lg font-bold text-text-primary mb-8 leading-snug">
          अपनी भाषा चुनें / Choose Your Language
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleSelect('hi')}
            className="w-full bg-primary hover:bg-opacity-95 text-white font-extrabold py-4 px-6 rounded-xl shadow-sm text-lg transition duration-200 min-h-[56px] border-2 border-primary"
            aria-label="हिंदी में जारी रखें"
          >
            हिंदी में जारी रखें
          </button>
          
          <button
            onClick={() => handleSelect('en')}
            className="w-full bg-white hover:bg-primary-light text-primary font-extrabold py-4 px-6 rounded-xl shadow-sm text-lg transition duration-200 min-h-[56px] border-2 border-primary"
            aria-label="Continue in English"
          >
            Continue in English
          </button>
        </div>

        <div className="mt-16 text-xs text-text-secondary">
          Bina kisi dalal ke, apni eligiblity check karein.
        </div>
      </div>
    </div>
  );
}
