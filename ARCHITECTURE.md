# JOBinder — Architecture & Foundation Plan

---

## 1. PRODUCT ANALYSIS

### Core Domains (MVP)

| Domain        | Responsibility                                            |
| ------------- | --------------------------------------------------------- |
| **Auth**      | Authentication, session, RBAC                             |
| **Profile**   | User profile, preferences, onboarding                     |
| **Resume**    | Upload, parsing, analysis, versioning                     |
| **Discovery** | Swipe feed, job/referral cards, filtering, applications   |
| **AI**        | Provider abstraction, prompt management, orchestration    |
| **Shared**    | Design system, utilities, event bus, feature flags, types |

### Submodules (within Discovery)

```
discovery/
  job/             ← Job listings, scoring, ranking
  referral/        ← Referral requests, rewards
  application/     ← Manual apply, tracking
```

**Why?** For the first 2–3 months:

- Jobs only exist in the discovery feed
- Referrals only exist in the discovery feed
- Applications are just actions from discovery

Splitting them into top-level domains creates unnecessary abstractions before patterns emerge.

### Future Scalability Concerns

1. **AI cost at scale** — Prompt caching, response streaming, fallback providers
2. **Swipe latency** — Prefetch adjacent items, optimistic UI, WebSocket for real-time
3. **Multi-tenant readiness** — Row-level security (RLS) in Supabase, tenant isolation from day one
4. **Agent orchestration** — Event-driven architecture, message queues for async tasks
5. **Mobile performance** — Code splitting, lazy loading, image optimization, virtual lists

### Architectural Risks

| Risk                      | Mitigation                                                   |
| ------------------------- | ------------------------------------------------------------ |
| Provider lock-in (AI)     | Strict provider abstraction layer with adapter pattern       |
| State explosion (Zustand) | Domain-sliced stores, clear boundaries, no monolithic store  |
| Over-abstraction in MVP   | Start with 1-2 abstractions, refactor as patterns emerge     |
| Supabase vendor coupling  | Repository pattern over Supabase client; swap impl if needed |
| Swipe UI complexity       | Abstract card stack into reusable, testable hook/components  |

---

## 2. DOMAIN DESIGN

```
┌────────────────────────────────────────────────────────────────────┐
│                        DOMAIN MAP (MVP)                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  auth/ ───────► Authentication, Session, RBAC                      │
│  profile/ ────► User Profile, Skills, Preferences, Onboarding      │
│  resume/ ─────► Resume CRUD, Parsing, Analysis, Versioning         │
│  discovery/ ──► Swipe Feed, Job Cards, Referral Cards, Apply       │
│    ├── job/        (submodule)                                     │
│    ├── referral/   (submodule)                                     │
│    └── application/(submodule)                                     │
│  ai/ ────────► Provider Abstraction, Prompts, Context, Pipeline    │
│  shared/ ────► UI Kit, Utils, Types, Hooks, Events, Features, Lib │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Domain Internal Structure (ALL DOMAINS)

```
domains/
  {domain}/
    entities/          ← Domain models with business logic
      {domain}.ts

    repositories/      ← Data access interfaces + implementations
      {domain}-repository.ts       (interface)
      supabase-{domain}-repository.ts  (implementation)

    use-cases/         ← Business operations (single responsibility)
      {action}-{domain}.ts

    services/          ← External service orchestration (AI, 3rd-party)
      {domain}-ai-service.ts

    components/        ← UI components
    hooks/             ← Stateful logic
    stores/            ← Zustand slices
    types/             ← Zod schemas + TypeScript types
    utils/             ← Domain helpers
    __tests__/         ← Co-located tests
