# Product Requirements Document (PRD) - Sarkar Saathi

---

## 1. Document Control

| Project Name | Sarkar Saathi (YojnaAI) |
|---|---|
| **Author** | Antigravity AI |
| **Status** | Draft (Phase 1) |
| **Target Launch** | Phase-by-Phase Build |

---

## 2. Project Overview

**Sarkar Saathi** (meaning *Government Companion*) is an AI-powered, multilingual scheme eligibility finder designed for Indian citizens. The platform acts as a digital bridge between government initiatives and the *aam aadmi* (common man), allowing users to easily determine which schemes they qualify for in their preferred language (Hindi or English). By eliminating complex legal/bureaucratic jargon and the need for middleman services, Sarkar Saathi empowers citizens to access their rightful benefits directly, transparently, and instantly.

### Tagline
> **"Aam Aadmi Ka AI Sahayak — Aapki Eligibility, Bina Kisi Dalal Ke"**
> *(The Common Man's AI Assistant — Your Eligibility, Without Any Middlemen)*

---

## 3. Problem Statement

India has a massive social safety net, comprising over 1,500+ central and state-run government schemes. These include critical programs for agriculture support, healthcare subsidies, education scholarships, housing, and pension benefits. However, a significant portion of the intended beneficiaries remain unaware of these opportunities due to:

1. **Information Asymmetry:** Information is scattered across poorly designed websites, often written in dense English/administrative Hindi.
2. **Complex Eligibility Criteria:** Schemes rely on multi-variable criteria (combinations of age, caste, state, gender, income, land ownership, occupation, and health status) that are hard for citizens to manually compute.
3. **Exploitative Middlemen (Dalals):** Due to lack of digital literacy and information gaps, poor citizens are frequently exploited by middlemen who charge high, illegal fees to process free applications.
4. **Lack of Personalization:** Existing portals require users to navigate complex hierarchies rather than simply describing their life situations in their native tongues.

---

## 4. Target Users

The primary target audience represents segments of Indian society that need welfare benefits the most but face high digital literacy and linguistic barriers:

*   **Farmers in Rural India:** Low digital literacy, primary language is Hindi/regional tongues, interested in crop insurance, farming subsidies, and direct cash transfers.
*   **Daily Wage Workers & Construction Labors:** Unorganized sector workers with unstable, low incomes, seeking social security, medical support, and food subsidies.
*   **BPL (Below Poverty Line) Families:** Highly vulnerable households seeking free housing, subsidized rations, and basic income support.
*   **Students from Low-Income Backgrounds:** First-generation learners seeking scholarships, education loans, and fee waivers based on caste or income levels.
*   **Vulnerable Demographics:** Senior citizens, widows, and disabled persons (Divyangjan) seeking pension benefits, assistive devices, and healthcare schemes.
*   **Bilingual & Transliteration Users:** Citizens who prefer interacting in conversational Hindi (written in Devanagari or English alphabets/Hinglish) or simplified English.

---

## 5. Core Features

### 5.1. Multilingual Natural Language Input
*   **Description:** A search interface where users can type their details conversationally in either Hindi (Devanagari) or English.
*   **Capability:** The system utilizes multilingual embeddings to capture semantic intent, understanding terms like "kisan" (farmer), "zamini" (landowner), or "shiksha" (education) without strict keyword mapping.

### 5.2. Conversational Eligibility Form
*   **Description:** A highly simplified, step-by-step form to collect structured user profiles.
*   **Parameters Tracked:**
    *   **State / UT** (Mandatory selection)
    *   **Age & Gender**
    *   **Caste Category** (General / OBC / SC / ST)
    *   **Annual Family Income**
    *   **Primary Occupation** (Farmer, student, daily wage worker, unemployed, etc.)
    *   **Special Identifiers** (Marital status/widow, disability status, BPL cardholder, land ownership size)
*   **UI/UX Design:** High-contrast layout with large touch targets, supporting Hindi/English dynamically based on selected preferences.

### 5.3. Smart Scheme Matching Engine
*   **Description:** A hybrid retrieval engine combining vector search (ChromaDB) with LLM reasoning (Groq Llama-3) to filter and rank the top 5-10 schemes.
*   **Output:** Only returns schemes that the user genuinely qualifies for based on their input.

### 5.4. Scheme Detail Page
*   **Description:** A dedicated dashboard for each scheme detailing:
    *   **Eligibility Criteria:** Clear bullet points.
    *   **Benefits:** What the user will receive (cash, subsidy, service).
    *   **Required Documents:** List of documents (Aadhaar, income certificate, etc.).
    *   **How to Apply:** Step-by-step instructions.
    *   **Official Link:** Verified direct link to apply.

### 5.5. Real-Time Update Checker (Tavily Integration)
*   **Description:** Fetches live news, updates, or changes regarding the matched schemes via the Tavily Search API.
*   **Benefit:** Protects users from outdated scheme details by appending a "Live Updates" section.

### 5.6. Simple, High-Accessibility UI
*   **Description:** Minimalist visual theme with large fonts (min 16px) and high contrast ratios.
*   **Constraint:** Light-mode only design optimized for outdoor readability and low-end smartphone displays.

---

## 6. Nice-to-Have Features (Future Phases)

*   **Voice-to-Text Search:** Allows users to speak their profile/query in Hindi/English instead of typing (crucial for illiterate users).
*   **WhatsApp Integration:** A simple WhatsApp chatbot where users can send their details and receive matched schemes as text.
*   **Save as PDF:** A single button on the results/detail page to download scheme details offline to show local cyber cafes/CSC (Common Service Centres).

---

## 7. User Stories (5 Examples)

### User Story 1: Ramesh (Rural Bihar Farmer)
*   **Query/Input:** *"Main Bihar ka kisan hoon, 2 acre zameen hai, teen bachche hain, saal mein 80 hazar kamata hoon."*
*   **Profile:** Bihar State, Male, Farmer, Low Income (80k/yr), Landowner (2 acres).
*   **Expected Schemes Matched:** PM Kisan Samman Nidhi, Bihar Mukhyamantri Balika Cycle Yojana (for daughters), PM Fasal Bima Yojana.

### User Story 2: Sunita (Widow Domestic Helper in Uttar Pradesh)
*   **Query/Input:** *"I am a widow from UP. I work as a house cleaner, earn 5000 a month, and have a BPL card."*
*   **Profile:** Uttar Pradesh State, Female, Domestic Worker, BPL Cardholder, Low Income (60k/yr), Widow.
*   **Expected Schemes Matched:** Indira Gandhi National Widow Pension Scheme (IGNWPS), Ayushman Bharat PM-JAY (healthcare), Rashtriya Parivarik Labh Yojana (UP).

### User Story 3: Amit (Low-Income Student in Maharashtra)
*   **Query/Input:** *"Main Maharashtra se hoon, SC category ka student hoon, engineering padhna chahta hoon aur ghar ki income 1.2 Lakh hai."*
*   **Profile:** Maharashtra State, Male, Student, Caste (SC), Low Income (1.2L/yr).
*   **Expected Schemes Matched:** Post Matric Scholarship Scheme for SC Students, Mukhyamantri Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Scheme.

### User Story 4: Raju (Disabled Daily Wage Construction Worker, Madhya Pradesh)
*   **Query/Input:** *"Main Madhya Pradesh se hoon, majdoori karta hoon, mujhe pair ki disability hai (50%) aur salana kamai 60,000 hai."*
*   **Profile:** Madhya Pradesh State, Male, Construction Laborer, Disabled (50%), Low Income (60k/yr).
*   **Expected Schemes Matched:** Indira Gandhi National Disability Pension Scheme, MP Viklang Pension Yojana, PM Shram Yogi Maan-dhan (PM-SYM).

### User Story 5: Gurbaksh (Senior Citizen in Punjab)
*   **Query/Input:** *"I am 68 years old living in Punjab, retired with no pension, income is very low."*
*   **Profile:** Punjab State, Male, Senior Citizen (68), Unemployed/No Source of Income.
*   **Expected Schemes Matched:** Indira Gandhi National Old Age Pension Scheme (IGNOAPS), Punjab Old Age Pension Scheme, Ayushman Bharat health card (Senior Citizen tier).

---

## 8. Success Metrics

1.  **Speed (Latency):** Complete eligibility assessment and scheme matching results page loads in under 10 seconds.
2.  **Linguistic Accuracy:** Successfully parses Hindi inquiries written in either Devanagari script or Hinglish transliteration, producing zero language-related mapping failures.
3.  **Factual Fidelity:** Zero hallucinated schemes. Every returned scheme must exist within the indexed HuggingFace dataset (`shrijayan/gov_myscheme`) or verified real-time sources.
4.  **Accessibility Compliance:** Passes basic contrast checks and remains usable on standard 375px mobile viewport displays typical of budget smartphones.
