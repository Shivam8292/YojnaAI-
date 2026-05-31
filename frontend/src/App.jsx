import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LanguageSelect from './pages/LanguageSelect';
import Home from './pages/Home';
import EligibilityForm from './pages/EligibilityForm';
import Results from './pages/Results';
import SchemeDetail from './pages/SchemeDetail';
import OfflineBanner from './components/OfflineBanner';

// Global Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught a React runtime error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-xl border border-[#d32f2f] p-6 text-center shadow-md">
            <div className="text-[#d32f2f] text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
              अनुप्रयोग क्रैश / Application Error
            </h2>
            <p className="text-sm text-[#555555] mb-6">
              कुछ आंतरिक त्रुटि हुई है। कृपया होम पेज पर वापस जाएं।<br />
              An internal error has occurred. Please return to the language selection page.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="w-full bg-[#1a6b3c] hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              शुरुआत से शुरू करें / Restart Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background font-body antialiased">
        {/* Network offline warning banner */}
        <OfflineBanner />
        
        {/* Centered Mobile Frame container */}
        <div className="app-container">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LanguageSelect />} />
              <Route path="/home" element={<Home />} />
              <Route path="/check" element={<EligibilityForm />} />
              <Route path="/results" element={<Results />} />
              <Route path="/scheme/:id" element={<SchemeDetail />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
