# Implementation Plan - Sarkar Saathi (YojnaAI)

This document outlines the step-by-step development sequence for building Sarkar Saathi. Work will progress phase-by-phase with verification at each milestone.

---

## 1. Milestones & Task Breakdown

### MILESTONE 1: Project Setup (Day 1)
*   **Goal:** Initialize both the React.js client and FastAPI server, verify configurations, and ensure they communicate.
*   **Tasks:**
    *   Initialize React frontend with Vite in `./frontend` directory.
    *   Configure Tailwind CSS inside `./frontend`.
    *   Initialize Python FastAPI backend inside `./backend` directory with required folder layout (`routes`, `services`, `ingestion`).
    *   Add `.env.example` in the root directory.
    *   Setup `.gitignore` ensuring node modules, pycache, env files, and local DBs are skipped.
    *   Verify backend `/api/health` returns `{"status": "ok"}`.
    *   Verify frontend builds and starts on `localhost:5173`.

### MILESTONE 2: Data Ingestion Pipeline (Day 2)
*   **Goal:** Fetch, parse, clean, and vectorize the government schemes dataset into a persistent ChromaDB instance.
*   **Tasks:**
    *   Write `backend/ingestion/download_data.py` to pull the `shrijayan/gov_myscheme` dataset from HuggingFace.
    *   Write `backend/ingestion/ingest.py` using `pdfplumber` to extract text from PDFs, skipping files with `"copy"` in the name.
    *   Incorporate local HuggingFace embedding model (`paraphrase-multilingual-MiniLM-L12-v2`) in the ingestion loop.
    *   Store vectorized documents in local ChromaDB collection `government_schemes`.
    *   Write a quick test script to query ChromaDB for keywords (e.g. "kisan ke liye yojana") and verify semantic search returns correct outputs.

### MILESTONE 3: Core Backend API (Day 3)
*   **Goal:** Build eligibility assessment endpoints linking ChromaDB retrieval, Groq LLM synthesis, and details querying.
*   **Tasks:**
    *   Build `backend/services/embedder.py` to load the embedding model once at server startup.
    *   Build `backend/services/retriever.py` to search the ChromaDB collection using cosine similarity.
    *   Build `backend/services/llm.py` to format prompt context and call Groq Llama-3.3-70b-versatile for structured eligibility checking.
    *   Implement `/api/check-eligibility` POST endpoint returning clean structured JSON results.
    *   Implement `/api/scheme/{scheme_id}` GET endpoint returning raw text content.
    *   Test backend endpoints using curl/Postman to ensure reliability.

### MILESTONE 4: Frontend Development (Day 4)
*   **Goal:** Build all React screens with support for complete translation routing (Hindi/English).
*   **Tasks:**
    *   Set up dynamic locale support in `src/translations.js` containing dictionary matching.
    *   Create Language Selection page (`/`) as the entry gate.
    *   Create Home Page (`/home`) containing the state dropdown, scheme checkboxes, and dynamic text translation.
    *   Create 5-step Eligibility Form (`/check`) with a matching progress bar.
    *   Create Results Page (`/results`) with separated Central/State scheme sections.
    *   Create Scheme Detail Page (`/scheme/:id`) showing apply steps, required docs, and external links.

### MILESTONE 5: Integration & Real-Time Updates (Day 5)
*   **Goal:** Connect React frontend to FastAPI via Axios and add external search updates.
*   **Tasks:**
    *   Add Axios API utility in frontend to connect client screens to backend endpoints.
    *   Implement `backend/services/tavily_search.py` wrapping the Tavily search API.
    *   Connect Tavily queries inside `/api/search-updates` and show latest news notifications on matched results.
    *   Implement user-friendly loading skeletons/states throughout form processing.

### MILESTONE 6: Production Readiness & Quality Assurance (Day 6)
*   **Goal:** Clean up, secure, and polish the application against edge cases.
*   **Tasks:**
    *   Add React Error Boundaries on UI pages to catch runtime client failures.
    *   Ensure all API errors show readable, translated notifications rather than breaking views.
    *   Add network listener in `OfflineBanner.jsx` showing connectivity notifications.
    *   Configure slowapi rate-limiting (10 req/min/IP) on matching endpoints.
    *   Add input validation capping profile text requests at 500 characters.
    *   Create comprehensive setup instructions in `README.md`.
    *   Test responsiveness on a `375px` viewport layout.

---

## 2. Testing Checklist

- [ ] **Bilingual Consistency:** Hindi inputs return Hindi output; English inputs return English output. No mixed/untranslated strings.
- [ ] **Step Validation:** User cannot proceed forward through form steps without satisfying field inputs.
- [ ] **Graceful Degradation:** If Groq or Tavily APIs are unavailable/rate-limited, the application degrades to local vector search results and skips news banners without crashing.
- [ ] **Offline Behavior:** Saffron warning banner displays instantly when cellular data/wifi connection goes offline.
- [ ] **API Security:** No credentials or API keys exposed in frontend bundle files; all keys managed inside backend `.env` variables.
- [ ] **Mobile Responsive:** All buttons and fields fully accessible and tappable on `375px` viewport layout width.
