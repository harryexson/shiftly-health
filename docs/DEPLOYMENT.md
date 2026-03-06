# Deployment Guide

## Web App (apps/web)

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set root directory to `apps/web`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Netlify

1. Connect repository to Netlify
2. Base directory: `apps/web`
3. Build command: `npm run build`
4. Publish directory: `apps/web/dist`
5. Add environment variables in site settings

## Dashboard (apps/dashboard)

Same process as web app but with:
- Root directory: `apps/dashboard`
- Recommend protecting behind VPN or IP allowlist

## Mobile App (apps/mobile)

### Using Expo EAS Build

```bash
cd apps/mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

### Submit to Stores

```bash
# Android
eas submit --platform android

# iOS  
eas submit --platform ios
```

## Environment Variables

### GitHub Actions Secrets Required

| Secret | Description |
|--------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_URL` | Supabase URL (for mobile) |
| `SUPABASE_ANON_KEY` | Supabase anon key (for mobile) |
| `EXPO_TOKEN` | Expo access token for EAS builds |

## Supabase Migrations in CI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```