```

---

## 3. FOLDER STRUCTURE

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/                  # Authenticated shell
│   │   ├── feed/                     # Swipe discovery
│   │   ├── matches/                  # Saved matches
│   │   ├── applications/             # Track applications
│   │   ├── resume/                   # Resume management
│   │   ├── referrals/                # Referral hub
│   │   ├── profile/                  # User settings
│   │   └── layout.tsx                # Dashboard layout
│   ├── api/                          # Route handlers (Next.js API)
│   ├── layout.tsx                    # Root layout
│   ├── providers.tsx                 # Client providers
│   └── globals.css                   # Tailwind entry
│
├── domains/
│   ├── auth/
│   │   ├── entities/
│   │   │   └── session.ts
│   │   ├── repositories/
│   │   │   ├── auth-repository.ts
│   │   │   └── supabase-auth-repository.ts
│   │   ├── use-cases/
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   └── logout.ts
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── __tests__/
│   │
│   ├── profile/
│   │   ├── entities/
│   │   │   ├── user-profile.ts
│   │   │   └── user-skills.ts
│   │   ├── repositories/
│   │   │   ├── profile-repository.ts
│   │   │   └── supabase-profile-repository.ts
│   │   ├── use-cases/
│   │   │   ├── update-profile.ts
│   │   │   └── update-skills.ts
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── __tests__/
│   │
│   ├── resume/
│   │   ├── entities/
│   │   │   ├── resume.ts
│   │   │   └── resume-analysis.ts
│   │   ├── repositories/
│   │   │   ├── resume-repository.ts
│   │   │   └── supabase-resume-repository.ts
│   │   ├── use-cases/
│   │   │   ├── upload-resume.ts
│   │   │   ├── analyze-resume.ts
│   │   │   └── get-resume-analysis.ts
│   │   ├── services/
│   │   │   └── resume-ai-service.ts
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── __tests__/
│   │
│   ├── discovery/
│   │   ├── entities/
│   │   │   ├── swipe-session.ts
│   │   │   └── swipe-action.ts
│   │   ├── repositories/
│   │   │   ├── discovery-repository.ts
│   │   │   └── supabase-discovery-repository.ts
│   │   ├── use-cases/
│   │   │   ├── get-feed.ts
│   │   │   ├── swipe-job.ts
│   │   │   └── swipe-referral.ts
│   │   ├── services/
│   │   │   └── discovery-ai-service.ts
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── __tests__/
│   │   │
│   │   ├── job/                     # Submodule
│   │   │   ├── entities/
│   │   │   │   └── job.ts
│   │   │   ├── types/
│   │   │   │   └── job.types.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── referral/                # Submodule
│   │   │   ├── entities/
│   │   │   │   └── referral.ts
│   │   │   ├── types/
│   │   │   │   └── referral.types.ts
│   │   │   └── __tests__/
│   │   │
│   │   └── application/             # Submodule
│   │       ├── entities/
│   │       │   └── application.ts
│   │       ├── types/
│   │       │   └── application.types.ts
│   │       └── __tests__/
│   │
│   └── ai/
│       ├── entities/
│       │   ├── ai-request.ts
│       │   ├── ai-response.ts
│       │   ├── token-usage.ts
│       │   └── ai-usage.ts          # Cost tracking model
│       ├── repositories/
│       │   ├── ai-repository.ts
│       │   └── deepseek-ai-repository.ts
│       ├── providers/               # Adapters
│       │   ├── ai-provider.ts          (interface)
│       │   ├── deepseek.adapter.ts
│       │   ├── openai.adapter.ts
│       │   ├── claude.adapter.ts
│       │   └── gemini.adapter.ts
│       ├── use-cases/
│       │   ├── complete.ts
│       │   └── stream-complete.ts
│       ├── prompts/
│       │   ├── resume-analysis.ts
│       │   ├── job-matching.ts
│       │   ├── cover-letter.ts
│       │   └── skill-suggestions.ts
│       ├── hooks/
│       ├── services/
│       ├── types/
│       ├── utils/
│       └── __tests__/
│
├── shared/
│   ├── core/                        # Domain-agnostic patterns
│   │   ├── result.ts                # Result<T, E> pattern
│   │   └── errors.ts                # Base AppError
│   │
│   ├── ui/                          # Design System
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── tokens/
│   │
│   ├── events/                      # Event System
│   │   ├── event-bus.ts
│   │   └── handlers/
│   │       ├── resume-uploaded.ts
│   │       ├── resume-analyzed.ts
│   │       ├── job-liked.ts
│   │       ├── job-disliked.ts
│   │       ├── referral-requested.ts
│   │       └── application-submitted.ts
│   │
│   ├── config/                      # App Configuration
│   │   ├── env.ts                   # Zod-validated environment
│   │   ├── features.ts              # Feature flags
│   │   └── constants.ts
│   │
│   ├── lib/
│   │   ├── repositories/
│   │   │   └── repository-factory.ts
│   │   ├── http/
│   │   ├── supabase/
│   │   ├── logger/
│   │   └── validation/
│   │
│   ├── hooks/
│   ├── types/
│   └── utils/
│
├── middleware.ts                    # Next.js middleware (auth, i18n)
├── instrumentation.ts               # Telemetry setup
└── __tests__/
    ├── e2e/
    └── integration/
```

### Key Principles

- **No circular dependencies** — `shared/` never imports from `domains/`. Domains never import from each other; they communicate through the event bus or shared kernel.
- **Thin pages, thick domains** — `app/` pages are thin orchestrators that compose domain components.
- **Co-location** — Tests, types, and components live alongside the feature they belong to.
- **Clean Architecture layers** — entities → use-cases → repositories → services → stores → components

---

## 4. DESIGN SYSTEM ARCHITECTURE

### Token Hierarchy

```
┌──────────────────────────────────────┐
│         Semantic Tokens               │
│  (primary, success, danger, warning)  │
├──────────────────────────────────────┤
│         Component Tokens              │
│  (button-primary-bg, input-border)    │
├──────────────────────────────────────┤
│         Global Tokens                 │
│  (color-blue-500, spacing-4, text-sm) │
└──────────────────────────────────────┘
```

### Color Tokens

```ts
// shared/ui/tokens/colors.ts

export const colors = {
  // Brand
  primary:   { 50: '#…' , 100: '#…' , …, 900: '#…' },
  secondary: { 50: '#…' , …, 900: '#…' },

  // Neutral
  neutral:   { 0: '#FFFFFF', 50: '#…', …, 1000: '#000000' },

  // Semantic
  success:   { 500: '#…' },
  warning:   { 500: '#…' },
  danger:    { 500: '#…' },
  info:      { 500: '#…' },

  // Swipe-specific
  swipeLike:    { 500: '#22C55E' },
  swipePass:    { 500: '#EF4444' },
  swipeSuper:   { 500: '#3B82F6' },
} as const;
```

