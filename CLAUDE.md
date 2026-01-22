# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Genshin Codex Web is a Next.js 16 web application built with TypeScript and React 19 for the Genshin Impact community.

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

- **Framework**: Next.js 16 with App Router (`src/app/`)
- **Styling**: Tailwind CSS v4
- **Path Alias**: `@/*` maps to `./src/*`

### Centralized Modules

- `src/lib/apiClient.ts` - All API calls must go through this module
- `src/lib/session.ts` - Session and token management logic

## API Conventions

### Pagination Response Format
```typescript
{ items: T[], total: number, page: number, pageSize: number }
```

### HTTP Error Codes
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (ownership violation)
- 404: Not found
- 409: Conflict

### Ownership Validation
All routes containing `accountId` must validate account ownership on the server.

## UI Requirements

- Always implement loading states for async operations
- Always implement error states with user feedback
- Use `NEXT_PUBLIC_API_BASE_URL` environment variable for API base URL (never hardcode)
