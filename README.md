# Temp Mail Admin Panel

Next.js admin dashboard for managing the temporary email service.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- TanStack Query
- Axios

## Installation

```bash
npm install
```

## Configuration

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Running

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

Admin panel runs at: http://localhost:3001

## Project Structure

```
src/
├── app/
│   ├── login/        # Login page
│   ├── dashboard/    # Statistics dashboard
│   ├── domains/      # Domain management
│   ├── api-keys/     # API key management
│   ├── settings/     # IMAP tester
│   └── layout.tsx    # Root layout
├── components/
│   ├── ui/           # shadcn components
│   ├── sidebar.tsx   # Navigation sidebar
│   └── admin-layout.tsx
├── lib/
│   ├── auth-context.tsx  # Auth state
│   ├── query-provider.tsx
│   ├── types.ts      # TypeScript types
│   └── utils.ts
├── services/
│   └── api.ts        # Axios client
└── middleware.ts     # Route protection
```

## Pages

| Route | Description |
|-------|-------------|
| /login | Admin authentication |
| /dashboard | Statistics overview |
| /domains | Domain CRUD management |
| /api-keys | API key generation and management |
| /settings | IMAP connection tester |

## Features

- JWT-based authentication
- Auto-logout on 401 response
- Domain CRUD with modal forms
- API key generation with copy functionality
- IMAP connection testing
- Responsive design
- Toast notifications

## Backend Requirements

This admin panel requires the backend to be running at the configured API URL.

Required backend endpoints:
- POST /admin/login
- GET /admin/stats
- GET/POST/PATCH/DELETE /admin/domains
- GET/POST/DELETE /admin/api-keys
- POST /admin/imap/test

## Default Login

- Email: admin@example.com
- Password: admin123

## License

MIT
