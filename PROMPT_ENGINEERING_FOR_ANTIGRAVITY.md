# 🧠 MASTER GUIDE: PROMPTING FOR ANTIGRAVITY
**Version:** 1.0
**Author:** Antigravity (Self-Audit)
**Purpose:** This document serves as the "Source of Truth" for training any AI assistant to generate optimal prompts for Antigravity (The User's Agentic Coding Partner).

---

## 1. 🧬 CORE IDENTITY & MINDSET
**Who is Antigravity?**
Antigravity is not a passive chatbot. It is a highly autonomous **Agentic AI** designed by Google Deepmind.
*   **Role:** Senior Full-Stack Engineer, System Architect, and UI/UX Specialist.
*   **Thinking Style:** Chain-of-Thought (Step-by-Step), Proactive, Self-Correcting.
*   **Key Trait:** "Agentic" means it can *act* on the system (edit files, run terminal commands, browse the web) rather than just giving advice.

---

## 2. 🛠️ THE ANTIGRAVITY TOOLKIT (KNOW WHAT TO ASK)
To prompt effectively, you must understand what tools Antigravity can wield.

### A. File System Mastery 📂
*   **Capabilities:** Create, Read, Update, Delete files. List directories. Search files by name or content (grep).
*   **Prompt Tip:** *"Scan the `src/components` directory for deprecated buttons and replace them."*
*   **Constraint:** ALWAYS use **Absolute Paths** (`c:\Users\...`) to avoid ambiguity.

### B. Execution Power ⚡
*   **Capabilities:** Run terminal commands (`npm install`, `git push`, build scripts), Check command status, Read terminal history.
*   **Prompt Tip:** *"Run the build command and verify there are no TSC errors. If there are, fix them."*

### C. The Browser Subagent 🌐
*   **Capabilities:** Open a browser, navigate URLs, click elements, capture screenshots, check DOM state.
*   **Prompt Tip:** *"Launch the app at localhost:8080, log in with user 'demo', and verify the dashboard loads correctly."*

### D. Visual Intelligence 🎨
*   **Capabilities:** `generate_image` for UI mockups or placeholders.
*   **Aesthetics Rule:** Antigravity is trained to REJECT basic/boring designs. It defaults to "Premium," "Glassmorphism," "Vibrant," and "Modern" styling unless told otherwise.

---

## 3. 🚀 SPECIAL FEATURES (THE "SECRET SAUCE")

### A. Context Mentions (@Symbol)
Antigravity works best when provided with specific context.
*   **Usage:** When referencing a file, folder, or doc, explicit mentions (like `@filename`) ensure the content is loaded into the context window.
*   **Prompt Strategy:** *"Based on the logic in `@DispatcherAssessment.tsx`, implement a similar timer in `@NewGame.tsx`."*

### B. Workflows (Automation Scripts)
*   **Definition:** Pre-defined `.md` files in `.agent/workflows/` that outline complex, multi-step tasks.
*   **Slash Commands:** Prompts can trigger these via `/command`.
    *   `/request`: Full-stack engineering workflow.
    *   `/ui-ux-pro-max`: UI/UX overhaul workflow.
*   **Prompt Strategy:** *"Execute the `/ui-ux-pro-max` workflow to redesign the landing page."*

### C. Persistent Rules (<user_rules>)
*   **Definition:** Critical instructions found in `.agent/rules` or embedded XML tags. These take precedence over everything.
*   **Crucial Rule:** "If the User asks for a Web App, use **Vite + React + Tailwind**. Do not suggest basic HTML without frameworks unless explicitly requested."

---

## 4. 📝 THE PERFECT PROMPT FORMULA

To get the best result from Antigravity, construct prompts using this template:

### The Structure:
1.  **ROLE (Vai trò):** Define who Antigravity needs to be right now (e.g., "Senior Security Engineer").
2.  **CONTEXT (Ngữ cảnh):** What is the current state? What files are relevant?
3.  **TASK (Nhiệm vụ):** Detailed, actionable steps. Use verbs like "Create," "Refactor," "Debug," "Verify."
4.  **CONSTRAINTS (Luật):** Tech stack limits, file path rules, aesthetic requirements.
5.  **OUTPUT (Đầu ra):** Do you want code changes applied directly? A plan first? A screenshot verification?

### Example "Perfect" Prompt:

> **Role:** Senior Frontend Architect specialized in Accessibility.
>
> **Context:** We are updating the `FindTherapist.tsx` page. The users are parents of autistic children, so the UI must be calming but responsive.
>
> **Task:**
> 1. Refactor the map component to use `Leaflet` safely (avoiding the recent XSS issue).
> 2. Ensure all interactive elements have `aria-labels`.
> 3. Implement a "Pulse" animation for the user's location marker.
>
> **Constraints:**
> - Use TailwindCSS for styling.
> - **Must** create a stunning visual experience (Premium Design).
> - Do not break existing Supabase fetching logic.
> - Run `npm run dev` and verify the page loads without white screens.
>
> **Output:** Apply the code changes directly to the file and confirm via a browser screenshot.

---

## 5. ⚠️ CRITICAL "DOs" AND "DON'Ts"

| DO ✅ | DON'T ❌ |
| :--- | :--- |
| **Be Specific:** "Fix the memory leak in `useEffect` inside `MatrixGame.tsx`" | **Be Vague:** "Fix the code." |
| **Ask for Verification:** "Run the app and take a screenshot to prove it works." | **Trust Blindly:** "Write the code and tell me you're done." |
| **Use Absolute Paths:** `c:\Users\Admin\Project\src\App.tsx` | **Use Relative Paths:** `../App.tsx` (Can confuse the agent) |
| **Demand Aesthetics:** "Make it look like a 2025 SaaS product." | **Accept Default:** "Just make a button." (You will get a boring button) |
| **Leverage Workflows:** "Use the `/deploy` workflow." | **Micromanage:** Manually listing 20 standard deploy steps. |

---

## 6. CHEAT SHEET FOR THE AI PROMPTER

When the User asks you to generate a prompt for Antigravity, follow this checklist:
1.  Does the prompt define a **Persona**?
2.  Did I include the **Absolute Paths** of referenced files?
3.  Did I mention **Aesthetics** (if UI related)?
4.  Did I include a **Verification Step** (Run command/Browser check)?
5.  Am I respecting the **Project Context** (Tech stack: React/Vite/Supabase)?

*Use this guide to ensure every instruction sent to Antigravity is precise, powerful, and effective.*
