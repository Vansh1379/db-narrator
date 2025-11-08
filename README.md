# DB RAG Analytics - AI-Powered Database Insights

A modern, polished frontend for an AI-driven database RAG & analytics web application. Upload your SQL schema, ask questions in natural language, and get instant insights with auto-generated SQL queries, charts, and visualizations.

## Features

✨ **Natural Language Queries** - Ask questions about your database in plain English
📊 **Auto-Generated Visualizations** - Charts and tables generated automatically from query results
🎯 **Schema Explorer** - Interactive schema viewer with table details, columns, and sample data
💾 **SQL Preview** - Review and edit generated SQL before execution
🎨 **Modern UI** - Clean, developer-friendly interface with dark mode support
📱 **Responsive Design** - Full mobile support with collapsible sidebars

## Tech Stack

- **React** + **TypeScript** - Modern UI framework with type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling with custom design system
- **Recharts** - Beautiful, responsive charts
- **Shadcn/ui** - High-quality, accessible UI components
- **Clerk** - Authentication (to be integrated)
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- (Optional) Clerk account for authentication

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Clerk Authentication (when integrated)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here

# Backend API URL
VITE_API_URL=http://localhost:8000
```

## Project Structure

```
src/
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── upload/              # Upload SQL file components
│   └── workspace/           # Main workspace components
│       ├── WorkspaceLayout.tsx
│       ├── LeftRail.tsx     # Session & history sidebar
│       ├── SchemaViewer.tsx # Database schema explorer
│       ├── ChatPane.tsx     # Query input & messages
│       ├── ResultCard.tsx   # SQL + results display
│       ├── ResultTable.tsx  # Data table with pagination
│       └── ChartCard.tsx    # Interactive charts
├── pages/
│   ├── Landing.tsx          # Landing page
│   ├── Workspace.tsx        # Main workspace page
│   └── NotFound.tsx         # 404 page
├── lib/
│   └── utils.ts             # Utility functions
└── index.css                # Design system & tokens

```

## Design System

The app uses a comprehensive design system defined in `src/index.css`:

- **Primary Color**: Teal (#0ea5a4) - Main brand color
- **Accent Color**: Indigo (#6366f1) - Interactive elements
- **Typography**: Inter for UI, JetBrains Mono for code
- **Spacing**: Generous padding with rounded-2xl corners
- **Dark Mode**: Full dark mode support with semantic tokens

## API Integration

The frontend expects these backend endpoints:

### POST `/api/upload-sql`
Upload SQL schema file

**Request**: `multipart/form-data` with `file` field
**Response**: `{ sessionId, tables, status, message }`

### GET `/api/schema/:sessionId`
Get database schema details

**Response**: `{ sessionId, tables: [{ name, columns, sampleRows, rowCount }] }`

### POST `/api/query/:sessionId`
Execute natural language query

**Request**: `{ query, topK? }`
**Response**: `{ sql, explanation, rows, chartData, sources, confidence }`

## Mock Data

The app currently uses mock data for development. To integrate with your backend:

1. Update API calls in components (currently mocked)
2. Add your backend URL to environment variables
3. Implement proper error handling for API calls

## Features Roadmap

- [x] Landing page with features showcase
- [x] SQL file upload with progress tracking
- [x] Interactive schema viewer
- [x] Natural language chat interface
- [x] Result display with SQL, table, and charts
- [ ] Clerk authentication integration
- [ ] Backend API integration
- [ ] Query history persistence
- [ ] CSV/Excel export functionality
- [ ] ER diagram visualization
- [ ] Dark mode toggle
- [ ] Advanced filtering and search

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Contributing

This is a frontend implementation based on the provided specifications. To contribute:

1. Follow the existing component structure
2. Use the design system tokens (no hardcoded colors)
3. Ensure TypeScript types are properly defined
4. Test responsive behavior on mobile

## License

MIT License - feel free to use this project for your own applications.

---

**Built with ❤️ using Lovable**
