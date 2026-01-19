# TASK: UI System Overhaul & Job Card Redesign
## GOAL
Establish a cohesive "Neuro-Friendly" Design System and apply it to the Opportunities page. Fix mobile responsiveness and visual clutter.

## 1. GLOBAL STYLES (AppLayout & Tailwind)
- **Background:** Set global app background to `bg-slate-50`.
- **Sidebar:** Clean up `AppLayout.tsx`. Use `bg-white` with specific border `border-r border-slate-200`. Active items use `bg-indigo-50 text-indigo-700`.
- **Font:** Ensure readable spacing (`leading-relaxed`, `tracking-wide`).

## 2. COMPONENT: `JobCard.tsx` (Redesign)
- **Container:** `bg-white`, `rounded-2xl`, `p-5`, `border border-slate-100`, `shadow-sm`, `hover:shadow-md`, `transition-all`.
- **Layout:**
  - **Top Row:**
    - Left: Company Logo (Generate placeholder with Initial letter if missing) - Size `w-12 h-12`.
    - Right: Match Score Badge (e.g., "95% Match" in Emerald pill) OR Circular Progress.
  - **Middle Row:**
    - Job Title: `text-lg font-semibold text-slate-800 line-clamp-1`.
    - Company Name: `text-sm text-slate-500`.
  - **Neuro-Tags Row:**
    - Flex container, gap-2, flex-wrap.
    - Tags styling: `text-xs font-medium px-2.5 py-1 rounded-full` (Use pastel colors based on tag type).
  - **Bottom Row (Metadata):**
    - Use Lucide Icons (MapPin, Wallet) with size `w-4 h-4`.
    - Text: `text-xs text-slate-500`.

## 3. PAGE: `Opportunities.tsx` (Grid & Response)
- **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`.
- **Grid:**
  - Mobile: `grid-cols-1` (Stack cards).
  - Tablet: `grid-cols-2`.
  - Desktop: `grid-cols-3`.
- **Spacing:** `gap-6`.
- **Header:** Clean Title + Subtitle ("Tìm thấy 15 cơ hội phù hợp với [Visual Profile] của bạn").

## 4. MOBILE FIXES
- Ensure Sidebar collapses into a Hamburger menu or Bottom Nav on mobile.
- Job Card padding reduced slightly on mobile (`p-4` vs `p-5`).
- No horizontal overflow (scroll bars).

## EXECUTION
- Apply changes to `AppLayout.tsx`, `JobCard.tsx`, and `Opportunities.tsx`.
- Use `lucide-react` for clean iconography.
