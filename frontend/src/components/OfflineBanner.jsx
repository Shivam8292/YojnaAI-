import { useState, useEffect } from 'react';
import { t } from '../translations';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  const lang = localStorage.getItem('lang') || 'hi';
  const translations = t[lang];

  return (
    <div className="bg-accent text-text-primary px-4 py-2 text-center text-sm font-bold shadow-sm transition-all duration-300 animate-pulse">
      ⚠️ {translations.offlineWarning}
    </div>
  );
}
