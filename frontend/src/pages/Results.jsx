import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { t } from '../translations';
import SchemeCard from '../components/SchemeCard';
import LanguageToggle from '../components/LanguageToggle';

export default function Results() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'hi');
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [error, setError] = useState(false);
  const [isLlmOffline, setIsLlmOffline] = useState(false);

  const selectedState = localStorage.getItem('selectedState') || 'Bihar';
  const includeCentral = localStorage.getItem('includeCentral') !== 'false';
  const includeState = localStorage.getItem('includeState') !== 'false';
  const userProfile = localStorage.getItem('userProfile') || '';

  const translations = t[lang];

  useEffect(() => {
    if (!userProfile) {
      navigate('/check');
      return;
    }

    const fetchEligibility = async () => {
      setLoading(true);
      setError(false);
      try {
        const payload = {
          user_profile: userProfile,
          language: lang,
          state: selectedState,
          include_central: includeCentral,
          include_state: includeState
        };
        
        // POST to backend API
        const response = await axios.post('/api/check-eligibility', payload);
        
        setSchemes(response.data.schemes || []);
        setIsLlmOffline(!response.data.llm_synthesized);
      } catch (err) {
        console.error("API error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [userProfile, lang, selectedState, includeCentral, includeState, navigate]);

  const handleSchemeSelect = (id) => {
    navigate(`/scheme/${id}`);
  };

  const centralSchemesList = schemes.filter(s => s.state === 'central' || !s.state);
  const stateSchemesList = schemes.filter(s => s.state && s.state !== 'central');

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4">
          {/* Loading Spinner */}
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-bold text-primary animate-pulse">
            {translations.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 bg-background">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
        <button 
          onClick={() => navigate('/check')} 
          className="text-primary font-bold text-sm hover:underline flex items-center gap-1 min-h-[44px]"
        >
          ← {translations.back}
        </button>
        <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">
          Sarkar Saathi
        </span>
      </div>

      {/* Warning/Offline Alert Banner */}
      {isLlmOffline && (
        <div className="mb-6 bg-accent bg-opacity-20 border border-accent rounded-xl p-4 text-sm text-text-primary">
          💡 **Note:** {translations.errorOccurred.split('.')[0]}. Showing matches directly from database.
        </div>
      )}

      {error ? (
        <div className="bg-white rounded-xl border border-error p-6 text-center my-8 shadow-sm">
          <div className="text-error text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {translations.errorOccurred}
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-opacity-95"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-text-primary mb-1">
              {translations.resultsTitle}
            </h2>
            <p className="text-sm text-text-secondary">
              Based on profile: <span className="italic font-medium text-text-primary">"{userProfile.slice(0, 80)}..."</span>
            </p>
          </div>

          {/* Central Schemes Section */}
          {includeCentral && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-primary border-l-4 border-primary pl-2">
                🏛️ {translations.centralSchemes}
              </h3>
              {centralSchemesList.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {centralSchemesList.map((scheme, idx) => (
                    <SchemeCard 
                      key={scheme.id + '-' + idx} 
                      scheme={scheme} 
                      onSelect={handleSchemeSelect} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary italic pl-4">
                  {translations.noSchemes}
                </p>
              )}
            </div>
          )}

          {/* State Schemes Section */}
          {includeState && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-accent border-l-4 border-accent pl-2">
                📍 {selectedState} {translations.stateSchemes.split(' ').slice(1).join(' ')}
              </h3>
              {stateSchemesList.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {stateSchemesList.map((scheme, idx) => (
                    <SchemeCard 
                      key={scheme.id + '-' + idx} 
                      scheme={scheme} 
                      onSelect={handleSchemeSelect} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary italic pl-4">
                  {translations.noSchemes}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <LanguageToggle onLanguageChange={(next) => setLang(next)} />
    </div>
  );
}
