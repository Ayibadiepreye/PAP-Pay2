# PAP Pay

A mobile-first event ticketing payment portal for WIGWE PAP 2025. Attendees pay for tickets (₦600/person), upload proof, select attendees from a list, and receive a unique ticket ID. Admins can verify payments and mark document delivery.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/pap-pay run dev` — run the frontend (port 23740)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Neon PostgreSQL connection string (already set as secret)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Wouter routing, next-themes
- API: Express 5, cookie-based admin sessions
- DB: PostgreSQL (Neon) + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- PDF export: jsPDF

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/index.ts` — DB schema (people, payments, tickets tables)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/pap-pay/src/` — React frontend
- Uploads stored in `artifacts/api-server/uploads/` (served at `/api/uploads/`)

## Architecture decisions

- Admin sessions stored in-memory (Map) with 24h TTL — no DB needed for auth
- File uploads via multer to local disk; served statically via `/api/uploads/:filename`
- All 67 attendees seeded at startup; `is_paid` and `ticket_code` updated on payment
- One ticket covers all people in a single payment submission
- Admin dashboard at `/dashboard-shadow` (not linked from main page)

## Product

- Main page: account details with copy button, ticket calculator (₦600/person), "I've already paid" flow
- Payment flow: proof upload, sender name, people selection from 67-person list, PDF ticket on success
- Admin dashboard: stats overview, payment verification, ticket delivery tracking, people status
- WhatsApp admin contact buttons for inquiries

## Admin Access

- URL: `/dashboard-shadow`
- Username: `Shadow`
- Password: `Shadow2008`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `jspdf` must be in `artifacts/pap-pay/package.json` devDependencies (not workspace catalog)
- Multer for file upload is NOT in the OpenAPI spec (handled manually in `/api/upload/proof`)
- DB `amount_paid` is stored as `numeric` → always convert to `Number()` before sending to client
- Admin cookie uses `sameSite: "lax"` — works in both dev and prod
- Always run `pnpm run typecheck:libs` after changing `lib/db/src/schema/index.ts`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
