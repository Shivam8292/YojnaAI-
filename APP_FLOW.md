# User Application Flow (Navigation & Screens) - YojnaAI

---

## 1. App State & Local Storage Variables

To maintain user choices across screens and handle language changes dynamically, the frontend application stores configuration flags in `localStorage`.

*   `lang`: `"hi"` (Hindi) or `"en"` (English).
*   `selectedState`: String (e.g., `"Bihar"`, `"Uttar Pradesh"`, etc.).
*   `includeCentral`: Boolean (`true`/`false`).
*   `includeState`: Boolean (`true`/`false`).
*   `formAnswers`: JSON object capturing the values from the 5 eligibility steps.

---

## 2. Page-by-Page Breakdown

### Screen 1: Language Selection Page (`/`)
*   **Purpose:** Entry screen for first-time or returning visitors to choose their operational language.
*   **UI Components:**
    *   Centered vertical/horizontal layout.
    *   No titles, navigation bars, headers, or footers.
    *   **Button 1:** "हिंदी में जारी रखें" (Green/Orange theme, large touch target).
    *   **Button 2:** "Continue in English" (Outline or secondary style, large touch target).
*   **Actions:**
    *   Clicking **Button 1** -> Executing `localStorage.setItem('lang', 'hi')` -> Navigates to `/home`.
    *   Clicking **Button 2** -> Executing `localStorage.setItem('lang', 'en')` -> Navigates to `/home`.

---

### Screen 2: Home Page (`/home`)
*   **Purpose:** Initial user intake configuration (State and Scheme Type).
*   **UI Components:**
    *   **Header:** Main logo, and a tiny floating floating toggle: "हिं / EN" to change language dynamically.
    *   **Main Title:**
        *   Hindi: *"अपनी सरकारी योजनाएं खोजें"*
        *   English: *"Find Government Schemes For You"*
    *   **Dropdown Selector (Mandatory):**
        *   Contains 28 States & 8 Union Territories (e.g., Andhra Pradesh, Bihar, Delhi, Uttar Pradesh, etc.).
        *   Placeholder Text (Hindi): *"अपना राज्य चुनें"*
        *   Placeholder Text (English): *"Select your state"*
    *   **Scheme Type Toggles (Checked by default):**
        *   *Checkbox 1 (Central):*
            *   Hindi: *"☑ केंद्र सरकार की योजनाएं"*
            *   English: *"☑ Central Government Schemes"*
        *   *Checkbox 2 (State):*
            *   Hindi: *"☑ राज्य सरकार की योजनाएं"*
            *   English: *"☑ State Government Schemes"*
    *   **Action Button:**
        *   Hindi: *"आगे बढ़ें"*
        *   English: *"Get Started"*
        *   **Validation Rule:** Disabled until a state is selected in the dropdown. Show a helpful helper text if disabled.
*   **Navigation:** Navigates to `/check` on click. Saves choices to local storage.

---

### Screen 3: Eligibility Form (`/check`)
*   **Purpose:** Conversational form interface to gather demographic and occupational details.
*   **State Machine (5 Sequential Steps):**
    *   **Step 1: Age & Gender**
        *   Age input: numeric field (validation: positive integer > 0).
        *   Gender select: options (Male / Female / Other).
    *   **Step 2: Category (Caste)**
        *   Options: General / OBC / SC / ST.
    *   **Step 3: Annual Income**
        *   Options/Slider: Ranges (e.g., Below ₹1,00,000, ₹1,00,000 - ₹3,00,000, ₹3,00,000 - ₹8,00,000, Above ₹8,00,000).
    *   **Step 4: Occupation**
        *   Options: Farmer, Daily Wage/Unorganized Labor, Student, Unemployed, Salaried Employee, Business/Self-Employed.
    *   **Step 5: Special Status Indicators**
        *   Checkboxes/Toggles:
            *   Widow/Single Mother (Hindi: *विधवा / एकल माता*)
            *   Disabled (Divyang) (Hindi: *दिव्यांग*)
            *   BPL Cardholder (Hindi: *बीपीएल कार्डधारक*)
            *   Land Owner (Hindi: *भूमि मालिक*) -> Shows sub-field if selected: Zameen Ka Aakar (Acres).
