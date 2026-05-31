# Technical Requirements Document (TRD) - Sarkar Saathi

---

## 1. System Architecture Overview

Sarkar Saathi follows a decoupled client-server architecture. The frontend is a single-page application (SPA) built using React.js and Vite, optimized for light weight and high mobile speed. The backend is a Python FastAPI service designed to handle machine learning inference (embeddings calculation via SentenceTransformers), vector database querying (ChromaDB), and orchestration with LLMs (Groq Llama-3.3) and external APIs (Tavily).

### System Data & Request Flow Diagram (ASCII Format)
```
               +-------------------------------------------------+
               |             React.js Client (Vite)              |
               |       (Supports dynamic Hindi / English)        |
               +-----------------------+-------------------------+
                                       |
                   HTTP POST / GET     |     JSON Response
                   (Axios client)      v     (Matched Schemes)
               +-------------------------------------------------+
               |           FastAPI Application Gateway           |
               |      (Main Routing, Cors, Rate Limiting)        |
               +-----------------------+-------------------------+
                                       |
                   1. Profile Embedding| 2. Similar Matches Query
                                       v
               +-----------------------+-------------------------+
               |        ChromaDB Vector Store (Local DB)         |
               | - Collection: government_schemes                |
               | - Embeddings: MiniLM-L12-v2 (Hindi & English)   |
               +-----------------------+-------------------------+
                                       |
                                       | 3. Retructured Scheme Context
                                       v
               +-----------------------+-------------------------+
               |         Groq API (Llama-3.3-70b-versatile)       |
               | - Synthesizes context with User Profile          |
               | - Decides exact eligibility & outputs JSON      |
               +-----------------------+-------------------------+
                                       |
                                       | 4. Fetch live news (Optional)
                                       v
               +-----------------------+-------------------------+
               |              Tavily News Search API             |
               +-------------------------------------------------+
```

---

## 2. Technology Stack & Rationale

### 2.1. Frontend
*   **React.js (Vite):** 
    *   *Why:* Vite offers extremely fast HMR (Hot Module Replacement) and optimized production bundles, which is essential for target users on low-end budget smartphones. React provides a robust component-driven state architecture to manage the 5-step conversational form seamlessly.
*   **Tailwind CSS:**
    *   *Why:* Allows for rapid utility-first styling without bloated CSS stylesheets. Excellent support for custom configuration variables (matching our UI/UX color system) and responsive design breakpoints.
*   **Axios:**
    *   *Why:* Simplifies HTTP requests, handles interceptors for network failures or offline handling gracefully, and automatically serializes/deserializes JSON.
*   **React Router Dom:**
    *   *Why:* Provides dynamic client-side routing enabling distinct pages for language selection (`/`), home (`/home`), eligibility (`/check`), results (`/results`), and individual schemes (`/scheme/:id`) without page reloads.

### 2.2. Backend
*   **FastAPI:**
    *   *Why:* High-performance asynchronous execution support (vital for multi-API calls to Groq/Tavily), automatic OpenAPI (Swagger) documentation, and built-in type checks.
*   **Uvicorn:**
    *   *Why:* Lightweight, lightning-fast ASGI web server implementation.
*   **Pydantic (v2):**
    *   *Why:* Robust structural validation of incoming request bodies and outgoing responses, ensuring that the profile data structure is strictly enforced.
*   **python-dotenv:**
    *   *Why:* Safe management of system configurations and API credentials away from source control.

### 2.3. AI / Machine Learning & Vector Store
*   **Sentence-Transformers (`paraphrase-multilingual-MiniLM-L12-v2`):**
    *   *Why:* A lightweight HuggingFace model specialized in mapping multilingual queries (English, Hindi, and transliterated Hinglish) to the same vector space. Since it runs locally, it is 100% free and has minimal footprint.
*   **Groq API (`llama-3.3-70b-versatile`):**
    *   *Why:* Offers exceptionally low latency and high context capabilities for Llama-3.3-70b, making reasoning decisions over retrieved PDF documents fast and reliable. The free tier fits the project constraints perfectly.
*   **ChromaDB (Local, Persistent):**
    *   *Why:* An embeddable vector database that runs inside our Python server. Doesn't require setting up a separate cloud database instance, making deployment simple and fully self-contained.
*   **Tavily Search API:**
    *   *Why:* Specifically optimized for AI agents and LLM retrieval. Returns clean search results, avoiding the need to write complex web scrapers to fetch real-time updates for matched schemes.

### 2.4. Data Ingestion
*   **HuggingFace Dataset (`shrijayan/gov_myscheme`):** Contains 723 curated government scheme PDFs categorized for citizen access.
*   **pdfplumber:** Preferred over standard PyPDF2 due to superior text extraction, layout retention, and robustness in handling tabular data within scheme guidelines.

---

## 3. Project Directory Structure

We will adhere to the following project structure:

```
YojnaAI/
├── backend/
│   ├── main.py              # FastAPI app entry point (Cors, SlowAPI rate-limiting)
│   ├── routes/
│   │   ├── eligibility.py   # POST /api/check-eligibility
│   │   └── schemes.py       # GET /api/scheme/{id} & GET /api/search-updates
│   ├── services/
│   │   ├── embedder.py      # HuggingFace MiniLM-L12-v2 embedding model loading & logic
│   │   ├── retriever.py     # ChromaDB instance configuration & querying
│   │   ├── llm.py           # Groq API client integration and schema validation
│   │   └── tavily_search.py # Tavily API search wrapper
│   ├── ingestion/
│   │   ├── download_data.py # HF Hub snapshot download script
│   │   └── ingest.py        # PDF text extraction & collection vectorization
│   ├── chroma_db/           # Persistent vector store database directory (gitignored)
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets (icons, logo)
│   │   ├── components/      # Shared components (OfflineBanner, ProgressBar, LanguageToggle)
│   │   ├── pages/           # Page views (LanguageSelect, Home, EligibilityForm, Results, SchemeDetail)
│   │   ├── translations.js  # Dedicated dictionary for translation strings
│   │   ├── App.jsx          # App entry with React Router and Global Error Boundary
│   │   └── main.jsx         # React DOM mount point
│   ├── index.html           # Main template
│   ├── package.json         # Node frontend dependencies
│   ├── postcss.config.js    # Tailwind configuration
│   ├── tailwind.config.js   # Tailwind custom theme config
│   └── vite.config.js       # Vite proxy config
├── .env.example             # Template for local environment variables
├── .gitignore               # System-wide gitignore
└── README.md                # General project setup documentation
```

---

## 4. Dependencies & Selected Versions

### 4.1. Backend (`backend/requirements.txt`)
```text
fastapi>=0.110.0
uvicorn>=0.28.0
pydantic>=2.6.4
python-dotenv>=1.0.1
sentence-transformers>=2.5.1
chromadb>=0.4.24
pdfplumber>=0.11.0
huggingface_hub>=0.21.4
requests>=2.31.0
slowapi>=0.1.9
groq>=0.5.0
```

### 4.2. Frontend (`frontend/package.json` Dev & Core)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "axios": "^1.6.8",
    "lucide-react": "^0.359.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.6"
  }
}
```

---

## 5. Environment Variables Configuration (`.env.example`)

Create a `.env.example` in the root of the project:

```bash
# Groq Cloud API Key (Get from console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# Tavily Search API Key (Get from tavily.com)
TAVILY_API_KEY=your_tavily_api_key_here

# Chroma DB Local Persistence Directory
CHROMA_PERSIST_DIR=./chroma_db
```

---

## 6. Detailed API Endpoint Specifications

### 6.1. System Health Check
*   **Path:** `GET /api/health`
*   **Request:** None
*   **Response Structure (200 OK):**
    ```json
    {
      "status": "ok",
      "chroma_docs": 723,
      "model_loaded": true
    }
    ```

### 6.2. Eligibility Matching Engine
*   **Path:** `POST /api/check-eligibility`
*   **Request Body:**
    ```json
    {
      "user_profile": "Main Bihar ka kisan hoon, 2 acre zameen hai, teen bachche hain, saal mein 80 hazar kamata hoon",
      "language": "hi",
      "state": "Bihar",
      "include_central": true,
      "include_state": true
    }
    ```
*   **Response Structure (200 OK):**
    ```json
    {
      "schemes": [
        {
          "id": "pm-kisan",
          "name": "PM Kisan Samman Nidhi",
          "benefit": "₹6,000 per year directly to bank account",
          "why_eligible": "Aapke paas 2 acre zameen hai aur aap Bihar ke kisan hain jo is yojana ki zameen ki seema ke andar aate hain.",
          "apply_link": "https://pmkisan.gov.in",
          "ministry": "Ministry of Agriculture and Farmers Welfare"
        }
      ],
      "total_found": 1,
      "language": "hi"
    }
    ```

### 6.3. Retrieve Scheme Content Detail
*   **Path:** `GET /api/scheme/{scheme_id}`
*   **Parameters:** `scheme_id` (string, the unique file ID in vector DB)
*   **Request:** None
*   **Response Structure (200 OK):**
    ```json
    {
      "id": "pm-kisan",
      "name": "PM Kisan Samman Nidhi",
      "document_content": "Full extracted PDF text of the scheme guidelines...",
      "metadata": {
        "source_file": "pm-kisan.pdf",
        "state": "central"
      }
    }
    ```

### 6.4. Real-time Scheme News Search (Tavily)
*   **Path:** `GET /api/search-updates`
*   **Parameters:** `query` (string, target search terms e.g., "PM Kisan latest news 2025")
*   **Response Structure (200 OK):**
    ```json
    {
      "results": [
        {
          "title": "PM Kisan 17th Installment Release Date & Updates",
          "url": "https://example-news.gov.in/pm-kisan-update",
          "snippet": "The government is set to release the 17th installment of PM Kisan in mid-2025..."
        }
      ]
    }
    ```