### Typography

```ts
// shared/ui/tokens/typography.ts

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    'display-lg': ['3rem', { lineHeight: '1.2', fontWeight: 700 }],
    'display-md': ['2.25rem', { lineHeight: '1.3', fontWeight: 700 }],
    'heading-lg': ['1.875rem', { lineHeight: '1.3', fontWeight: 600 }],
    'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: 600 }],
    'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: 600 }],
    'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: 400 }],
    'body-md': ['1rem', { lineHeight: '1.6', fontWeight: 400 }],
    'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: 400 }],
    caption: ['0.75rem', { lineHeight: '1.5', fontWeight: 400 }],
    label: [
      '0.75rem',
      { lineHeight: '1.5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
    ],
  },
} as const;
```

### Spacing

```ts
// shared/ui/tokens/spacing.ts

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;
```

### Component Hierarchy

```
atoms/               (no internal state, no business logic)
├── Button
├── Input
├── Badge
├── Avatar
├── Icon
├── Spinner
├── Text
├── Heading
└── Divider

molecules/           (compose atoms, minimal state)
├── Card
│   ├── Card.Header
│   ├── Card.Body
│   └── Card.Footer
├── FormField
│   ├── Label
│   ├── Input/Select/Textarea
│   └── ErrorMessage
├── Dialog
├── Dropdown
├── Tabs
├── Toast
└── SwipeCard         (used by discovery domain)

organisms/            (compose molecules, aware of layout)
├── PageHeader
├── BottomNav
├── Sidebar
├── SwipeStack         (card stack + gesture handler)
├── JobCard
├── ReferralCard
└── ApplicationStatusBar
```

### shadcn/ui Integration

- All shadcn/ui components live in `shared/ui/atoms/` and `shared/ui/molecules/`.
- They are customized via the `tokens/` layer — Tailwind config reads from token files.
- No domain logic leaks into primitives.
- Component API follows shadcn/ui patterns: `asChild` prop, Radix primitives, `cn()` for merging.

---

## 5. STATE MANAGEMENT ARCHITECTURE

### Layered State Model

```
┌──────────────────────────────────────────────────────┐
│                    ZUSTAND STORES                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ authStore│ │profileSt │ │resumeSt  │ │discovery│  │
│  │          │ │ ore      │ │ ore      │ │ Store   │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
├──────────────────────────────────────────────────────┤
│              TANSTACK QUERY (Server State)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ jobQueries│ │resumeQry │ │referralQ │ │applQry │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
├──────────────────────────────────────────────────────┤
│           REACT LOCAL STATE (useState/useReducer)     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │ formState│ │  uiState │ │ gesture/swipe state   │  │
│  └──────────┘ └──────────┘ └──────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Why Three Layers?

| Layer                   | Tool                | Responsibility                                            | Why Not XXX                                                                            |
| ----------------------- | ------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Server State**        | TanStack Query      | Data from Supabase (jobs, resumes, referrals)             | Zustand would require manual cache invalidation, stale-while-revalidate, deduplication |
| **Global Client State** | Zustand             | Auth session, UI preferences, swipe queue, active filters | Redux adds boilerplate; Zustand is minimal, TypeScript-friendly, slice-able            |
| **Local State**         | useState/useReducer | Form inputs, animation triggers, component visibility     | Lifting to global store would couple unrelated components                              |

### Zustand Store Architecture

Each domain gets its own store **slice** composed into a root store:

```ts
// domains/discovery/stores/discoveryStore.ts
interface DiscoveryState {
  // Swipe state
  currentIndex: number;
  cards: JobCardData[];
  direction: 'left' | 'right' | 'up' | null;

  // Actions
  swipe: (direction: 'left' | 'right' | 'up') => void;
  prefetchNext: () => Promise<void>;
  undo: () => void;
}
```

**Store communication**: Domains never import each other's stores directly. Cross-domain communication happens through:

1. **Event Bus** — `eventBus.emit('job:liked', payload)` / `eventBus.on('job:liked', handler)`
2. **Shared root store selectors** — e.g. `useAppStore((s) => s.auth.userId)` for domain stores that need auth context

### TanStack Query Patterns

```
useJobs()              → GET /api/jobs?page=1
useJob(id)             → GET /api/jobs/:id
useResumeAnalysis()    → POST /api/ai/analyze (mutation)
useSwipeMutation()     → POST /api/discovery/swipe (optimistic update)
```

- All queries use stale times appropriate to data freshness needs (jobs: 5 min, profile: Infinity, feed: 30 sec).
- Mutations use optimistic updates for swipe actions.

---

## 6. AI ARCHITECTURE

### Provider Abstraction (Strategy + Adapter Pattern)

```
┌─────────────────────────────────────────────────────────┐
│                     AI Engine                             │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │              AIService (Orchestrator)              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │   │
│  │  │ analyze  │ │  match   │ │  generate        │  │   │
│  │  │ Resume() │ │  Job()   │ │  CoverLetter()   │  │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │   │
│  └───────────────────────────────────────────────────┘   │
│                           │                               │
│                           ▼                               │
│  ┌───────────────────────────────────────────────────┐   │
│  │              AIProvider (Interface)                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │   │
│  │  │ DeepSeek │ │  OpenAI  │ │  Claude  │ │Gemini│ │   │
│  │  │          │ │          │ │          │ │      │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────┘ │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │               Prompt Templates                     │   │
│  │  resume-analysis.md  job-match.md  cover-letter.md │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │              Response Schema (Zod)                 │   │
│  │  Structured output parsing across all providers    │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### AIProvider Interface

