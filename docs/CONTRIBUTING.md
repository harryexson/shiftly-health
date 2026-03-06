# Contributing to Shiftly Health

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/shiftly-health.git
cd shiftly-health

# Install all dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local

# Start all apps in development mode
npm run dev

# Or start a specific app
npm run dev:web
npm run dev:dashboard
```

## Code Style

- **JSX** (no TypeScript) for React components
- **ES modules** (`import`/`export`)
- **Tailwind CSS** for styling
- Prefer functional components with hooks
- Follow existing patterns in the codebase

## Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks

## Pull Request Process

1. Create a branch from `develop`
2. Make your changes
3. Run linting: `npm run lint`
4. Test your changes manually
5. Submit PR against `develop`
6. Fill out the PR template
7. Request review from maintainers

## Commit Messages

Follow Conventional Commits:
```
feat: add mood streak tracking
fix: resolve login redirect loop
chore: update dependencies
docs: improve API documentation
```

## Reporting Issues

- Use GitHub Issues
- Include steps to reproduce
- Include environment info (OS, Node version, browser)
- Attach screenshots if relevant
