# 🚀 GreenLean Production Refactor Plan

## 📊 Phase 1: Current State Analysis

### Current Architecture Overview
```
src/
├── components/          (78 files) - Mixed reusable & feature-specific
├── pages/              (28 files) - Large monolithic pages (Quiz: 1303 lines!)
├── hooks/              - Some custom hooks
├── contexts/           - Auth & Platform contexts
├── utils/              (64KB) - Mixed utilities
├── lib/                - Supabase & utils
├── services/           - ML & notification services
├── types/              - Type definitions
├── data/               - Static data
├── store/              - Zustand store (theme)
└── helpers/            - Challenge helpers

ml_service/
└── app.py              (44KB) - Single monolithic Python file
```

### 🔴 Critical Issues Identified

#### 1. **Folder Structure Issues**
- ❌ No clear separation between features
- ❌ Components mixed (UI + business logic + feature-specific)
- ❌ Pages are too large (1300+ lines)
- ❌ No feature-based architecture
- ❌ `helpers/` and `utils/` overlap

#### 2. **Code Quality Issues**
- ❌ Massive components (Quiz.tsx: 1303 lines)
- ❌ Inline styles and inconsistent Tailwind usage
- ❌ Hardcoded colors (green-500, blue-600, etc.)
- ❌ No code splitting or lazy loading
- ❌ Mixed concerns in components
- ❌ Limited use of React Query (installed but underutilized)

#### 3. **Performance Issues**
- ❌ No route-based code splitting
- ❌ Heavy use of localStorage instead of proper caching
- ❌ Unnecessary re-renders
- ❌ Large bundle size (1.9MB)
- ❌ No image optimization

#### 4. **Styling Issues**
- ❌ Primary color not aligned with #00C951 brand
- ❌ Inconsistent color usage across components
- ❌ Hardcoded Tailwind colors everywhere
- ❌ No centralized design tokens
- ❌ Dark mode implemented but inconsistent

#### 5. **Backend/Security Issues**
- ❌ Supabase calls scattered across components
- ❌ No centralized API layer
- ❌ Error handling inconsistent
- ❌ No request/response interceptors

#### 6. **Python/ML Service Issues**
- ❌ Single 44KB file (app.py)
- ❌ No separation of concerns
- ❌ No type hints or models
- ❌ Monolithic prompt generation

---

## 🎯 Phase 2: Target Architecture

### New Folder Structure
```
src/
├── features/                    # Feature-based modules
│   ├── auth/
│   │   ├── components/         # Login, Register, etc.
│   │   ├── hooks/              # useAuth, useLogin
│   │   ├── services/           # auth.service.ts
│   │   ├── types/              # auth.types.ts
│   │   └── index.ts
│   ├── quiz/
│   │   ├── components/         # QuizForm, QuestionCard
│   │   ├── hooks/              # useQuiz, useQuizProgress
│   │   ├── services/           # quiz.service.ts
│   │   ├── types/              # quiz.types.ts
│   │   └── constants/          # Quiz phases, questions
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── workout/
│   ├── nutrition/
│   ├── profile/
│   └── admin/
├── shared/                     # Shared across features
│   ├── components/             # Truly reusable UI
│   │   ├── ui/                 # shadcn components
│   │   ├── layout/             # Layout components
│   │   └── feedback/           # Toasts, modals, etc.
│   ├── hooks/                  # Shared hooks
│   ├── utils/                  # Shared utilities
│   ├── types/                  # Shared types
│   └── constants/              # Global constants
├── core/                       # Core app functionality
│   ├── config/                 # App configuration
│   ├── api/                    # API client setup
│   ├── router/                 # App routing
│   └── providers/              # Global providers
├── lib/                        # External lib configs
│   ├── supabase/              # Supabase client & helpers
│   ├── react-query/           # React Query config
│   └── analytics/             # Analytics setup
├── assets/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── styles/                     # Global styles
│   ├── theme/                 # Design tokens
│   ├── globals.css
│   └── tailwind.css
└── pages/                      # Route components only (thin)

ml_service/
├── app.py                      # FastAPI entry point
├── config/                     # Configuration
│   ├── settings.py
│   └── prompts/
├── models/                     # Pydantic models
│   ├── requests.py
│   └── responses.py
├── services/                   # Business logic
│   ├── meal_planner.py
│   ├── workout_generator.py
│   └── ai_service.py
├── prompts/                    # Prompt templates
│   ├── meal_prompts.py
│   └── workout_prompts.py
└── utils/                      # Utilities
```

### Design System with #00C951

#### Color Palette (Based on #00C951)
```css
:root {
  /* Brand Primary - GreenLean Green */
  --green-50: oklch(0.97 0.02 145);
  --green-100: oklch(0.94 0.05 145);
  --green-200: oklch(0.88 0.08 145);
  --green-300: oklch(0.80 0.12 145);
  --green-400: oklch(0.72 0.16 145);
  --green-500: #00C951; /* Primary Brand */
  --green-600: oklch(0.58 0.18 145);
  --green-700: oklch(0.48 0.15 145);
  --green-800: oklch(0.38 0.12 145);
  --green-900: oklch(0.28 0.08 145);

  /* Supporting Colors */
  --blue-accent: oklch(0.65 0.18 240);
  --orange-accent: oklch(0.70 0.16 50);
  --purple-accent: oklch(0.60 0.18 300);

  /* Semantic */
  --success: var(--green-500);
  --error: oklch(0.55 0.22 25);
  --warning: oklch(0.75 0.15 60);
  --info: var(--blue-accent);
}
```

---

## 📋 Phase 3: Detailed Implementation Plan

