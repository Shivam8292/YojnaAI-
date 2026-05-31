import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../translations';
import ProgressBar from '../components/ProgressBar';
import LanguageToggle from '../components/LanguageToggle';

export default function EligibilityForm() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'hi');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [category, setCategory] = useState('General');
  const [income, setIncome] = useState('Below ₹1,00,000');
  const [occupation, setOccupation] = useState('Farmer');
  
  // Special status checkboxes
  const [isWidow, setIsWidow] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isBpl, setIsBpl] = useState(false);
  const [isLandowner, setIsLandowner] = useState(false);
  const [landSize, setLandSize] = useState('');

  useEffect(() => {
    // Check if state is selected
    if (!localStorage.getItem('selectedState')) {
      navigate('/home');
    }
  }, [navigate]);

  const translations = t[lang];

  const handleNext = () => {
    // Step validation
    if (currentStep === 1 && (!age || isNaN(age) || parseInt(age) <= 0)) {
      alert(lang === 'hi' ? 'कृपया अपनी सही उम्र दर्ज करें।' : 'Please enter a valid age.');
      return;
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/home');
    }
  };

  const handleSubmit = () => {
    const selectedState = localStorage.getItem('selectedState') || 'Bihar';
    
    // Construct conversational user profile paragraph for vector search
    let profile = "";
    let specials = [];
    
    if (isWidow) specials.push(lang === 'hi' ? "widow / ekal mata" : "widow / single mother");
    if (isDisabled) specials.push(lang === 'hi' ? "divyang / apahaj" : "differently-abled / disabled");
    if (isBpl) specials.push(lang === 'hi' ? "BPL card / garibi rekha ke neeche" : "BPL cardholder");
    if (isLandowner) {
      const sizeStr = landSize ? `${landSize} acre` : "";
      specials.push(lang === 'hi' ? `kheti ki zameen hai (${sizeStr})` : `owns agricultural land (${sizeStr})`);
    }
    
    const specialsStr = specials.length > 0 
      ? (lang === 'hi' ? `Meri vishesh shreni: ${specials.join(', ')}.` : `Special indicators: ${specials.join(', ')}.`)
      : "";

    if (lang === 'hi') {
      const genderTranslation = gender === 'Male' ? 'Purush' : gender === 'Female' ? 'Mahila' : 'Anya';
      profile = `Main ${selectedState} se hoon. Meri umar ${age} saal hai aur main ${genderTranslation} hoon. ` +
                `Meri shreni ${category} hai. Meri salana aamdani ${income} hai. Mera kaam ${occupation} hai. ${specialsStr}`;
    } else {
      profile = `I am from ${selectedState}. I am a ${age} year old ${gender.toLowerCase()}. ` +
                `My category is ${category}. My annual family income is ${income}. My primary occupation is ${occupation.toLowerCase()}. ${specialsStr}`;
    }

    // Save profile details to local storage
    localStorage.setItem('userProfile', profile);
    localStorage.setItem('formAnswers', JSON.stringify({
      age, gender, category, income, occupation, isWidow, isDisabled, isBpl, isLandowner, landSize
    }));

    navigate('/results');
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-background justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBack} 
            className="text-primary font-bold text-sm hover:underline flex items-center gap-1 min-h-[44px]"
          >
            ← {translations.back}
          </button>
          <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">
            Sarkar Saathi
          </span>
        </div>

        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={5} />

        {/* Form Container */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm mt-4">
          
          {/* Step 1: Age + Gender */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-text-primary">
                  1. {translations.ageLabel}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full border border-border rounded-lg px-4 py-3 text-text-primary text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none min-h-[48px]"
                  min="1"
                  max="120"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-text-primary">
                  2. {translations.genderLabel}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Male', 'Female', 'Other'].map((g) => {
                    const labelKey = g === 'Male' ? 'genderMale' : g === 'Female' ? 'genderFemale' : 'genderOther';
                    const active = gender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-3 px-2 rounded-lg border font-bold text-sm min-h-[48px] ${
                          active 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-white border-border text-text-secondary hover:bg-primary-light'
                        }`}
                      >
                        {translations[labelKey]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category (Caste) */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <label className="text-base font-bold text-text-primary block">
                {translations.categoryLabel}
              </label>
              <div className="flex flex-col gap-3">
                {['General', 'OBC', 'SC', 'ST'].map((cat) => {
                  const labelKey = cat === 'General' ? 'catGeneral' : cat === 'OBC' ? 'catOBC' : cat === 'SC' ? 'catSC' : 'catST';
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`w-full text-left py-3 px-4 rounded-lg border font-bold text-base min-h-[48px] flex justify-between items-center ${
                        active
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-border text-text-primary hover:bg-primary-light'
                      }`}
                    >
                      <span>{translations[labelKey]}</span>
                      {active && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Income */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <label className="text-base font-bold text-text-primary block">
                {translations.incomeLabel}
              </label>
              <div className="flex flex-col gap-3">
                {['Below ₹1,00,000', '₹1,00,000 - ₹3,00,000', '₹3,00,000 - ₹8,00,000', 'Above ₹8,00,000'].map((inc) => {
                  const labelKey = inc === 'Below ₹1,00,000' ? 'incBelow1L' : inc === '₹1,00,000 - ₹3,00,000' ? 'inc1to3L' : inc === '₹3,00,000 - ₹8,00,000' ? 'inc3to8L' : 'incAbove8L';
                  const active = income === inc;
                  return (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setIncome(inc)}
                      className={`w-full text-left py-3.5 px-4 rounded-lg border font-bold text-base min-h-[48px] flex justify-between items-center ${
                        active
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-border text-text-primary hover:bg-primary-light'
                      }`}
                    >
                      <span>{translations[labelKey]}</span>
                      {active && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Occupation */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <label className="text-base font-bold text-text-primary block">
                {translations.occupationLabel}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {['Farmer', 'Daily Wage Worker', 'Student', 'Unemployed', 'Salaried', 'Self-Employed'].map((occ) => {
                  const labelKey = occ === 'Farmer' ? 'occFarmer' : occ === 'Daily Wage Worker' ? 'occDailyWage' : occ === 'Student' ? 'occStudent' : occ === 'Unemployed' ? 'occUnemployed' : occ === 'Salaried' ? 'occSalaried' : 'occSelfEmployed';
                  const active = occupation === occ;
                  return (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccupation(occ)}
                      className={`w-full text-left py-3 px-4 rounded-lg border font-bold text-base min-h-[48px] flex justify-between items-center ${
                        active
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-border text-text-primary hover:bg-primary-light'
                      }`}
                    >
                      <span>{translations[labelKey]}</span>
                      {active && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Special Indicators */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fade-in">
              <label className="text-base font-bold text-text-primary block border-b border-border pb-1">
                {translations.specialLabel}
              </label>
              
              <div className="space-y-4">
                {/* Widow */}
                <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={isWidow}
                    onChange={(e) => setIsWidow(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <span className="text-base font-semibold text-text-primary">
                    {translations.specWidow}
                  </span>
                </label>

                {/* Disabled */}
                <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={isDisabled}
                    onChange={(e) => setIsDisabled(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <span className="text-base font-semibold text-text-primary">
                    {translations.specDisabled}
                  </span>
                </label>

                {/* BPL */}
                <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={isBpl}
                    onChange={(e) => setIsBpl(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <span className="text-base font-semibold text-text-primary">
                    {translations.specBpl}
                  </span>
                </label>

                {/* Landowner */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={isLandowner}
                      onChange={(e) => setIsLandowner(e.target.checked)}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                    <span className="text-base font-semibold text-text-primary">
                      {translations.specLandowner}
                    </span>
                  </label>

                  {isLandowner && (
                    <div className="pl-8 animate-slide-down">
                      <label className="text-sm font-bold text-text-secondary block mb-1">
                        {translations.landSizeLabel}
                      </label>
                      <input
                        type="number"
                        value={landSize}
                        onChange={(e) => setLandSize(e.target.value)}
                        placeholder="e.g. 2.5"
                        className="w-full max-w-[200px] border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:ring-2 focus:ring-primary focus:outline-none min-h-[40px]"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 bg-white border border-border text-text-secondary font-bold py-3 px-4 rounded-xl text-base transition hover:bg-primary-light min-h-[48px]"
        >
          ← {translations.back}
        </button>

        <button
          onClick={handleNext}
          className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl text-base transition hover:bg-opacity-95 min-h-[48px]"
        >
          {currentStep === 5 ? translations.submit : translations.next} →
        </button>
      </div>

      <LanguageToggle onLanguageChange={(next) => setLang(next)} />
    </div>
  );
}
