import React from 'react';

export default function LanguageToggle({ onLanguageChange }) {
  const currentLang = localStorage.getItem('lang') || 'hi';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'hi' ? 'en' : 'hi';
    localStorage.setItem('lang', nextLang);
    if (onLanguageChange) {
      onLanguageChange(nextLang);
    } else {
      window.location.reload();
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-4 right-4 bg-white border border-border text-text-primary px-4 py-2 rounded-full shadow-md text-sm font-bold flex items-center gap-2 hover:bg-primary-light transition-all duration-200 z-50 min-h-[44px]"
      aria-label="Toggle language / भाषा बदलें"
    >
      🌐 {currentLang === 'hi' ? 'English' : 'हिंदी'}
    </button>
  );
}
