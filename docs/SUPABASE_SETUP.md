# Supabase Setup Guide

## Prerequisites

- A [Supabase](https://supabase.com) account
- Supabase CLI (optional, for local development)

## 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Enter project details and a strong database password
4. Choose a region close to your users
5. Wait for the project to be provisioned (~2 minutes)

## 2. Run Migrations

In the Supabase SQL Editor, run the migrations in order:

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Run `packages/supabase/migrations/001_initial_schema.sql`
3. Run `packages/supabase/migrations/002_rls_policies.sql`

Or using the Supabase CLI:
```bash
supabase db push
```

## 3. Configure Environment Variables

### Web App (`apps/web/.env.local`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Dashboard (`apps/dashboard/.env.local`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile (`apps/mobile/.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Find Your Keys

1. Go to **Project Settings** → **API**
2. Copy the **Project URL** and **anon/public** key

## 5. Create Admin User

After running migrations, create an admin user:

1. Go to **Authentication** → **Users** → **Add User**
2. Then in SQL Editor, update their role:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
```

## 6. Enable OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable Google, GitHub, or other providers
3. Add the provider credentials