```ts
// domains/ai/providers/ai-provider.ts

export interface AIProvider {
  readonly name: string;
  readonly model: string;

  complete<T>(params: AICompleteParams): Promise<AIResponse<T>>;
  stream?(params: AIStreamParams): AsyncIterable<AIChunk>;
  embed?(text: string): Promise<number[]>;
  estimateCost?(tokens: AITokenUsage): number;
}

export interface AICompleteParams {
  systemPrompt: string;
  userPrompt: string;
  schema?: ZodSchema<any>;
  temperature?: number;
  maxTokens?: number;
  context?: AIContext;
}
```

### Provider Adapter Example

```ts
// domains/ai/providers/deepseek.adapter.ts

export class DeepSeekAdapter implements AIProvider {
  readonly name = 'deepseek';
  readonly model = 'deepseek-v4-flash';

  async complete<T>(params: AICompleteParams): Promise<AIResponse<T>> {
    const response = await fetch('https://api.deepseek.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt },
        ],
        response_format: params.schema
          ? { type: 'json_schema', schema: zodToJsonSchema(params.schema) }
          : undefined,
      }),
    });
  }
}
```

### Prompt Management

```ts
// domains/ai/prompts/resume-analysis.ts
export function buildResumeAnalysisPrompt(resumeText: string): string {
  return `
You are an expert resume analyst.
Analyze the following resume and extract structured data.

RESUME:
${resumeText}

Respond with a JSON object matching the ResumeAnalysis schema.
`.trim();
}
```

### Response Parsing

```ts
// All provider responses validated against Zod schemas.

export const ResumeAnalysisSchema = z.object({
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      duration: z.string(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string(),
    }),
  ),
  suggestedRoles: z.array(z.string()),
  missingKeywords: z.array(z.string()),
});
```

### Adding a New Provider

1. Create `domains/ai/providers/{provider}.adapter.ts`
2. Implement `AIProvider` interface
3. Register in the provider registry
4. **Zero changes** to business logic

```ts
// domains/ai/repositories/ai-repository.ts
export function getProvider(name: ProviderName): AIProvider {
  const providers = {
    deepseek: () => new DeepSeekAdapter(),
    openai: () => new OpenAIAdapter(),
    claude: () => new ClaudeAdapter(),
    gemini: () => new GeminiAdapter(),
  };
  return providers[name]();
}
```

---

## 7. EVENT SYSTEM

### Purpose

The entire future multi-agent roadmap depends on event-driven architecture. Adding it now means zero refactoring later.

### Event Bus

```ts
// shared/events/event-bus.ts

type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

interface EventMap {
  'resume:uploaded': { userId: string; resumeId: string };
  'resume:analyzed': { userId: string; resumeId: string; analysis: ResumeAnalysis };
  'job:liked': { userId: string; jobId: string; score: number };
  'job:disliked': { userId: string; jobId: string };
  'referral:requested': { userId: string; referralId: string; jobId: string };
  'application:submitted': { userId: string; jobId: string; applicationId: string };
}

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void;
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void;
  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void;
}

export const eventBus = new EventBus();
```

### Agent Flow (Future)

```
ResumeUploaded
        ↓
AI Analyze Resume      ← eventBus.on('resume:uploaded', analyzeResumeHandler)
        ↓
Job Matching Agent     ← eventBus.on('resume:analyzed', matchJobsHandler)
        ↓
Feed Generated         ← eventBus.on('job:matched', generateFeedHandler)
```

---

## 8. FEATURE FLAGS

```ts
// shared/config/features.ts

export const FEATURES = {
  REFERRALS: process.env.NEXT_PUBLIC_FEATURE_REFERRALS === 'true' ?? false,
  AUTO_APPLY: process.env.NEXT_PUBLIC_FEATURE_AUTO_APPLY === 'true' ?? false,
  INTERVIEW_COACH: process.env.NEXT_PUBLIC_FEATURE_INTERVIEW_COACH === 'true' ?? false,
  NETWORKING_AGENT: process.env.NEXT_PUBLIC_FEATURE_NETWORKING_AGENT === 'true' ?? false,
  REFERRAL_MARKET: process.env.NEXT_PUBLIC_FEATURE_REFERRAL_MARKET === 'true' ?? false,
  AI_PIPELINE: process.env.NEXT_PUBLIC_FEATURE_AI_PIPELINE === 'true' ?? false,
} as const satisfies Record<string, boolean>;
```

Usage in code:

```ts
import { FEATURES } from '@/shared/config/features';

if (FEATURES.REFERRALS) {
  // render referral UI
}
```

---

## 9. ENVIRONMENT VALIDATION

### Rule

Fail immediately on startup if any required environment variable is missing or invalid. Never silently default to broken behavior.

### Implementation

