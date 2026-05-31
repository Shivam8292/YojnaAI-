# UI/UX Design Brief - YojnaAI (Sarkar Saathi)

---

## 1. Design Philosophy

Sarkar Saathi is built for the **aam aadmi** (common citizen) of India—including rural farmers, daily wage workers, senior citizens, and students from underprivileged backgrounds. Many of these users may:
*   Use low-end smartphones with lower brightness levels or lower screen resolutions.
*   Operate their device in high-sunlight outdoor environments (e.g., farming fields, construction sites).
*   Have basic digital literacy and be easily overwhelmed by complex hierarchies, SaaS-style dashboards, or jargon.
*   Have mild visual impairments or prefer larger, clearer text.

Therefore, the app's visual system follows four core tenets:
1.  **Ultra-Simplicity & Clarity:** Zero cognitive load. One action per screen view where possible.
2.  **Generous Touch Targets:** Minimum `44px x 44px` (ideally `48px` or higher) for physical tap buttons to account for motor skill variations.
3.  **High Contrast:** Ensure clean contrast ratios (minimum 4.5:1) for readable typography.
4.  **Government-Adjacent Trust:** Use solid, traditional Indian government visual motifs (deep greens, warm saffrons) instead of flashy, modern corporate gradients or tech-bro patterns.

---

## 2. Visual Style & Theme

*   **Mode:** **Light Mode Only**. (No dark mode implementation. Under outdoor lighting, dark mode creates significant glare on cheap smartphone screens.)
*   **Vibe:** Minimalist, slightly warm, structured, and highly legible. It feels like an official, helpful community notice board.

---

## 3. Color System (CSS Variables)

Define the following design tokens exactly in the root style files (`index.css` / Tailwind configurations):

```css
:root {
  /* Core brand identities */
  --primary: #1a6b3c;        /* Deep Indian Flag Green - represents growth, agriculture, trust */
  --primary-light: #e8f5ee;  /* Very soft pastel green - backgrounds and high-light blocks */
  --accent: #f5a623;         /* Warm Saffron - secondary identity, warnings, attention elements */
  
  /* Neutral scale */
  --background: #fafafa;     /* Warm off-white */
  --card-bg: #ffffff;        /* Pure white */
  --text-primary: #1a1a1a;   /* Near-black for extreme legibility */
  --text-secondary: #555555; /* Charcoal gray for descriptors */
  --border: #e0e0e0;         /* Clear dividing lines */
  
  /* Status indicators */
  --error: #d32f2f;          /* Standard crimson red */
  --success: #2e7d32;        /* Vibrant forest green */
}
```

---

## 4. Typography

*   **Primary Headings (Multilingual support):** `'Noto Sans Devanagari'`, sans-serif. 
    *   *Rationale:* Google Font optimized specifically for Hindi letters, ensuring standard vertical alignment and zero clipped vowels.
*   **Body Copy:** `'Noto Sans'`, sans-serif.
    *   *Rationale:* Clean, highly readable, standard sans-serif typeface.
*   **Typography Constraints:**
    *   **Base Font Size:** Minimum `16px` (never scale down to `12px` or `14px` for body details).
    *   **Line Height:** `1.6` multiplier to allow proper spacing between line wraps.
    *   **Weights:** Regular (400) and Bold (700) are sufficient to keep the layout lightweight.

---

## 5. Component Design Specifications

### 5.1. Buttons
*   **Primary Button:**
    *   Style: Solid background (`--primary`), white text, bold.
    *   Padding: Vertical `14px`, Horizontal `24px` (minimum height `48px`).
    *   Corners: `8px` border radius (`rounded-md`).
    *   Focus State: Outline green (`--primary`), width `2px`.
*   **Secondary/Back Button:**
    *   Style: Outlined border (`1.5px solid --border`), background transparent, text `--text-secondary`.
    *   Dimensions: Identical to primary button.

### 5.2. Cards
*   **Style:** Pure white background (`--card-bg`), subtle grey border (`1px solid --border`).
*   **Shadow:** Very soft elevation (`box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)`).
*   **Corners:** `12px` border radius (`rounded-xl`).
*   **Spacing:** Internal padding minimum `20px` (`p-5`).

### 5.3. Form Inputs & Select Dropdowns
*   **Height:** Minimum `48px` (ideally `52px`).
*   **Border:** Clear `1.5px` border with light grey color.
*   **Focus State:** Border changes to `--primary` (Green) with a subtle outer glow.
*   **Tap Targets:** Radio buttons/checkboxes must have matching labels that are fully clickable.

### 5.4. Progress Indicators & Spinners
*   **Progress Bar:** Large horizontal bar, height `12px`, with `--primary-light` background and `--primary` (green) fill indicating current form status.
*   **Loading Spinner:** A clean, spinning green circle accompanied by bold, bilingual messages:
    *   *Hindi:* *"योजनाएं खोज रहे हैं..."*
    *   *English:* *"Finding schemes for you..."*

---

## 6. Layout & Responsiveness (Mobile-First)

*   **Default Viewport Width:** Design and test for `375px` (standard entry-level Android screen width) first.
*   **Max Desktop Constraints:** The entire app container has a maximum layout width of `640px` (standard mobile width). When viewed on a desktop/laptop browser, the application displays as a centered, clean mobile frame on the page with a neutral background.
*   **Layout Safety:**
    *   Add a bottom padding of at least `80px` to all layouts to ensure elements are not hidden behind default device navigation bars (on-screen Android buttons/iOS home indicator).
    *   Ensure all control buttons (such as "Next" or "Get Started") stretch to full width on mobile screens (`w-full`) for easy thumb reach.

---

## 7. Accessibility Checklist (A11y)

*   [ ] **Alt Text:** Every image or icon button must have a descriptive alternative text or `aria-label`.
*   [ ] **Form Labels:** Every input has a corresponding `<label>` element; do not rely solely on placeholder texts.
*   [ ] **Readable Contrast:** Verify all text meets Web Content Accessibility Guidelines (WCAG) contrast ratio of 4.5:1.
*   [ ] **Keyboard Focus:** Ensure users can navigate the form using the `Tab` key with highly visible focus indicator rings.

---

## 8. Strictly Prohibited Elements (Anti-Patterns)

*   ❌ **No Dark Mode:** (Light mode is mandatory for rural legibility).
*   ❌ **No Purple/Neon Gradients:** (Keep to natural green, saffron, and neutrals).
*   ❌ **No Glassmorphism:** (Blurs and semi-transparencies slow down rendering performance on budget phone CPUs).
*   ❌ **No Dense Text Blocks:** (Break instructions down into clear list items).
*   ❌ **No Complex Web Animations:** (Avoid layout-thrashing animations; keep transitions to simple fade-ins/fade-outs).
