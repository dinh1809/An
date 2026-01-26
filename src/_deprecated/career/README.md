# 🚧 DEPRECATED: Career Features

**Date Deprecated:** 2026-01-25  
**Reason:** Refocusing project on "An Connect" features. Career assessment and job matching features are being deprioritized.

## 📦 Moved Files

### Library Files (`lib/`)
- `CareerEngine.ts` - Career matching and job recommendation engine
- `AiVocationalService.ts` - AI-powered vocational advice service

### Pages (`pages/`)
- `Opportunities.tsx` - Job opportunities listing page

### Components (`components/`)
- `opportunities/JobCard.tsx` - Job card component for displaying opportunities
- `AiRoadmapGenerator.tsx` - AI-powered career roadmap generator

## 🔄 Migration Path

These files are preserved for potential future reuse. If career features need to be restored:

1. Move files back to their original locations
2. Restore routes in `App.tsx`
3. Re-enable navigation items in `BottomNav.tsx` and `DesktopSidebar.tsx`
4. Update imports in dependent files

## ⚠️ Important Notes

- **DO NOT DELETE** these files - they contain valuable logic that may be reused
- Assessment features (`/assessment/*`) remain active as they serve both Career and Connect journeys
- The `CareerEngine.ts` contains sophisticated job matching algorithms that may be valuable later
- AI services may be repurposed for Connect features

## 📋 Related Active Features

- **An Connect** (`/connect`, `/parent/*`) - Primary focus
- **Assessment Games** (`/assessment/*`) - Shared between Career and Connect
- **Digital Factory** (`/workspace/*`) - Worker journey (active)