```ts
// shared/config/env.ts

import { z } from 'zod';

const EnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // AI Provider
  DEEPSEEK_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(), // Phase 2+
  CLAUDE_API_KEY: z.string().optional(), // Phase 2+
  GEMINI_API_KEY: z.string().optional(), // Phase 2+

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof EnvSchema>;

let env: Env | null = null;

export function getEnv(): Env {
  if (!env) {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
      console.error('❌ Invalid environment variables:');
      for (const issue of result.error.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      }
      process.exit(1);
    }
    env = result.data;
  }
  return env;
}
```

### Usage

```ts
import { getEnv } from '@/shared/config/env';

const supabaseUrl = getEnv().NEXT_PUBLIC_SUPABASE_URL;
const deepseekKey = getEnv().DEEPSEEK_API_KEY;
```

---

## 10. RESULT PATTERN

### Why

Use-cases should not throw errors. They should return a discriminated union of success and failure. This becomes essential once AI and external APIs are involved — network failures, rate limits, malformed responses are the norm, not the exception.

### Implementation

```ts
// shared/core/result.ts

export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly _tag = 'success';
  constructor(public readonly value: T) {}

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<E> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Success(fn(this.value));
  }

  getOrElse(defaultValue: T): T {
    return this.value;
  }
}

export class Failure<E = Error> {
  readonly _tag = 'failure';
  constructor(public readonly error: E) {}

  isSuccess(): this is Success<unknown> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }

  map<U>(_fn: (value: unknown) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }
}

// Helper factories
export function success<T>(value: T): Success<T> {
  return new Success(value);
}

export function failure<E>(error: E): Failure<E> {
  return new Failure(error);
}
```

### Use-Case Return Convention

```ts
// domains/resume/use-cases/analyze-resume.ts

export class AnalyzeResumeUseCase {
  constructor(
    private readonly resumeRepo: ResumeRepository,
    private readonly aiService: ResumeAIService,
  ) {}

  async execute(params: AnalyzeResumeParams): Promise<Result<ResumeAnalysis, ResumeError>> {
    const resume = await this.resumeRepo.findById(params.resumeId);
    if (!resume) {
      return failure(new ResumeError('Resume not found', 'NOT_FOUND', 404));
    }

    const analysisResult = await this.aiService.analyze(resume.text);
    if (analysisResult.isFailure()) {
      return failure(new ResumeError('AI analysis failed', 'AI_ERROR', 503));
    }

    const saved = await this.resumeRepo.saveAnalysis(params.resumeId, analysisResult.value);
    return success(saved);
  }
}
```

### Calling from Components

```ts
const result = await analyzeResumeUseCase.execute({ resumeId });

if (result.isSuccess()) {
  // result.value is ResumeAnalysis
} else {
  // result.error is ResumeError
  logger.error('Analysis failed', { error: result.error });
}
```

---

## 11. REPOSITORY FACTORY

### Why

Today you use Supabase. Tomorrow you might migrate to Postgres, PlanetScale, or Neon. Every domain repository should be obtained through a factory that decouples the consumer from the concrete implementation.

No business code should ever call `new SupabaseResumeRepository()`.

### Implementation

```ts
// shared/lib/repositories/repository-factory.ts

import { SupabaseResumeRepository } from '@/domains/resume/repositories/supabase-resume-repository';
import { SupabaseDiscoveryRepository } from '@/domains/discovery/repositories/supabase-discovery-repository';
import { SupabaseProfileRepository } from '@/domains/profile/repositories/supabase-profile-repository';
import { SupabaseAuthRepository } from '@/domains/auth/repositories/supabase-auth-repository';

import type { ResumeRepository } from '@/domains/resume/repositories/resume-repository';
import type { DiscoveryRepository } from '@/domains/discovery/repositories/discovery-repository';
import type { ProfileRepository } from '@/domains/profile/repositories/profile-repository';
import type { AuthRepository } from '@/domains/auth/repositories/auth-repository';

// Single source of truth for repository implementations.
// Swap implementations here — zero changes to business logic.

export function getResumeRepository(): ResumeRepository {
  return new SupabaseResumeRepository();
}

export function getDiscoveryRepository(): DiscoveryRepository {
  return new SupabaseDiscoveryRepository();
}

export function getProfileRepository(): ProfileRepository {
  return new SupabaseProfileRepository();
}

export function getAuthRepository(): AuthRepository {
  return new SupabaseAuthRepository();
}
```

### Migration Example

```ts
// Today:       return new SupabaseResumeRepository();
// Migrate to:  return new PostgresResumeRepository();
// Migrate to:  return new PlanetScaleResumeRepository();
// No business code changes.
```

---

## 12. AI COST TRACKING

### Why

Without cost tracking from day one, you will never know why your AI bill exploded. Every AI request must be logged with user, model, tokens, cost, and latency.

### Entity

```ts
// domains/ai/entities/ai-usage.ts

export interface AIUsageRecord {
  id: string;
  userId: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number; // USD
  latencyMs: number;
  endpoint: string; // e.g. 'resume:analyze'
  success: boolean;
  errorCode?: string;
  timestamp: Date;
}

// Cost calculation is provider-specific but normalized to USD.
// Each adapter implements estimateCost() returning a USD value.
```

### Middleware

