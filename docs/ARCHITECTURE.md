# Architecture Documentation

## Overview

Shiftly Health is a mental and physical wellness platform built as a monorepo using Turborepo. The platform consists of three applications sharing common packages.

## Monorepo Structure

```
shiftly-health/
├── apps/
│   ├── web/          # React + Vite patient-facing web app (port 5173)
│   ├── dashboard/    # React + Vite admin dashboard (port 5174)
│   └── mobile/       # React Native + Expo mobile app
├── packages/
│   ├── shared/       # Shared types, constants, and utilities
│   ├── supabase/     # Supabase client and migrations
│   └── ui-components/# Reusable component library (future)
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docs/             # Documentation
```

## Tech Stack

### Frontend (Web & Dashboard)
- **React 18** - UI framework
- **Vite 6** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS
- **React Router 7** - Client-side routing
- **TanStack Query 5** - Server state management
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Mobile
- **React Native 0.74** - Cross-platform mobile
- **Expo 51** - Development platform
- **Expo Router 3** - File-based navigation

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Auth (email/password, OAuth)
  - Storage
  - Edge Functions
  - Realtime subscriptions

### Infrastructure
- **Turborepo** - Monorepo build system with caching
- **GitHub Actions** - CI/CD pipelines

## Data Flow

```
Mobile App ──┐
             ├── Supabase API ── PostgreSQL
Web App ─────┤   (REST/Realtime)
             │
Dashboard ───┘
```

## Authentication

Authentication is handled entirely by Supabase Auth. On signup, a database trigger automatically creates a `profiles` record linked to `auth.users`.

## Security

- All tables use Row Level Security (RLS) policies
- Users can only access their own data
- Admin/staff roles have elevated permissions defined in RLS policies
- API keys are stored as hashed values only
- All admin actions are logged in `audit_logs`
