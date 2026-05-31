# Sarkar Saathi (YojnaAI) 🇮🇳

Sarkar Saathi is a multilingual (Hindi + English) AI-powered government scheme eligibility finder designed for Indian citizens. It helps the common man discover which welfare schemes (PM Kisan, scholarships, pensions, health cards, etc.) they qualify for based on their personal demographics—without needing a middleman or dalal.

---

## 🚀 Key Features

*   **Multilingual Input:** Enter profile details in Hindi, English, or transliterated Hinglish.
*   **Conversational Eligibility Form:** A highly accessible 5-step form to collect age, gender, caste, income, occupation, and special categories.
*   **Vector Search Engine:** ChromaDB stores and retrieves semantically matched PDF scheme guidelines using Hugging Face's multilingual embeddings.
*   **LLM Synthesis:** Groq Llama-3.3-70b-versatile processes the matched schemes and explains in simple language why the citizen is eligible.
*   **Real-time Updates:** Tavily Search API automatically fetches latest news/announcements regarding matched schemes.
*   **Aam Aadmi UI/UX:** Clean, warm, high-contrast light-mode design optimized for outdoor readability and low-end mobile viewports.

---

## 🛠️ Technology Stack

*   **Frontend:** React.js (Vite), Tailwind CSS, Axios, React Router.
*   **Backend:** FastAPI (Python), Uvicorn server, Pydantic, SlowAPI.
*   **Vector Database:** ChromaDB (Local & persistent).
*   **Embeddings Model:** Hugging Face `paraphrase-multilingual-MiniLM-L12-v2`.
*   **LLM Orchestrator:** Groq API (`llama-3.3-70b-versatile`).
*   **Live News Agent:** Tavily Search API.

---

## 📂 Project Structure

```text
YojnaAI/
├── backend/
│   ├── main.py              # FastAPI server entry point (CORS, Rate limits)
│   ├── routes/
│   │   ├── eligibility.py   # POST /api/check-eligibility
│   │   └── schemes.py       # GET /api/scheme/{id} & GET /api/search-updates
│   ├── services/
│   │   ├── embedder.py      # Multilingual embedding model initialization
│   │   ├── retriever.py     # ChromaDB instance querying
│   │   ├── llm.py           # Groq Llama-3 synthesis logic
│   │   └── tavily_search.py # Tavily API search wrapper
│   ├── ingestion/
│   │   ├── download_data.py # HF Hub snapshot download script
│   │   └── ingest.py        # PDF text extractor & collection loader
│   ├── requirements.txt     # Python backend dependencies
│   └── test_api.py          # Backend API validation suite
├── frontend/
│   ├── src/
│   │   ├── components/      # OfflineBanner, ProgressBar, LanguageToggle
│   │   ├── pages/           # LanguageSelect, Home, EligibilityForm, Results, SchemeDetail
│   │   ├── translations.js  # Dynamic localization dictionary
│   │   ├── App.jsx          # Routing and Global Error Boundary
│   │   └── main.jsx         # React DOM mount point
│   ├── package.json         # Node frontend dependencies
│   ├── tailwind.config.js   # Tailwind custom theme config
│   └── vite.config.js       # Vite proxy config
├── .env.example             # Template for local environment keys
├── .gitignore               # Root git ignore
└── README.md                # This file
```

---

## ⚙️ Installation & Setup

### Prerequisite API Keys
1.  **Groq API Key:** Get a free key from the [Groq Console](https://console.groq.com/).
2.  **Tavily Search API Key:** Get a free key from [Tavily](https://tavily.com/).

### Root Configurations
Copy `.env.example` to `.env` in the project root and enter your API keys:
```bash
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
CHROMA_PERSIST_DIR=./chroma_db
```

### 1. Backend Setup
Activate python virtual environment and install requirements:
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Ingest the Data Pipeline
Download the government scheme PDFs and populate the Chroma vector store database:
```bash
# 1. Download PDFs from Hugging Face
python ingestion/download_data.py

# 2. Extract, clean, embed, and ingest into ChromaDB
python -u ingestion/ingest.py
```
*(Ingestion status will print every 100 documents in the terminal console).*

### 3. Start Backend Server
Run the FastAPI development server:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Frontend Setup
Install npm packages and launch the Vite development server:
```bash
cd ../frontend
npm install
npm run dev
```

The application will be live at `http://localhost:5173/`.

---

## 🔒 Security & Performance Features

*   **Groq API Fallback:** If Groq API limit/keys are unavailable, the system automatically falls back to raw vector database search results with generic eligibility descriptions, maintaining a 200 HTTP status code.
*   **IP-Based Rate Limiting:** Limits eligibility submissions to 10 requests per minute per IP using `SlowAPI` to prevent DDoS or API credit exhaustion.
*   **Sanitization:** Strict Pydantic input validation limits profile text size to 500 characters and strips `<` / `>` tags to prevent script injection.
*   **Offline Banner:** Intercepts loss of network connectivity and shows a saffron warning banner notifying users they are running in offline cached mode.
*   **Error Boundaries:** Structured React error boundary surrounds the app; runtime rendering bugs present a soft restart button rather than crashing the viewport.
