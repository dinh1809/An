# PROJECT "AN": AUDIT REPORT (V3)
**Date:** 2026-01-19
**Auditor:** Antigravity (Agentic AI)
**Scope:** Source Code Analysis vs. "The 15 Killer Questions"

---

## 1. EXECUTIVE SUMMARY
**Is this MVP ready for Seed Funding?**
# 🔴 NO. 
**Verdict:** The product is currently a "Tech Demo" with critical logical flaws that would cause immediate failure in a real-world B2B scenario. While the UI is polished (Shadcn/Tailwind), the "Brain" (Science & Data) is partially hardcoded, and the "Business" (Employer Portal) does not exist.

**Survival Rating:** 15/100 (Critical Condition).

---

## 2. DEEP DIVE ANALYSIS (THE 4 PILLARS)

### PILLAR 1: THE EMPLOYER'S REALITY (B2B)
*Hypothesis: Enterprises will pay for Neurodivergent talent.*

*   **Q1: The "Good Enough" Competitor**
    *   **Audit finding:** 🔴 **NON-EXISTENT.** No code found for an "Employer Dashboard" or "ROI Calculator". The app is entirely User-Centric (`src/pages/assessment`).
    *   **Evidence:** No `src/pages/employer` or similar. No value proposition (e.g., "Accuracy vs Speed" comparison) is shown to the employer.
    *   **Conclusion:** We are asking businesses to buy a "Black Box".

*   **Q2: Liability & Risk Reversal**
    *   **Audit finding:** 🔴 **MISSING.** No legal disclaimers or "Insurance" logic in the code.
    *   **Implication:** If a user deletes a production DB, "An" has no mechanism (Technical or Legal) to handle the fallout.

*   **Q3: Accommodation Friction**
    *   **Audit finding:** 🔴 **UNADDRESSED.** `job_crawler.py` merely scrapes jobs. It does not analyze or suggest "Accommodations" (e.g., suggest "Async Communication" for a job).

### PILLAR 2: SCIENTIFIC VALIDITY (THE CORE PRODUCT)
*Hypothesis: Games measure job performance.*

*   **Q6: Correlation Proof**
    *   **Audit finding:** 🔴 **UNPROVEN & HARDCODED.** The connection between Game Score and Job is currently fake.
    *   **Evidence:** `src/pages/assessment/AssessmentResult.tsx` Lines 46-48:
        ```typescript
        memory: 65, // Baseline (HARDCODED!)
        speed: 75,  // Baseline (HARDCODED!)
        focus: 85   // Baseline (HARDCODED!)
        ```
    *   **Conclusion:** The app gives 3/5 arbitrary scores regardless of user performance.

*   **Q7: The "Learning Effect" Trap**
    *   **Audit finding:** 🟠 **PARTIAL.** `NeuroEngine.ts` calculates standard deviation (`consistency`), which limits spamming, but has no mechanism to detect "Rote Learning" (e.g., repeating the exact same pattern).

*   **Q9: Subjectivity in Scoring (Z-Score Crash)**
    *   **Audit finding:** 💀 **FATAL ERROR.** The "Global Comparison" feature is broken by Security Rules.
    *   **Evidence:** `NeuroEngine.ts` calls `supabase.from('game_sessions')...` to get global stats.
    *   **Conflict:** `20260115101405...sql` sets RLS policy: `USING (auth.uid() = user_id)`.
    *   **Result:** The user can ONLY see their own data. The "Global Mean" is actually just "My Own Mean". The Z-Score will always be 0 or NaN.

### PILLAR 3: GO-TO-MARKET & FRICTION
*Hypothesis: We can match users to jobs.*

*   **Q11: The "Dynamic" Trap (Market Killer)**
    *   **Audit finding:** 💀 **CRITICAL RISK.** The `job_crawler.py` is naive.
    *   **Evidence:** `NEURO_KEYWORDS` (Line 12) only awards Points for *Positive* matches (e.g., "Logic"). It does NOT penalize *Negative* matches (e.g., "Năng động", "Chịu áp lực cao").
    *   **Outcome:** A high-pressure, noisy "Dynamic Sales Job" that mentions "Logic" will get a High Neuro-Score, setting the user up for a meltdown.

*   **Q13: Platform Fatigue**
    *   **Audit finding:** 🟠 **HIGH.** We depend entirely on TopCV.
    *   **Evidence:** `job_crawler.py` uses fragile CSS selectors (`.job-list-search-result`). If TopCV updates their UI, "An" dies instantly.

### PILLAR 4: PRODUCT & TECH EXECUTION
*Hypothesis: The system is robust.*

*   **Q14: Data Privacy (Medical Data)**
    *   **Audit finding:** 🟢 **PASSED (Technically).** RLS is enabled on `game_sessions` and `assessment_telemetry`. Employers cannot snoop on raw data.
    *   **Caveat:** As noted in Q9, this privacy setting accidentally broke the Zoning Score feature.

*   **Q15: User Retention**
    *   **Audit finding:** 🟠 **WEAK.** No "Daily Streak", "XP System", or "Progress Visualization" over time found in the main UI, other than a basic history list.

---

## 3. THE FIX LIST (URGENT PIVOT PLAN)

To survive Seed Funding due diligence, implement these 5 fixes immediately:

1.  **FIX THE BRAIN (Science): Un-Hardcode Metrics & Fix RLS.**
    *   *Action:* Remove `memory: 65` hardcoding in `AssessmentResult`.
    *   *Database:* Create a Postgres VIEW `global_stats_view` with `SECURITY DEFINER` privileges. This allows the API to read *aggregate* averages (Mean/StdDev) without exposing individual user rows, fixing the Z-Score bug.

2.  **PREVENT LAWSUITS (B2B): The "Safe Harbor" Disclaimer.**
    *   *Action:* Add a mandatory checkbox before the Test: "This is a vocational screening tool, NOT a medical diagnosis."

3.  **MARKET SAFETY (Crawler): Implement "Red Flag" Filtering.**
    *   *Action:* Update `job_crawler.py` to include `NEGATIVE_KEYWORDS`.
    *   *Logic:* If description contains "Dynamic", "Sales", "High Pressure" -> `neuro_score` reduced by 50%. DO NOT recommend incompatible jobs.

4.  **TECH RESILIENCE: Decouple from TopCV.**
    *   *Action:* Create a simple `jobs` table in Supabase and a "Post a Job" form. Even if we manually fill it with 10 jobs, it's safer than a fragile scraper for the demo.

5.  **FEATURE: The "Employer View" (Fake it 'til you make it).**
    *   *Action:* Create a static `/employer/dashboard` page showing what an employer *would* see (e.g., "Candidate Fit: 98%", "Predicted Accuracy: High"). Show investors the *Vision* of the B2B side.

---
**Signed,**
*Antigravity Audit Bot*
