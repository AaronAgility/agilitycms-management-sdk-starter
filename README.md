# Management SDK Starter

A starter project for working with the AgilityCMS Management SDK in a modern monorepo setup.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (v9 or higher recommended)
- [TurboRepo](https://turbo.build/) (installed as a dev dependency)

## Getting Started

### 1. Install pnpm

If you don't have pnpm installed globally, run:

```bash
npm install -g pnpm
```

### 2. Clone Required Dependencies

⚠️ **Important**: You need to download the [auth tools repository](https://github.com/agilitycms/auth-tools) and place it in the same root directory as this repository for the authentication flow to work properly.

Your directory structure should look like:
```
your-projects-folder/
├── agilitycms-management-sdk-starter/  (this repo)
└── auth-tools/                         (auth tools repo)
```

### 3. Install Dependencies

Install all packages across the monorepo:

```bash
pnpm i
```

### 4. Start Development

Run the development servers for all apps:

```bash
turbo dev
```

This will start:
- Web app at `http://localhost:3000`
- Documentation at `http://localhost:3001`

## Project Structure

This is a monorepo containing:
- `apps/web` - Main web application
- `apps/docs` - Documentation site
- `packages/ui` - Shared UI components
- `packages/eslint-config` - Shared ESLint configuration
- `packages/typescript-config` - Shared TypeScript configuration