*   **Progress Indicator:**
    *   A progress bar at the top displaying: `"Step X of 5"` / `"कदम X of 5"`.
*   **Navigation Actions:**
    *   **"Back" Button:** Navigates to the previous step (or `/home` if on Step 1).
    *   **"Next/Submit" Button:** Validates current step data, moves to next step. On Step 5, triggers compilation of parameters and calls POST `/api/check-eligibility`, then redirects to `/results`.

---

### Screen 4: Results Page (`/results`)
*   **Purpose:** Display matched schemes filtered by eligibility parameters.
*   **Layout Sections:**
    *   **Section 1: Central Schemes (केंद्र सरकार की योजनाएं)**
        *   Displays cards for central schemes matched.
        *   Empty State: *"कोई योजना नहीं मिली / No schemes found"*
    *   **Section 2: State Schemes ([State Name] की योजनाएं)**
        *   Displays cards for state-specific schemes matching the user's selected state.
        *   Empty State: *"कोई योजना नहीं मिली / No schemes found"*
*   **Card Components:**
    *   Scheme Name (bold).
    *   Benefit summary (e.g., "₹6,000/year", "Free health insurance up to 5 Lakhs").
    *   Mini "Eligibility Reason" tag (summarized by LLM).
    *   **Button:** *"और जानें / Know More"*.
*   **Live Updates Banner:**
    *   If Tavily api fetches real-time news related to primary schemes, display a ticker/card at the top: *"नवीनतम समाचार 2025 / Latest 2025 Updates"*.

---

### Screen 5: Scheme Detail Page (`/scheme/:id`)
*   **Purpose:** Deep-dive into a single scheme's application process and details.
*   **UI Components:**
    *   **Header:** Title of the scheme.
    *   **Description:** Summary of the scheme.
    *   **Content Sections:**
        *   Eligibility Criteria details.
        *   Documents required.
        *   Application steps.
    *   **Official Link Button:** External URL pointing directly to official portals (e.g., `https://pmkisan.gov.in`).
    *   **Back Button:** Navigates the user back to `/results` with form state preserved.

---

## 3. App Routing Matrix

| Path | Component | Auth/State Guard | Transition |
|---|---|---|---|
| `/` | `LanguageSelect` | None | Instant fade/slide |
| `/home` | `Home` | Requires `lang` is set | Left-to-right slide |
| `/check` | `EligibilityForm` | Requires `selectedState` is set | Fade transition |
| `/results` | `Results` | Requires form answers submitted | Loading spinner -> content |
| `/scheme/:id`| `SchemeDetail` | None | Slide-up sheet / detail card |

---

## 4. System Error States & Interventions

```
                        +----------------------------------+
                        |      An Error Event Occurs       |
                        +----------------+-----------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
               v                                                   v
     [Network Connection Lost]                           [API Failure (500/Timeout)]
               |                                                   |
               v                                                   v
+-----------------------------+                     +-----------------------------+
|    Show OfflineBanner       |                     |    Show ErrorMessage Card   |
| "No internet. Please check" |                     | "Service unavailable.       |
|                             |                     |  Showing cached matches."   |
+-----------------------------+                     +-----------------------------+
```

### 4.1. Empty & Error Banners
1.  **State Unselected:** If user tries to force-navigate to `/check` without choosing a state on `/home`, redirect them back to `/home` and highlight the state dropdown.
2.  **API Call Failure:** If `/api/check-eligibility` crashes, catch the error in an React Error Boundary and display a fallback results list directly retrieved from local vector storage (without LLM explanation processing).
3.  **Offline State:** The app uses a window listener for `'offline'` events. When offline:
    *   Display a persistent, warm saffron banner (`--accent`) at the top: *"इंटरनेट नहीं है। कृपया जांचें। / No internet connection. Please check."*