```ts
// domains/ai/services/cost-tracker.ts

export class AICostTracker {
  constructor(private readonly db: SupabaseClient) {}

  async record(usage: Omit<AIUsageRecord, 'id' | 'timestamp'>): Promise<void> {
    await this.db.from('ai_usage').insert({
      ...usage,
      timestamp: new Date().toISOString(),
    });
  }

  async getUserCost(userId: string, period: 'day' | 'month'): Promise<number> {
    // Aggregate cost for billing/alerts
  }
}
```

### Integration with AI Service

```ts
// Inside the AI orchestrator, every provider call is wrapped:

const start = performance.now();
const response = await provider.complete(params);
const latencyMs = performance.now() - start;

costTracker.record({
  userId: params.userId,
  model: provider.model,
  provider: provider.name,
  promptTokens: response.usage.promptTokens,
  completionTokens: response.usage.completionTokens,
  totalTokens: response.usage.totalTokens,
  cost: provider.estimateCost(response.usage),
  latencyMs,
  endpoint: params.endpoint,
  success: true,
});
```

---

## 13. TESTING ARCHITECTURE

### Test Pyramid

```
        ╱╲
       ╱ E2E ╲              Playwright — critical user journeys
      ╱────────╲
     ╱Integration╲          React Testing Library — component + store interactions
    ╱──────────────╲
   ╱   Unit Tests    ╲      Vitest — pure functions, services, utils, zod schemas
  ╱────────────────────╲
```

### Coverage Expectations

| Layer           | Tool         | Target         | What to Test                                                                    |
| --------------- | ------------ | -------------- | ------------------------------------------------------------------------------- |
| **Unit**        | Vitest       | ≥90%           | Pure functions, Zod schemas, entities, use-cases, repositories (mocked), stores |
| **Integration** | Vitest + RTL | ≥80%           | Component + hook combos, form submissions, store → UI flows                     |
| **E2E**         | Playwright   | Critical paths | Login, resume upload, swipe, apply                                              |

### Testing Conventions

```
__tests__/
├── components/            # RTL tests
├── hooks/                 # renderHook tests
├── services/              # Mocked service tests
├── stores/                # Store logic (no React needed)
├── use-cases/             # Business logic tests
├── repositories/          # Mock repository tests
├── entities/              # Domain model tests
└── __mocks__/
    └── supabase.ts
```

### Key Practices

- **No `data-testid`** — Use `getByRole`, `getByText`, `getByLabelText` for accessible selectors
- **MSW (Mock Service Worker)** for API mocking in integration tests
- **Store tests are pure** — Zustand stores are tested without React wrappers
- **AI tests** — Mock the AIProvider interface; test orchestration logic, not model output
- **Entity tests** — Test domain invariants, validation rules

---

## 14. CODING STANDARDS

### Naming Conventions

| Artifact                 | Convention                        | Example                                 |
| ------------------------ | --------------------------------- | --------------------------------------- |
| Files                    | `kebab-case`                      | `resume-analysis.ts`, `use-swipe.ts`    |
| Components               | `PascalCase`                      | `JobCard.tsx`, `SwipeStack.tsx`         |
| Hooks                    | `camelCase`, prefix `use`         | `useSwipeGesture`, `useJobs`            |
| Stores                   | `camelCase`, suffix `Store`       | `discoveryStore`, `authStore`           |
| Services                 | `camelCase`                       | `resumeService`, `jobMatchingService`   |
| Use-cases                | `kebab-case`                      | `upload-resume.ts`, `analyze-resume.ts` |
| Entities                 | `PascalCase`                      | `Resume`, `UserProfile`, `Job`          |
| Repositories (interface) | `PascalCase`, suffix `Repository` | `ResumeRepository`                      |
| Repositories (impl)      | `PascalCase`, prefix `Supabase`   | `SupabaseResumeRepository`              |
| Types                    | `PascalCase`                      | `JobCardData`, `ResumeAnalysis`         |
| Zod Schemas              | `PascalCase`, suffix `Schema`     | `JobSchema`, `ResumeSchema`             |
| Constants                | `UPPER_SNAKE_CASE`                | `SWIPE_THRESHOLD`, `MAX_FILE_SIZE`      |
| CSS Classes              | Tailwind utility classes          | Never write custom CSS unless necessary |
| Functions                | `camelCase`                       | `parseResume`, `calculateMatchScore`    |

### Folder Conventions

- One domain per folder under `src/domains/`
- Each domain has the same sub-folder structure: `entities/`, `repositories/`, `use-cases/`, `services/`, `components/`, `hooks/`, `stores/`, `types/`, `utils/`, `__tests__/`
- Submodules (job, referral, application) live inside discovery with: `entities/`, `types/`, `__tests__/`
- Shared code goes in `src/shared/`, never in a domain
- **Barrel exports** — Each domain has an `index.ts` that exports the public API

### Import Conventions

```ts
// Absolute imports only (configured via tsconfig paths)
// Order:
// 1. External packages
// 2. Internal shared modules
// 3. Domain imports (non-barrel for internal, barrel for cross-domain)

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/ui/atoms/Button';
import { useAuthStore } from '@/domains/auth/stores/authStore';
import { eventBus } from '@/shared/events/event-bus';
import type { Job } from '@/domains/discovery/job/types';

// NO relative imports across domains
// NO deep imports into another domain's internals
// NO importing from another domain's stores directly — use event bus
```

