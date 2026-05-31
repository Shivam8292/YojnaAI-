# Backend Schema & Data Pipeline - YojnaAI (Sarkar Saathi)

---

## 1. Vector Database Collection Schema (ChromaDB)

We utilize ChromaDB as a local, persistent vector store. Data is organized into a single primary collection.

*   **Collection Name:** `government_schemes`
*   **Embedding Model:** `paraphrase-multilingual-MiniLM-L12-v2` (384 dimensions)
*   **Distance Metric:** Cosine similarity

### Document Storage Structure
For each ingested document:
*   **Document ID (`id`):** Unique string corresponding to the scheme's PDF filename without the `.pdf` extension (e.g., `pm-kisan-samman-nidhi`, `mukhyamantri-balika-cycle-yojana`).
*   **Document Text (`document`):** The clean, extracted text from the scheme guideline PDF.
*   **Metadata Dictionary (`metadata`):**
    ```json
    {
      "scheme_name": "string",
      "ministry": "string",
      "state": "string",       // "central" for Central Govt schemes; otherwise, lowercase State/UT name (e.g., "bihar", "uttar pradesh")
      "category": "string",    // "agriculture", "education", "health", "housing", "pension", etc.
      "beneficiary": "string", // "farmer", "student", "woman", "senior_citizen", "disabled", etc.
      "source_file": "string"  // original PDF filename (e.g., "pm-kisan.pdf")
    }
    ```

---

## 2. Data Ingestion Pipeline (ETL)

The ingestion pipeline parses the raw HuggingFace dataset and initializes the vector store.

```
+-------------------------------------------------------------+
| Step 1: Download shrijayan/gov_myscheme from HuggingFace    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Step 2: Scan "./gov_myscheme_data/text_data/" directory     |
|         - Skip any files with "copy" in the name            |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Step 3: Extract text from PDFs using pdfplumber             |
|         - Check: Skip files with < 50 chars of content      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Step 4: Clean extracted text                                |
|         - Remove double spaces, repair UTF-8 encoding       |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Step 5: Embed with paraphrase-multilingual-MiniLM-L12-v2    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Step 6: Upsert Document + Embeddings + Metadata to Chroma   |
+-------------------------------------------------------------+
```

---

## 3. Query Execution & Synthesis Pipeline

```
[User Form Answers] -> Compile -> [User Profile String] 
                                         |
                                         v
                            [Generate Multilingual Embedding]
                                         |
                                         v
                            [Query ChromaDB (Top 10 Matches)]
                                         |
                                         v
                            [Apply Metadata Filters]
                            (Exclude mismatching state/central choice)
                                         |
                                         v
                            [Construct LLM Orchestration Prompt]
                                         |
                                         v
                            [Invoke Groq API Llama-3.3]
                                         |
                                         v
                            [Parse Output JSON & Return Response]
```

### Prompt Construction Format (System Instructions)
```text
System Prompt:
You are an expert government scheme eligibility agent. You analyze a citizen's profile and match them to schemes.
Given the User Profile: {user_profile}
And the following Government Schemes Context: {schemes_context}

Task:
Determine which schemes the user qualifies for.
Return the results ONLY in a strict JSON array format. Do not return any extra conversational text or markdown code blocks.
For each matching scheme, output:
1. id (must match the scheme document ID exactly)
2. name (official scheme name)
3. benefit (specific benefit they receive)
4. why_eligible (brief simple explanation in {language} explaining why they qualify)
5. apply_link (official URL)
6. ministry (governing ministry)
```

---

## 4. API Request & Response Schemas

We enforce input validation and output serialization using Pydantic.

### 4.1. `POST /api/check-eligibility`
*   **Request Schema:**
    ```json
    {
      "user_profile": "Main Bihar ka kisan hoon, 2 acre zameen hai, saal mein 80 hazar kamata hoon",
      "language": "hi",
      "state": "Bihar",
      "include_central": true,
      "include_state": true
    }
    ```
*   **Response Schema (200 OK):**
    ```json
    {
      "schemes": [
        {
          "id": "pm-kisan",
          "name": "PM Kisan Samman Nidhi",
          "benefit": "₹6,000 per year in 3 equal installments",
          "why_eligible": "Aap Bihar ke kisan hain aur aapke paas 2 acre krishi yogya bhoomi hai, isiliye aap PM Kisan yojana ke yogy hain.",
          "apply_link": "https://pmkisan.gov.in",
          "ministry": "Ministry of Agriculture"
        }
      ],
      "total_found": 1,
      "language": "hi"
    }
    ```

### 4.2. `GET /api/scheme/{scheme_id}`
*   **Response Schema (200 OK):**
    ```json
    {
      "id": "pm-kisan",
      "name": "PM Kisan Samman Nidhi",
      "document_content": "Detailed guidelines text...",
      "metadata": {
        "source_file": "pm-kisan.pdf",
        "state": "central",
        "ministry": "Ministry of Agriculture"
      }
    }
    ```

### 4.3. `GET /api/health`
*   **Response Schema (200 OK):**
    ```json
    {
      "status": "ok",
      "chroma_docs": 723,
      "model_loaded": true
    }
    ```

---

## 5. Security & Robustness Measures

*   **API Key Protection:** No keys are committed to Git. If `.env` is missing keys at startup, the server exits with a descriptive startup exception.
*   **Input Sanitization:**
    *   Limit `user_profile` to a maximum of 500 characters.
    *   Strip out standard HTML elements/script tags from inputs before passing them to the vector store query or LLM prompt.
*   **Fallback Processing (Robustness):**
    *   If the **Groq API fails** (e.g. rate limits or server down), catch the exception, bypass LLM synthesis, and return the top 5 raw matching schemes retrieved from ChromaDB directly, adding a flag `"llm_synthesized": false` and generic eligibility explanations.
    *   If **Tavily search fails**, log the warning and return the matched schemes list without updates rather than crashing the request.
*   **Rate Limiting:** Set up IP-based rate limiting using `slowapi` on the `/api/check-eligibility` endpoint to 10 requests per minute.
*   **CORS Policies:** Configured specifically to permit `http://localhost:5173` (React Vite development port) and the deployed production domain name only.
