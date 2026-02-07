# 🎨 Design System - An (Neurodiversity Career Passport)

**Theme:** Professional Teal Corporate  
**Vibe:** Scientific, Trustworthy, Hopeful, Clean  
**Target:** Enterprise clients (HR departments, Therapists, Parents)

---

## 1. 🎨 Color Palette

### Primary Colors (Teal Spectrum)
```css
/* Primary Teal - Main brand color */
--color-primary-50:  #F0FDFA;  /* Lightest teal for backgrounds */
--color-primary-100: #CCFBF1;  /* Subtle highlights */
--color-primary-200: #99F6E4;  /* Hover states */
--color-primary-300: #5EEAD4;  /* Active elements */
--color-primary-400: #2DD4BF;  /* Buttons, CTAs */
--color-primary-500: #14B8A6;  /* Main brand color */
--color-primary-600: #0D9488;  /* Hover on primary buttons */
--color-primary-700: #0F766E;  /* Dark accents */
--color-primary-800: #115E59;  /* Text on light backgrounds */
--color-primary-900: #134E4A;  /* Darkest teal */
```

### Secondary Colors (Deep Purple - Intelligence)
```css
/* Secondary Purple - For scientific/intelligence aspects */
--color-secondary-50:  #FAF5FF;
--color-secondary-100: #F3E8FF;
--color-secondary-200: #E9D5FF;
--color-secondary-300: #D8B4FE;
--color-secondary-400: #C084FC;
--color-secondary-500: #A855F7;  /* Main secondary color */
--color-secondary-600: #9333EA;
--color-secondary-700: #7E22CE;
--color-secondary-800: #6B21A8;
--color-secondary-900: #581C87;
```

### Neutral Colors (Corporate Gray)
```css
/* Neutrals - Professional, clean backgrounds */
--color-gray-50:  #F8FAFC;  /* Page background */
--color-gray-100: #F1F5F9;  /* Card backgrounds */
--color-gray-200: #E2E8F0;  /* Borders */
--color-gray-300: #CBD5E1;  /* Disabled states */
--color-gray-400: #94A3B8;  /* Muted text (use sparingly) */
--color-gray-500: #64748B;  /* Secondary text */
--color-gray-600: #475569;  /* Body text (minimum for accessibility) */
--color-gray-700: #334155;  /* Headings */
--color-gray-800: #1E293B;  /* Dark headings */
--color-gray-900: #0F172A;  /* Primary text */
```

### Semantic Colors (Sensory-Friendly)
```css
/* Success - Soft green (not too bright) */
--color-success: #10B981;
--color-success-bg: #D1FAE5;

/* Warning - Warm amber (not red) */
--color-warning: #F59E0B;
--color-warning-bg: #FEF3C7;

/* Error - Soft coral (not harsh red) */
--color-error: #EF4444;
--color-error-bg: #FEE2E2;

/* Info - Calm blue */
--color-info: #3B82F6;
--color-info-bg: #DBEAFE;
```

### Usage Guidelines
- **Primary Teal:** Buttons, links, progress bars, active states
- **Secondary Purple:** Data visualizations (Radar Chart), badges, highlights
- **Gray:** Text, backgrounds, borders, shadows
- **Semantic:** Feedback messages, alerts (NEVER use red for game errors)

---

## 2. 📝 Typography

### Font Stack
```css
/* Primary Font - Inter (Clean, Modern, Professional) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Secondary Font - JetBrains Mono (Code, Data) */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}
```

### Type Scale (Fluid Typography)
```css
/* Headings */
--text-xs:   0.75rem;   /* 12px - Labels, captions */
--text-sm:   0.875rem;  /* 14px - Small text */
--text-base: 1rem;      /* 16px - Body text */
--text-lg:   1.125rem;  /* 18px - Large body */
--text-xl:   1.25rem;   /* 20px - H5 */
--text-2xl:  1.5rem;    /* 24px - H4 */
--text-3xl:  1.875rem;  /* 30px - H3 */
--text-4xl:  2.25rem;   /* 36px - H2 */
--text-5xl:  3rem;      /* 48px - H1 */
--text-6xl:  3.75rem;   /* 60px - Hero titles */

/* Font Weights */
--font-light:     300;
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 800;
```

### Typography Rules
- **Body Text:** 16px (1rem), line-height 1.6, color: gray-600
- **Headings:** Inter Bold/Semibold, color: gray-900
- **Line Length:** Max 65-75 characters for readability
- **Contrast:** Minimum 4.5:1 for body text, 3:1 for large text (WCAG AA)

---

## 3. 🧩 Component Styles

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary-500);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 200ms ease;
}
.btn-primary:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--color-primary-700);
  border: 2px solid var(--color-primary-500);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}
```

### Cards (Glassmorphism - Light Mode Friendly)
```css
.card {
  background: rgba(255, 255, 255, 0.9); /* High opacity for light mode */
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-gray-200);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 200ms ease;
}
.card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-300);
}
```

### Shadows
```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.15);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
```

---

## 4. 📐 Layout & Spacing

### Spacing Scale (8px base)
```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

### Container Widths
```css
--container-sm: 640px;   /* Mobile */
--container-md: 768px;   /* Tablet */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1280px;  /* Large desktop */
--container-2xl: 1536px; /* Max width for landing page */
```

### Border Radius
```css
--radius-sm: 0.25rem;  /* 4px - Small elements */
--radius-md: 0.5rem;   /* 8px - Buttons, inputs */
--radius-lg: 1rem;     /* 16px - Cards */
--radius-xl: 1.5rem;   /* 24px - Large cards */
--radius-full: 9999px; /* Fully rounded */
```

---

## 5. 🎭 Animation & Transitions

### Timing Functions
```css
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration
```css
--duration-fast:   150ms;
--duration-normal: 200ms;
--duration-slow:   300ms;
--duration-slower: 500ms;
```

### Accessibility (Reduced Motion)
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

-