### tsconfig Paths

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@domains/*": ["./src/domains/*"],
      "@ui/*": ["./src/shared/ui/*"]
    }
  }
}
```

### Error Handling Conventions

```ts
// Domains define their own error types in entities/
// Use-cases throw typed errors
// Components catch and display via shared ErrorBoundary or toast

// domains/discovery/entities/swipe-error.ts
export class SwipeError extends Error {
  constructor(
    message: string,
    public readonly code: 'RATE_LIMITED' | 'JOB_GONE' | 'SESSION_EXPIRED' | 'UNKNOWN',
    public readonly status: number,
  ) {
    super(message);
    this.name = 'SwipeError';
  }
}

// shared/lib/http/errors.ts
export function handleApiError(error: unknown): AppError {
  if (error instanceof SwipeError) return error;
  if (error instanceof ZodError) return new ValidationError(error);
  return new AppError('An unexpected error occurred', 'UNKNOWN', 500);
}

// Error boundary for rendering failures
// TanStack Query's onError for data fetching failures
// try/catch in event handlers for user-triggered operations
```

### Logging Conventions

```ts
// shared/lib/logger/index.ts
// Abstraction over console that can be swapped for Datadog/OpenTelemetry

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) =>
    console.log(JSON.stringify({ level: 'info', message, meta })),
  warn: (message: string, meta?: Record<string, unknown>) =>
    console.warn(JSON.stringify({ level: 'warn', message, meta })),
  error: (message: string, meta?: Record<string, unknown>) =>
    console.error(JSON.stringify({ level: 'error', message, meta })),
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production')
      console.debug(JSON.stringify({ level: 'debug', message, meta }));
  },
};

logger.info('Swipe action recorded', { jobId, direction, userId });
```

---

## 15. MOBILE-FIRST RULE

### Hard Constraint

```
NO COMPONENT WIDER THAN 430px
WITHOUT EXPLICIT JUSTIFICATION.
```

- The core user is a job seeker on mobile
- Desktop adapts to mobile patterns, not vice versa
- All layouts default to mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- Any component exceeding 430px must have a comment explaining why

### Implementation

```tsx
// ✅ Default: mobile-first, max-width constrained
<div className="mx-auto w-full max-w-[430px]">
  <SwipeStack />
</div>

// ❌ No: desktop-first assumption
<div className="flex w-full max-w-4xl">
  <Sidebar />
  <SwipeStack />
</div>
```

---

## 16. AI CODE GATE

### Rule

```
NO AI GENERATED CODE
IS ACCEPTED
UNTIL:

✓ Type-safe        — no `any`, no `as` casts, Zod schemas for all IO boundaries
✓ Tested           — unit tests for logic, integration tests for UI
✓ Reusable         — extracted to appropriate domain, no copy-paste
✓ Accessible       — roles, labels, keyboard nav, screen reader support
✓ Mobile responsive — tested at 375px, 430px, 768px, 1024px, 1440px
✓ Lint clean       — ESLint + Prettier pass
✓ Build clean      — `npm run build` produces zero errors
```

### Why

OpenCode will happily generate 1000 lines of code that technically work but violate architecture. Every AI-generated contribution must pass the same bar as human-written code.

---

## 17. DESIGN REVIEW RULE

### Rule

Every new component must answer one question before it is created:

```
Can this become a shared component?
```

| Answer  | Destination                                   |
| ------- | --------------------------------------------- |
| **YES** | `shared/ui/` (atoms, molecules, or organisms) |
| **NO**  | Domain `components/` folder                   |

### Why

Without this rule, you get:

```
JobButton.tsx
ReferralButton.tsx
ResumeButton.tsx
ApplyButton.tsx
```

When all of them should be:

```
shared/ui/atoms/Button.tsx
```

### Enforcement

- Code review checklist item: "Could this component be shared?"
- If two domains have similar-looking components, extract to shared.
- Domain components must contain business logic that justifies their placement.
- Pure presentational components always belong in `shared/ui/`.

---

## 18. PROJECT SETUP TASKS

### Phase 0 — Scaffolding

- [ ] Initialize Next.js with TypeScript + App Router
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up `tsconfig.json` path aliases
- [ ] Install core deps: Zustand, TanStack Query, Zod, React Hook Form, Vitest, RTL, Playwright, MSW
- [ ] Set up ESLint + Prettier config (extend Next.js defaults)
- [ ] Set up Husky + lint-staged for pre-commit hooks
- [ ] Create folder structure (all domains, shared directories)
- [ ] Set up Vitest with `vitest.config.ts`
- [ ] Set up Playwright with `playwright.config.ts`
- [ ] Configure MSW handlers stub
- [ ] Create `globals.css` with Tailwind directives + CSS custom properties for tokens
- [ ] Configure Supabase client (server + browser)
- [ ] Create middleware.ts (auth redirect skeleton)
- [ ] Create root layout + providers.tsx (QueryClient, ThemeProvider)
- [ ] Set up logger abstraction
- [ ] Set up error handling utilities (`AppError`, `handleApiError`)
- [ ] Set up event bus (`shared/events/event-bus.ts`)
- [ ] Set up feature flags (`shared/config/features.ts`)
- [ ] Set up environment validation (`shared/config/env.ts`)
- [ ] Set up Result pattern (`shared/core/result.ts`)
- [ ] Set up repository factory (`shared/lib/repositories/repository-factory.ts`)
- [ ] Create barrel exports for `@shared/ui`, `@shared/lib`, `@shared/hooks`, `@shared/core`
- [ ] Add `ARCHITECTURE.md` to the repo

### Phase 1 — Design System & Shared Kernel

- [ ] Define color tokens in `shared/ui/tokens/`
- [ ] Define typography tokens in `shared/ui/tokens/`
- [ ] Define spacing tokens in `shared/ui/tokens/`
- [ ] Extend Tailwind config to consume design tokens
- [ ] Implement atom components: Button, Input, Badge, Avatar, Spinner, Text, Heading
- [ ] Implement molecule components: Card, FormField, Dialog, Dropdown, Tabs, Toast
- [ ] Implement shared hooks: useDebounce, useMediaQuery, useLocalStorage
- [ ] Implement shared utils: cn, format, guard, promise
- [ ] Build HTTP client with retry, timeout, error mapping
- [ ] Set up Zod validation helpers
- [ ] Write unit tests for all shared utils and tokens
- [ ] Write RTL tests for all atom components

### Phase 2 — Domain Scaffolds

- [ ] **Auth** domain: entities (session), repositories (auth-repository, supabase-auth-repository), use-cases (login, register, logout), store
- [ ] **Profile** domain: entities (user-profile, user-skills), repositories, use-cases (update-profile, update-skills), store
- [ ] **Resume** domain: entities (resume, resume-analysis), repositories, use-cases (upload, analyze, get-analysis), AI service
- [ ] **Discovery** domain: entities (swipe-session, swipe-action), repositories, use-cases (get-feed, swipe-job, swipe-referral), AI service, store
- [ ] **Job** submodule: entities (job), types
- [ ] **Referral** submodule: entities (referral), types
- [ ] **Application** submodule: entities (application), types
- [ ] **AI** domain: provider interface, DeepSeek adapter, prompts, response schemas, use-cases (complete, stream-complete), cost tracker (`AICostTracker`)
- [ ] Register event handlers for key domain events
- [ ] Write integration tests for auth flow (login/register/logout)
- [ ] Write unit tests for each store
- [ ] Write unit tests for AI provider adapter
- [ ] Set up E2E test scaffold (login → dashboard)

---

## 19. IMPLEMENTATION ROADMAP

```
WEEK 1-2:  Phase 0 — Scaffolding & Tooling
WEEK 3-4:  Phase 1 — Design System & Shared Kernel
WEEK 5-8:  Phase 2 — Domain Scaffolds & Testing Infrastructure
WEEK 9+:   Feature Implementation (business logic)
```

### Dependency Graph

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Features
   │            │            │
   ▼            ▼            ▼
 Tooling     Primitives    Domains
 Setup       + Utils       + Tests
```

### Priority Rationale

- **Phase 0 first** — Without tooling, linting, testing infrastructure, every line of code adds technical debt.
- **Phase 1 second** — Design system must exist before any feature is built. Ensures visual consistency and prevents UI drift.
- **Phase 2 third** — Domain scaffolds define the boundaries within which features will be built. Prevents cross-domain coupling.
- **Features last** — Only after the foundation is solid should business logic be added.

---

## 20. ARCHITECTURE REVIEW

### Weaknesses Identified

1. **TanStack Query + Zustand overlap risk** — Developers may put server data into Zustand. Mitigation: Code review rule: "Server data goes in TanStack Query. Only UI state and derived client state go in Zustand."

2. **Supabase real-time coupling** — If we use Supabase Realtime heavily, swapping to another backend becomes harder. Mitigation: Wrap Realtime subscriptions behind a repository/interface in `shared/lib/realtime/`.

3. **Prompt management at scale** — As prompts grow, inline template functions become unwieldy. Mitigation: In Phase 2+, migrate to a prompt registry with versioned templates stored in the database or a dedicated prompts/ directory with automatic loading.

4. **Missing caching layer** — No CDN or Edge cache strategy for job listings. Mitigation: Add SWR/Stale-while-revalidate headers to API routes; consider Supabase's built-in caching.

5. **E2E test maintenance** — Playwright tests for swipe gestures are fragile. Mitigation: Abstract swipe gestures into a reusable `SwipeSimulator` utility; use pointer events, not coordinates.

6. **Mobile-first but no PWA** — The architecture doesn't address offline support. Mitigation: Add service worker + IndexedDB caching in Phase 2 if offline access is required.

7. **AI cost observability** — No built-in cost tracking per user/request. Mitigation: Add a `costTracker` middleware in the AI service that logs token usage to Supabase for billing/analytics.

### Improvements to Add

- **Feature flags** — Already added: `shared/config/features.ts`
- **Event system** — Already added: `shared/events/event-bus.ts`
- **Telemetry** — Add OpenTelemetry instrumentation for request tracing across API → AI provider → response.
- **Rate limiting** — Add rate limiting at the middleware layer for AI endpoints.
- **API versioning** — Route handler paths should include `/api/v1/...` to allow breaking changes without affecting mobile clients.

---

_This document is a living artifact. Update it as architecture decisions evolve._