### Phase 3.1: Setup & Foundation (Day 1)
- [ ] Create development branch
- [ ] Setup ESLint + Prettier + Husky
- [ ] Configure path aliases (@features, @shared, @core)
- [ ] Setup React Query properly
- [ ] Create base folder structure

### Phase 3.2: Design System (Day 1-2)
- [ ] Implement #00C951 based theme
- [ ] Create design tokens (spacing, typography, shadows)
- [ ] Update Tailwind config with custom colors
- [ ] Build theme provider with light/dark mode
- [ ] Create consistent component variants

### Phase 3.3: Core Infrastructure (Day 2-3)
- [ ] Abstract Supabase client
- [ ] Create API service layer
- [ ] Setup React Query with proper types
- [ ] Implement error boundaries
- [ ] Create loading states & skeletons
- [ ] Setup route-based code splitting

### Phase 3.4: Auth Feature Module (Day 3-4)
- [ ] Extract auth to features/auth
- [ ] Create auth.service.ts
- [ ] Implement useAuth hook properly
- [ ] Build auth components (Login, Register, etc.)
- [ ] Add proper loading/error states

### Phase 3.5: Quiz Feature Module (Day 4-5)
- [ ] Break down 1303-line Quiz.tsx
- [ ] Create quiz/components/
- [ ] Extract to useQuiz hook
- [ ] Implement proper state management
- [ ] Add progress persistence with React Query

### Phase 3.6: Dashboard Feature Module (Day 5-6)
- [ ] Modularize dashboard components
- [ ] Create dashboard.service.ts
- [ ] Implement proper data fetching
- [ ] Add caching with React Query
- [ ] Optimize re-renders

### Phase 3.7: Workout & Nutrition Modules (Day 6-7)
- [ ] Extract workout features
- [ ] Extract nutrition/diet features
- [ ] Create dedicated services
- [ ] Implement proper hooks
- [ ] Add optimistic updates

### Phase 3.8: Profile & Admin Modules (Day 7-8)
- [ ] Refactor profile page
- [ ] Modularize admin dashboard
- [ ] Extract data tables
- [ ] Implement proper RBAC

### Phase 3.9: Python/ML Service Refactor (Day 8-9)
- [ ] Split app.py into modules
- [ ] Create Pydantic models
- [ ] Separate prompt templates
- [ ] Add type hints everywhere
- [ ] Implement proper error handling
- [ ] Add logging and monitoring

### Phase 3.10: Performance Optimization (Day 9-10)
- [ ] Implement lazy loading for routes
- [ ] Add React.memo where needed
- [ ] Optimize bundle size
- [ ] Implement image optimization
- [ ] Add proper caching headers
- [ ] Optimize database queries

### Phase 3.11: Testing & QA (Day 10-11)
- [ ] Test all features
- [ ] Check mobile responsiveness
- [ ] Verify dark mode consistency
- [ ] Test loading states
- [ ] Check accessibility
- [ ] Performance audit

### Phase 3.12: Documentation (Day 11-12)
- [ ] Write comprehensive README
- [ ] Document architecture
- [ ] Add JSDoc comments
- [ ] Create developer guide
- [ ] Document API endpoints
- [ ] Add deployment guide

---

## 🎨 Key Design Decisions

### 1. State Management Strategy
- **React Query** for server state (primary)
- **Zustand** for global UI state (theme, modals)
- **Context API** for auth & app-wide settings
- **Component state** for local UI

### 2. Styling Strategy
- **Tailwind** as primary styling solution
- **CSS Variables** for theme (design tokens)
- **Component variants** using CVA (class-variance-authority)
- **No inline styles** - use semantic classes

### 3. Code Organization
- **Feature-based** architecture (not layer-based)
- **Colocation** - keep related code together
- **Barrel exports** - clean imports with index.ts
- **Separation of concerns** - hooks, services, components

### 4. Performance Strategy
- **Route-based code splitting** with React.lazy
- **Component memoization** where beneficial
- **React Query caching** for API data
- **Optimistic updates** for better UX
- **Image optimization** and lazy loading

### 5. Type Safety
- **Strict TypeScript** configuration
- **Zod** for runtime validation
- **Type inference** from Supabase
- **Shared types** across frontend/backend

---

## 🚦 Success Criteria

### Code Quality
- ✅ No file over 300 lines
- ✅ No component over 200 lines
- ✅ 90%+ TypeScript coverage
- ✅ No `any` types
- ✅ Consistent naming conventions

### Performance
- ✅ Initial load < 2s
- ✅ Bundle size < 500KB (main chunk)
- ✅ Lighthouse score > 90
- ✅ No unnecessary re-renders

### Developer Experience
- ✅ Clear folder structure
- ✅ Easy to find code
- ✅ Consistent patterns
- ✅ Well-documented
- ✅ Fast development cycles

### User Experience
- ✅ Consistent design
- ✅ Fast page transitions
- ✅ Proper loading states
- ✅ Clear error messages
- ✅ Accessible (WCAG 2.1 AA)

---

## 🎯 Expected Outcomes

After completion:
1. **Scalable** - Easy to add new features
2. **Maintainable** - Easy to modify existing code
3. **Performant** - Fast load times and smooth UX
4. **Professional** - Production-ready quality
5. **Investor-ready** - Impressive architecture and polish
6. **Team-ready** - Multiple developers can work efficiently

---

## ⚠️ Git Strategy

- Work in `development` branch
- Never commit to `master`
- All merges via PR with review
- Semantic commits (feat:, fix:, refactor:, etc.)
- Keep commits atomic and focused

---

**Next Step:** Proceed to Phase 3.1 - Setup & Foundation
