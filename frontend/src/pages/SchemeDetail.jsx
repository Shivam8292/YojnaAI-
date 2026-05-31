import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { t } from '../translations';
import LanguageToggle from '../components/LanguageToggle';

export default function SchemeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'hi');
  const [loading, setLoading] = useState(true);
  const [scheme, setScheme] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState(false);

  const translations = t[lang];

  useEffect(() => {
    const fetchSchemeData = async () => {
      setLoading(true);
      setError(false);
      try {
        // Fetch scheme details
        const schemeRes = await axios.get(`/api/scheme/${id}`);
        setScheme(schemeRes.data);
        
        // Fetch live search updates from Tavily
        try {
          const schemeName = schemeRes.data.name;
          const query = `${schemeName} latest news 2025`;
          const updatesRes = await axios.get(`/api/search-updates?query=${encodeURIComponent(query)}`);
          setUpdates(updatesRes.data.results || []);
        } catch (updatesErr) {
          console.warn("Failed to fetch news updates:", updatesErr);
          setUpdates([]);
        }
        
      } catch (err) {
        console.error("Error fetching scheme details:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemeData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-bold text-primary animate-pulse">{translations.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="flex-1 flex flex-col p-6 bg-background">
        <div className="bg-white rounded-xl border border-error p-6 text-center my-8 shadow-sm">
          <div className="text-error text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {translations.errorOccurred}
          </h3>
          <button
            onClick={() => navigate('/results')}
            className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-opacity-95"
          >
            {translations.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 bg-background justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
          <button 
            onClick={() => navigate('/results')} 
            className="text-primary font-bold text-sm hover:underline flex items-center gap-1 min-h-[44px]"
            aria-label={translations.back}
          >
            ← {translations.back}
          </button>
          <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">
            Sarkar Saathi
          </span>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm space-y-6">
          {/* Header titles */}
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              {scheme.metadata?.ministry || translations.ministryLabel}
            </span>
            <h1 className="text-2xl font-extrabold text-text-primary mt-1 leading-snug">
              {scheme.name}
            </h1>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary uppercase">
              {scheme.metadata?.state === 'central' ? translations.centralSchemes.split(' ')[0] : scheme.metadata?.state}
            </span>
          </div>

          {/* Tavily Updates block */}
          {updates.length > 0 && (
            <div className="bg-accent bg-opacity-10 border border-accent border-dashed rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                📰 {translations.liveUpdatesTitle}
              </h3>
              <div className="space-y-2">
                {updates.map((item, idx) => (
                  <div key={idx} className="text-xs border-b border-border pb-2 last:border-b-0 last:pb-0">
                    <p className="font-bold text-text-primary mb-1">{item.title}</p>
                    <p className="text-text-secondary mb-1 italic">"{item.snippet}"</p>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary font-bold hover:underline inline-block mt-1"
                      >
                        {translations.readFullUpdates} →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document contents details block */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-text-primary border-b border-border pb-1">
              📋 Detail Guidelines / विस्तृत दिशानिर्देश
            </h3>
            
            <div className="text-sm text-text-secondary leading-relaxed space-y-4 whitespace-pre-line max-h-[300px] overflow-y-auto pr-2 border border-border rounded-lg p-3 bg-background">
              {scheme.document_content}
            </div>
          </div>
          
          {/* Metadata Block */}
          <div className="text-xs text-text-secondary border-t border-border pt-4 grid grid-cols-2 gap-2">
            <div>
              <span className="font-bold text-text-primary block">{translations.sourceFileLabel}:</span>
              {scheme.metadata?.source_file || 'N/A'}
            </div>
            <div>
              <span className="font-bold text-text-primary block">{translations.stateSchemes.split(' ')[0]}:</span>
              {scheme.metadata?.state || 'central'}
            </div>
          </div>
        </div>
      </div>

      {/* Official Apply Link Button */}
      <div className="mt-10">
        <a
          href="https://www.myscheme.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-primary text-white font-extrabold py-3.5 px-6 rounded-xl text-center shadow-md hover:bg-opacity-95 transition-all block min-h-[48px]"
        >
          🌐 {translations.officialApplyLink}
        </a>
      </div>

      <LanguageToggle onLanguageChange={(next) => setLang(next)} />
    </div>
  );
}
