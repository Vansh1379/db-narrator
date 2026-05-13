# DB Narrator — Frontend

The Frontend is a Vite + React + TypeScript single-page app that powers the DB Narrator product: a workspace where non-technical users upload a SQL dump, browse the resulting schema, and ask natural-language questions that the backend turns into validated SQL, executes, and returns as tables and charts.

This document is the primary reference for working on the frontend — it covers the stack, project layout, every page and component, the API contract with the backend, authentication, environment, theming, build, and deployment.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Pages & Routes](#pages--routes)
5. [Workspace Components](#workspace-components)
6. [API Layer (`src/lib/api.ts`)](#api-layer-srclibapits)
7. [Authentication (Clerk)](#authentication-clerk)
8. [State, Caching & Persistence](#state-caching--persistence)
9. [Design System & Theming](#design-system--theming)
10. [Environment Variables](#environment-variables)
11. [Local Development](#local-development)
12. [Build & Deployment](#build--deployment)
13. [Conventions & Contributing](#conventions--contributing)
14. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer            | Library / Tool                                |
| ---------------- | --------------------------------------------- |
| Framework        | React 18 + TypeScript                         |
| Build tool       | Vite 5 (`@vitejs/plugin-react-swc`)           |
| Styling          | Tailwind CSS 3 + `tailwindcss-animate`        |
| UI primitives    | shadcn/ui (Radix UI under the hood)           |
| Icons            | `lucide-react`                                |
| Forms            | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Data fetching    | `@tanstack/react-query` v5                    |
| Routing          | `react-router-dom` v6                         |
| Charts           | `recharts`                                    |
| Auth             | `@clerk/clerk-react`                          |
| File upload      | `react-dropzone`                              |
| Notifications    | `sonner` + Radix toast                        |
| Theming          | `next-themes` (light/dark/system)             |
| Linting          | ESLint 9 (flat config) + `typescript-eslint`  |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │
│  │  Landing /   │   │  Sign in /   │   │    Workspace         │ │
│  │  Demo        │   │  Sign up     │   │ (protected by Clerk) │ │
│  └──────────────┘   └──────────────┘   └──────────────────────┘ │
│         │                  │                      │             │
│         ▼                  ▼                      ▼             │
│        react-router + ProtectedRoute (SignedIn/Out)             │
│                              │                                  │
│                              ▼                                  │
│            TanStack Query  ⇄  src/lib/api.ts (fetch)            │
└──────────────────────────────────┼──────────────────────────────┘
                                   │ Bearer <Clerk JWT>
                                   ▼
                ┌──────────────────────────────────┐
                │   Backend (Express, /api/*)      │
                │   - upload SQL                   │
                │   - schema + sample rows         │
                │   - NL → SQL → execute           │
                │   - sessions list / delete       │
                └──────────────────────────────────┘
```

Key ideas:

- **Sessions** are the unit of work: one uploaded SQL dump → one `sessionId`. The current session id is persisted in `localStorage` so reloads stay on the same dataset.
- **Authentication** is enforced both in the router (Clerk’s `<SignedIn>` / `<RedirectToSignIn>`) and on every API call (`Authorization: Bearer <token>`). The token is fetched lazily per request via Clerk’s `getToken()`.
- **Server state** lives in TanStack Query (schema, sessions list, query results). Local UI state (search, selected table, active tab, draft messages) lives in component state.
- **Mock data** for the `/demo` route is bundled in the page itself so the demo works without a backend.

---

## Project Structure

```
Frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── App.tsx                  # Router + providers (ClerkProvider, QueryClient, Theme, Toaster)
│   ├── main.tsx                 # React bootstrap (renders <App />)
│   ├── index.css                # Tailwind layers + design-system CSS variables
│   ├── components/
│   │   ├── NavLink.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── theme-provider.tsx   # next-themes wrapper
│   │   ├── ui/                  # shadcn/ui primitives (Button, Card, Tabs, Table, …)
│   │   ├── upload/
│   │   │   └── UploadSQLCard.tsx
│   │   └── workspace/
│   │       ├── WorkspaceLayout.tsx
│   │       ├── LeftRail.tsx
│   │       ├── SchemaViewer.tsx
│   │       ├── DatabaseDiagram.tsx
│   │       ├── DatabaseVisualizer.tsx
│   │       ├── ChatPane.tsx
│   │       ├── ResultCard.tsx
│   │       ├── ResultTable.tsx
│   │       └── ChartCard.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Demo.tsx
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── Workspace.tsx
│   │   └── NotFound.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/
│       ├── api.ts               # All backend HTTP calls + ApiError
│       └── utils.ts             # cn() helper, formatting helpers
├── index.html
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── vercel.json                  # SPA rewrite for Vercel
├── tsconfig*.json
└── package.json
```

---

## Pages & Routes

| Route        | Component       | Auth     | Purpose                                                                                        |
| ------------ | --------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `/`          | `Landing.tsx`   | Public   | Marketing page: pitch, features, CTA into sign-up / demo.                                      |
| `/demo`      | `Demo.tsx`      | Public   | Walkthrough of the workspace using bundled mock data — no backend required.                    |
| `/sign-in/*` | `SignIn.tsx`    | Public   | Clerk-hosted sign-in flow.                                                                     |
| `/sign-up/*` | `SignUp.tsx`    | Public   | Clerk-hosted sign-up flow.                                                                     |
| `/workspace` | `Workspace.tsx` | Required | Upload SQL, manage sessions, explore schema, chat. Wrapped in `<ProtectedRoute>`.              |
| `/workspace/:sessionId` | `Workspace.tsx` | Required | Same as above, deep-linked to a specific session.                                  |
| `*`          | `NotFound.tsx`  | Public   | 404 fallback.                                                                                  |

Routing is configured in `App.tsx`. Protected routes are wrapped in a local `ProtectedRoute` component that renders `<SignedIn>{children}</SignedIn>` and falls back to `<SignedOut><Navigate to="/sign-in" replace /></SignedOut>` for unauthenticated users.

The schema visualizer is **not** a separate route — it is toggled inside `Workspace.tsx` via local state (`showVisualizer`) and overlays the workspace.

---

## Workspace Components

### `WorkspaceLayout.tsx`

Three-column resizable shell using `react-resizable-panels`:

- **Left rail** — sessions, history, “new upload” button.
- **Center** — schema viewer above, chat pane below (vertical split).
- **Right rail** — result card (SQL + table + chart) for the most recent answer.

Persists panel sizes to `localStorage`.

### `LeftRail.tsx`

Lists previously uploaded sessions (from `GET /api/sessions`), highlights the active one, supports deleting a session (`DELETE /api/sessions/:id`) with a confirm dialog, and exposes a “Upload new SQL” button that opens `UploadSQLCard`.

### `UploadSQLCard.tsx`

Drag-and-drop `.sql` upload (powered by `react-dropzone`). Streams progress, surfaces validation errors via `sonner` toasts, and on success swaps the workspace into the new `sessionId`.

### `SchemaViewer.tsx`

Compact in-workspace schema overview: table list with column counts, click-to-expand columns and FKs, and an “Open visualizer” button that flips `showVisualizer` in `Workspace.tsx` to overlay the full-screen explorer.

### `DatabaseVisualizer.tsx`

Full-screen schema explorer rendered as an overlay inside the workspace. Three tabs:

- **Structure** — column name, type, constraints (`NOT NULL`, `PRIMARY KEY`), defaults.
- **Relationships** — foreign keys rendered as `from → to` with `ON UPDATE` / `ON DELETE` metadata.
- **Sample** — first N sampled rows captured during ingestion, in a horizontally scrollable table.

Search filters tables by name or column name. Long values are truncated with `max-w-xs truncate`.

### `DatabaseDiagram.tsx`

Visual ER-style diagram of the schema (tables as nodes, FKs as edges).

### `ChatPane.tsx`

Conversational input bound to `POST /api/query/:sessionId`. Streams messages into a scrollable transcript, shows skeletons while waiting, and surfaces backend explanations alongside results. Composer supports `Shift+Enter` for newlines, `Enter` to send.

### `ResultCard.tsx`

Detailed result display: the executed SQL (syntax-highlighted, copyable), explanation, rows count, execution time, model confidence badge, and tabs to switch between **Table** (`ResultTable.tsx`) and **Chart** (`ChartCard.tsx`) views.

### `ResultTable.tsx`

Paginated, sortable data grid with cell truncation, copy-to-clipboard, and CSV-friendly rendering.

### `ChartCard.tsx`

Renders the backend-suggested chart (`bar | line | pie`) with `xKey` / `yKey` from `chartData`, and lets the user switch type via toolbar buttons. Built on `recharts`, with palette colors pulled from CSS variables (`--chart-1` … `--chart-5`).

---

## API Layer (`src/lib/api.ts`)

All backend calls go through this single module so authentication, base URL, and error handling stay consistent.

- **Base URL** — `import.meta.env.VITE_API_BASE_URL`, falling back to `http://localhost:5001` for local dev.
- **Auth** — every request adds `Authorization: Bearer <token>`. Each API function takes an `AuthGetter` (`() => Promise<string | null>`) as its first argument; callers obtain it from Clerk’s `useAuth().getToken`. Requests can opt out via `requiresAuth: false` (none currently do).
- **Errors** — non-2xx responses throw `ApiError` (subclass of `Error`) carrying `statusCode` and the parsed body so callers can branch on `err.statusCode`.
- **JSON safety** — responses are parsed once; empty bodies are tolerated.

### Endpoints used by the UI

| Method | Path                       | Purpose                                                  |
| ------ | -------------------------- | -------------------------------------------------------- |
| POST   | `/api/upload-sql`          | Upload a `.sql` dump (multipart/form-data, field `file`) |
| GET    | `/api/sessions`            | List the user’s sessions                                 |
| GET    | `/api/schema/:sessionId`   | Tables, columns, FKs, sample rows                        |
| POST   | `/api/query/:sessionId`    | NL question → `{ sql, explanation, rows, chartData, … }` |
| DELETE | `/api/sessions/:sessionId` | Delete a session and its DB                              |

Response shape for `POST /api/query/:sessionId` (see `QueryResponse` in `src/lib/api.ts`):

```ts
interface QueryResponse {
  sql: string;
  explanation: string;
  rows: Record<string, unknown>[];
  totalRows?: number;
  executionTime?: number;
  chartData?: {
    type: "bar" | "line" | "pie";
    xKey: string;
    yKey: string;
    data?: Record<string, unknown>[];
  };
  sources: Array<{
    id: string;
    type?: string;
    text: string;
    score?: number;
    meta?: Record<string, unknown>;
  }>;
  confidence?: number;
  tables_used?: string[];
}
```

---

## Authentication (Clerk)

- `App.tsx` wraps the tree in `<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>`; the app throws at startup if the key is missing.
- Protected routes use a local `ProtectedRoute` component that combines `<SignedIn>` with a `<SignedOut><Navigate to="/sign-in" /></SignedOut>` fallback.
- Tokens for backend calls are obtained per-request — no manual refresh logic, no token stored in `localStorage`.
- Sign-in and sign-up are routed through Clerk’s prebuilt components (`SignIn.tsx`, `SignUp.tsx`); custom flows can be added later if needed.

To run the app you **must** provide a valid `VITE_CLERK_PUBLISHABLE_KEY`. Without it Clerk fails to initialize and protected routes will not render.

---

## State, Caching & Persistence

| Concern                  | Where it lives                                          |
| ------------------------ | ------------------------------------------------------- |
| Sessions list, schema, query results | TanStack Query cache (in-memory)            |
| Active `sessionId`       | `localStorage` key `dbNarratorActiveSession`            |
| Panel sizes              | `localStorage` (handled by `react-resizable-panels`)    |
| Theme                    | `localStorage` via `next-themes`                        |
| Auth tokens              | Managed by Clerk (HttpOnly cookie / in-memory)          |

Query keys follow `["sessions"]`, `["schema", sessionId]`, `["queryResult", sessionId, queryId]` so invalidation after upload / delete is straightforward.

---

## Design System & Theming

- All semantic colors are defined as CSS variables in `src/index.css` (e.g. `--background`, `--foreground`, `--primary`, `--muted-foreground`, `--border`, `--ring`).
- Tailwind reads these via `tailwind.config.ts` so utilities like `bg-background`, `text-foreground`, `border-border` always resolve correctly in light **and** dark mode.
- Dark mode is class-based (`dark:` prefix) and toggled by `next-themes` through `ThemeToggle.tsx`.
- **Never hardcode colors** in components — use semantic tokens. Same for radii (`rounded-xl`, `rounded-2xl`) and typography (`font-sans`, `font-mono`).

---

## Environment Variables

Create `Frontend/.env` (Vite reads `VITE_*` vars at build time):

```env
# Backend base URL — omit to default to http://localhost:5001
VITE_API_BASE_URL=http://localhost:5001

# Clerk publishable key — REQUIRED
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

For production, set `VITE_API_BASE_URL` to the deployed backend (e.g. `https://jellyfish-app-z7mbn.ondigitalocean.app`).

> Never commit `.env`. The repo’s `.gitignore` already excludes it; double-check before pushing if you’re unsure.

---

## Local Development

Prerequisites: **Node.js 18+** and **npm**.

```bash
cd Frontend
npm install

# Create your .env (see above) before starting the dev server
npm run dev
```

The dev server runs on **http://localhost:8080** by default (configured in `vite.config.ts`). Vite’s HMR will reload on save.

To work end-to-end, also run the backend:

```bash
cd ../backend
npm install
npm run dev   # listens on http://localhost:5001 by default
```

### Useful scripts

| Command           | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR           |
| `npm run build`   | Production build into `dist/`            |
| `npm run build:dev` | Development-mode build (sourcemaps)    |
| `npm run preview` | Serve the built `dist/` locally          |
| `npm run lint`    | ESLint across the project                |

---

## Build & Deployment

`npm run build` outputs a static SPA into `Frontend/dist/`. It can be served by any static host.

### Vercel

`vercel.json` is already configured with a SPA rewrite so deep links (`/workspace`, `/visualizer/:id`) don’t 404. Set the same env vars in the Vercel project settings:

- `VITE_API_BASE_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`

### Other hosts (Netlify, Cloudflare Pages, S3 + CloudFront, etc.)

Configure a catch-all rewrite to `/index.html` and inject the same `VITE_*` env vars at build time.

---

## Conventions & Contributing

- **Folder layout** — feature-first under `components/<feature>/`. Pure UI primitives live in `components/ui/` (do not edit unless syncing with shadcn).
- **Imports** — use the `@/` alias (configured in `vite.config.ts` and `tsconfig.json`) — `import { Button } from "@/components/ui/button"`.
- **Component style** — function components, named props types, no default exports for shared components except where shadcn convention requires it.
- **Styling** — Tailwind utility classes; `cn()` helper from `lib/utils.ts` for conditional classes; semantic tokens only.
- **Forms** — `react-hook-form` + `zod` schemas; surface validation through shadcn `<Form>` primitives.
- **Server state** — go through `src/lib/api.ts` and TanStack Query, never `fetch` directly from a component.
- **Errors** — catch `ApiError`, branch on `statusCode`, show a toast via `sonner` for user-facing failures; log unexpected errors with `console.error`.
- **Accessibility** — keep Radix semantics (`<Dialog>`, `<Tabs>`, etc.); test keyboard navigation; never remove visible focus rings.

Before opening a PR:

```bash
npm run lint
npm run build
```

Both must pass. UI-touching changes should be verified in the browser (light + dark) — type-check is not a substitute for a visual pass.

---

## Troubleshooting

| Symptom                                              | Likely cause / fix                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Blank page, console: “Missing Clerk publishable key” | `VITE_CLERK_PUBLISHABLE_KEY` not set in `.env`. Restart Vite after editing `.env`. |
| 401 on every API call                                | Clerk session expired or backend not validating the JWT — sign out and back in.    |
| CORS error from backend                              | Backend `CORS_ORIGIN` doesn’t include the frontend origin.                         |
| `npm run dev` works, prod build is blank             | `VITE_*` envs were not provided at build time on the host (Vercel/Netlify).        |
| `/workspace` reload 404 on Vercel                    | SPA rewrite missing — confirm `vercel.json` is deployed.                           |
| Charts render with wrong colors                      | A component is hardcoding hex values instead of using CSS variables.               |

---

If something here is out of date with the code, the code wins — please update this README in the same PR.
