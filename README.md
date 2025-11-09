# DB Narrator – AI-Assisted Database Analyst

DB Narrator is a full-stack product that lets non-technical teammates explore their database with natural language. Users upload a SQL dump (or connect to a live source), DB Narrator ingests the schema, extracts sample data, builds embeddings, and then exposes the data through a conversational workspace backed by AI-generated SQL. The frontend provides a polished analytics experience with a live schema explorer, visual query results, and an interactive demo mode.

---

## Table of Contents

1. [High-Level Idea](#high-level-idea)
2. [Tech Stack](#tech-stack)
3. [User Flow](#user-flow)
4. [Backend Flow](#backend-flow)
5. [Frontend Flow](#frontend-flow)
6. [Key API Contracts](#key-api-contracts)
7. [Development Setup](#development-setup)
8. [Next Steps](#next-steps)

---

## High-Level Idea

- **Upload SQL → Ask Questions → See Answers.**
  1. The user uploads a `.sql` file containing their schema (DDL + seed data).
  2. The backend parses the SQL, builds a SQLite database, extracts schema metadata, and generates embeddings.
  3. The user lands in the workspace, where they can see session history, browse the schema explorer, and ask questions in natural language.
  4. Every chat message calls the backend `/api/query/:sessionId` endpoint, which generates SQL, validates it, executes it, and returns rows with a human-readable explanation and metadata.
  5. The visualizer renders tables, columns, foreign keys, and sample rows from the same schema response.

---

## Tech Stack

| Layer      | Technology                                | Notes                                                                      |
| ---------- | ----------------------------------------- | -------------------------------------------------------------------------- |
| Frontend   | React 18 + TypeScript                     | Vite build, TanStack Query for data fetching, Clerk for auth.              |
| UI Toolkit | Tailwind CSS + shadcn/ui                  | Provides consistent components & theming with dark mode support.           |
| Charts     | Recharts                                  | Dynamic bar/line/pie results in `ResultCard`.                              |
| Backend    | Node.js + Express                         | REST API, schema parsing, SQL execution.                                   |
| Database   | SQLite (per-session)                      | Ingested from uploaded SQL; stored under `backend/databases`.              |
| Auth       | Clerk                                     | Frontend obtains JWT, backend reads `req.userId`.                          |
| Embeddings | Custom service (`services/embeddings.js`) | Generates text embeddings for the schema (implementation outline in repo). |

---

## User Flow

1. **Landing Page**

   - Explains the value proposition, has CTA to sign in/sign up, shows highlights and workflow.
   - “See how it works” opens a guided `/demo` page that visually walks through upload → chat → sharing.

2. **Authentication (Clerk)**

   - `/sign-in` and `/sign-up` use Clerk-hosted forms. After login, users are redirected to `/workspace`.

3. **Workspace**

   - If the user has no sessions yet, they see an upload card (`UploadSQLCard`) centered on the screen.
   - Uploading a `.sql` file:
     - Frontend calls `uploadSqlFile` (multipart) with Clerk token.
     - The backend returns `{ status: 'indexed', sessionId, tables, message }`.
     - The client stores the `sessionId` in `localStorage` and refetches sessions/schema.
   - The left rail lists sessions (fetched from `/api/sessions`). Users can click to switch or delete them.
   - The chat pane lets users send natural language questions; each request calls `/api/query/:sessionId`.
   - The schema viewer & visualizer use the latest schema response (`/api/schema/:sessionId`) cached via TanStack Query and localStorage.

4. **Demo Mode (`/demo`)**
   - Shows a static but animated pipeline of how DB Narrator works.
   - Includes sample charts and timeline to help a prospective user understand the flow without uploading data.

---

## Backend Flow

The backend Express app lives in `backend/` and exposes authenticated endpoints under `/api/...`. Default port: **5000** (env override supported with `PORT`). CORS origin defaults to `http://localhost:8080` (update to `http://localhost:5173` for the Vite dev server, or via `CORS_ORIGIN` env).

### Key steps when uploading a SQL file

1. **Multer Upload (`routes/upload.js`)**

   - Accepts `.sql`. Saves to `uploads/`, 10MB size limit.
   - Derives `sessionId` via `uuid`.

2. **SQLite Ingestion**

   - `utils/sqlite.js` builds a per-session `.db`, runs the SQL file, extracts schema metadata (column info, sample rows).
   - Parsed schema is enriched by merging SQL parser results with actual SQLite introspection.

3. **Embeddings**

   - `services/embeddings.js` indexes the schema (function stub indicates how to add vector DB support).

4. **Metadata Storage**

   - Metadata (file name, tables, timestamps, schema) saved to `databases/<sessionId>_meta.json`.
   - Vectors saved as `<sessionId>_vectors.db`.

5. **Response**
   ```json
   {
     "status": "indexed",
     "sessionId": "uuid",
     "tables": ["users", "orders", ...],
     "message": "Indexed 14 snippets from 14 tables"
   }
   ```

### Fetch Schema (`GET /api/schema/:sessionId`)

- Verifies ownership via metadata.
- Returns cached schema or re-extracts via SQLite manager.
- The frontend stores the response in `localStorage` (`dbNarratorSchema:<sessionId>`) for reuse.

### Run Query (`POST /api/query/:sessionId`)

1. Validate session & determine DB (SQLite by default; placeholders exist for MySQL/Postgres).
2. Pass schema to `QueryGenerator` (AI model) to produce SQL & explanation.
3. Validate SQL with `SQLValidator` (read-only, dialect aware).
4. Execute query; return rows, explanation, execution time, tables used, etc.

Example response:

```json
{
  "sql": "SELECT ... FROM movies LIMIT 100",
  "explanation": "Retrieves all movie columns.",
  "rows": [{ "movie_id": 1, "title": "Inception", ... }],
  "executionTime": 0.002,
  "confidence": 1,
  "tables_used": ["movies"]
}
```

### Sessions (`GET/DELETE /api/sessions`)

- Lists metadata for all sessions owned by the user.
- Deleting removes the `.db`, `_meta.json`, and `_vectors.db` files.
- Frontend handles optimistic updates and state cleanup.

---

## Frontend Flow

The frontend lives in `Frontend/` and is built with Vite.

### State & Data Fetching

- **TanStack Query** caches sessions and per-session schema.
- **LocalStorage** caches the active session id (`dbNarratorActiveSession`) and schema (`dbNarratorSchema:<sessionId>`).
- Changing the selected session updates local state and the cached schema.
- Chat panel resets when switching sessions.

### Major Components

| Component            | Responsibility                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `UploadSQLCard`      | Handles drag-and-drop upload, upload progress UI, and calls `/api/upload-sql`.                                                     |
| `Workspace` page     | Orchestrates session state, data fetching, local storage, and renders the workspace layout.                                        |
| `WorkspaceLayout`    | Shell containing header, left rail, chat pane, schema rails, and mobile drawers.                                                   |
| `LeftRail`           | Renders session list with skeletons, selection, and delete buttons. “New Upload” clears active session (returns to upload screen). |
| `ChatPane`           | Renders chat transcript, handles input, calls `/api/query/:sessionId`, infers chart config from result rows.                       |
| `ResultCard`         | Shows SQL, explanation, table results, and a chart (Recharts).                                                                     |
| `SchemaViewer`       | Displays schema tables within the workspace rail using the cached schema response.                                                 |
| `DatabaseVisualizer` | Full-screen schema explorer with search, columns info, relationships, and sample rows (pulls from the same schema response).       |
| `Demo` page          | Static interactive walkthrough for marketing / onboarding.                                                                         |

### Navigation

- `/` – Landing + marketing site
- `/demo` – Guided story of the app
- `/sign-in`, `/sign-up` – Clerk forms
- `/workspace` – Upload card if no active session; otherwise workspace
- `/workspace/:sessionId` – Same workspace with specific session selected

---

## Key API Contracts

| Endpoint                   | Method           | Body                                   | Description                                               |
| -------------------------- | ---------------- | -------------------------------------- | --------------------------------------------------------- |
| `/api/upload-sql`          | POST (multipart) | `file`, optional `name`                | Uploads `.sql`, builds session. Returns session metadata. |
| `/api/schema/:sessionId`   | GET              | —                                      | Returns schema (`tables`, columns, sample rows).          |
| `/api/query/:sessionId`    | POST (JSON)      | `{ "query": string, "topK"?: number }` | Runs AI-generated SQL against the session DB.             |
| `/api/sessions`            | GET              | —                                      | Lists sessions (owned by user).                           |
| `/api/sessions/:sessionId` | DELETE           | —                                      | Deletes all files for the session.                        |
| `/health`                  | GET              | —                                      | Simple health check.                                      |

> All `/api/...` routes require an `Authorization: Bearer <Clerk-JWT>` header. The frontend obtains the token via `useAuth().getToken()`.

---

## Development Setup

1. **Clone and install**

   ```bash
   git clone <repo>
   cd backend && npm install
   cd ../Frontend && npm install
   ```

2. **Environment variables**

   - Backend (`backend/.env`):
     ```
     PORT=5001
     CORS_ORIGIN=http://localhost:5173
     CLERK_SECRET_KEY=...
     ```
   - Frontend (`Frontend/.env`):
     ```
     VITE_API_BASE_URL=http://localhost:5001
     VITE_CLERK_PUBLISHABLE_KEY=...
     ```

3. **Run backend**

   ```bash
   cd backend
   npm run start
   # or nodemon for auto reload
   ```

4. **Run frontend**

   ```bash
   cd Frontend
   npm run dev
   ```

   Vite runs on port 5173 by default.

5. **Authentication**

   - Create a Clerk application, configure publishable & secret keys.
   - Ensure the backend verifies Clerk tokens before reading `req.userId` (middleware hook to be implemented per deployment environment).

6. **Uploading SQL**
   - Prepare a `.sql` file (DDL + optional seed data).
   - Upload through the workspace card.
   - Inspect generated `databases/` directory under `backend/` for session artifacts.

---

## Next Steps

- **Live DB connections** – Extend upload flow to accept connection strings for Postgres/MySQL.
- **Advanced charting** – Detect time-series vs categorical data for better default chart choices.
- **Query history & saved insights** – Currently placeholders in the UI; connect them to persistent storage.
- **Team collaboration** – Share sessions with other authenticated users.
- **Observability** – Hook up logging / error tracking and improve monitoring for query execution.

---

If you have questions or want to contribute, please open an issue or ping the maintainers. Happy narrating your data! 📊✨
