# Agent Guidelines

## Build Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm start` - Start production server

## Code Style

- Use TypeScript with strict mode enabled
- Import React components with: `import * as React from "react"`
- Use `@/*` path aliases for internal imports
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling with `cn()` utility
- Components use PascalCase, files use kebab-case
- Context providers end with `Provider` suffix
- Custom hooks start with `use`
- Error boundaries for async operations
- Prefer interfaces over types for public APIs

## API Reference

- When needing to make API calls from the web client, refer to `routers/api/v1/` for the available endpoints
- Each subdirectory contains different API categories (repo, org, user, admin, misc, etc.)
