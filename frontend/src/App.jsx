import { useState, useEffect } from 'react'

function App() {
  const [healthStatus, setHealthStatus] = useState({ loading: true, status: 'offline', chromaDocs: 0 })
  const [testResponse, setTestResponse] = useState(null)

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:8000/api/health')
      .then(res => {
        if (!res.ok) throw new Error('API down')
        return res.json()
      })
      .then(data => {
        setHealthStatus({
          loading: false,
          status: 'online',
          chromaDocs: data.chroma_docs || 0
        })
      })
      .catch(err => {
        setHealthStatus({
          loading: false,
          status: 'error',
          chromaDocs: 0
        })
      })
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="app-container p-6 flex flex-col items-center justify-center text-center">
        {/* Header Branding */}
        <div className="my-8">
          <div className="text-accent text-lg font-bold tracking-wider uppercase mb-1">
            Sarkar Saathi
          </div>
          <h1 className="text-3xl font-extrabold text-primary mb-2">
            सरकार साथी
          </h1>
          <p className="text-text-secondary text-sm italic">
            "Aam Aadmi Ka AI Sahayak — Aapki Eligibility, Bina Kisi Dalal Ke"
          </p>
        </div>

        {/* Milestone 1 Status Card */}
        <div className="w-full bg-white rounded-xl border border-border p-5 shadow-sm mb-6 text-left">
          <h2 className="text-xl font-bold text-text-primary mb-4 border-b border-border pb-2">
            Milestone 1: Project Setup Verification
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text-primary text-base">React (Vite + Tailwind) Status:</span>
              <span className="px-3 py-1 bg-success text-white text-xs font-bold rounded-full">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-text-primary text-base">FastAPI Backend API:</span>
              {healthStatus.loading ? (
                <span className="text-text-secondary text-sm animate-pulse">Checking...</span>
              ) : healthStatus.status === 'online' ? (
                <span className="px-3 py-1 bg-success text-white text-xs font-bold rounded-full">
                  ONLINE
                </span>
              ) : (
                <span className="px-3 py-1 bg-error text-white text-xs font-bold rounded-full">
                  OFFLINE / ERROR
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
              <span className="text-text-secondary text-sm">ChromaDB Ingested Docs:</span>
              <span className="font-mono font-bold text-primary">{healthStatus.chromaDocs}</span>
            </div>
          </div>
        </div>

        {/* Action button mock */}
        <button 
          className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          onClick={() => alert('Sarkar Saathi Project Setup is verified!')}
        >
          Verify Setup
        </button>

        {/* Bottom spacer */}
        <div className="mt-8 text-xs text-text-secondary">
          Phase 7 — Milestone 1 Setup Complete
        </div>
      </div>
    </div>
  )
}

export default App
