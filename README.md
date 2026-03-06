# Shiftly Health

A comprehensive mental and physical wellness platform built as a **Turborepo monorepo**.

## 🏗️ Monorepo Structure

```
shiftly-health/
├── apps/
│   ├── web/          # React + Vite patient-facing web app
│   ├── dashboard/    # React + Vite admin/developer dashboard
│   └── mobile/       # React Native + Expo mobile app
├── packages/
│   ├── shared/       # Shared types, constants & utilities
│   ├── supabase/     # Supabase client & migrations
│   └── ui-components/# Reusable component library
├── .github/
│   └── workflows/    # CI/CD pipelines (ci.yml, deploy-web.yml, mobile-build.yml)
├── docs/             # Documentation
├── turbo.json        # Turborepo build config
└── package.json      # Root workspace config
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0

### Install & Run

```bash
# Install all dependencies across all workspaces
npm install

# Start all apps in development mode
npm run dev

# Start individual apps
npm run dev:web        # Web app on port 5173
npm run dev:dashboard  # Dashboard on port 5174
npm run dev:mobile     # Mobile app (Expo)
```

### Build

```bash
npm run build          # Build all apps
```

## 📱 Apps

### Web App (`apps/web`)
Patient-facing React + Vite application for mood tracking and health monitoring.

### Admin Dashboard (`apps/dashboard`)
Internal admin dashboard for managing users, support tickets, analytics, billing, and system health. Role-based access for admin, support, marketing, and accounting teams.

### Mobile App (`apps/mobile`)
React Native + Expo app for iOS and Android with mood tracking, health metrics, and insights.

## 📦 Packages

### `@shiftly-health/shared`
Shared TypeScript types, constants, and utility functions used across all apps.

### `@shiftly-health/supabase`
Supabase client configuration and database type definitions.

## 🗄️ Database

The database schema is managed via SQL migrations in `packages/supabase/migrations/`:

- `001_initial_schema.sql` - All tables, indexes, triggers, and seed data
- `002_rls_policies.sql` - Row Level Security policies

See [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) for setup instructions.

## 📚 Documentation

| Doc | Description |
|-----|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | System design and tech stack |
| [Supabase Setup](./docs/SUPABASE_SETUP.md) | Database configuration |
| [API Reference](./docs/API.md) | Data access patterns |
| [Deployment](./docs/DEPLOYMENT.md) | Production deployment guides |
| [Contributing](./docs/CONTRIBUTING.md) | Development guidelines |

## 🔧 Environment Variables

Copy the example files and fill in your Supabase credentials:

```bash
# Web
cp apps/web/.env.example apps/web/.env.local

# Dashboard  
cp apps/dashboard/.env.example apps/dashboard/.env.local

# Mobile
cp apps/mobile/.env.example apps/mobile/.env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🚢 CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **`ci.yml`** - Runs on every push/PR: lint, test, build
- **`deploy-web.yml`** - Deploys web app on push to `main`
- **`mobile-build.yml`** - Builds Android/iOS with Expo EAS

## 📄 License

MIT
