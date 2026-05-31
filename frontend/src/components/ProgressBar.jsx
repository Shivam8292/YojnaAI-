import React from 'react';
import { t } from '../translations';

export default function ProgressBar({ currentStep, totalSteps = 5 }) {
  const lang = localStorage.getItem('lang') || 'hi';
  const progressText = t[lang].stepProgress.replace('{current}', currentStep);
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-primary">
          {progressText}
        </span>
        <span className="text-xs font-semibold text-text-secondary">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-primary-light h-3 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
