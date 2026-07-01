# Southeast Landmark Ltd — Public Website

Production-ready marketing website for Southeast Landmark Ltd, a Dhaka-based real estate company.

> Building Landmarks You Can Call Home.

## Tech Stack

- Framework: TanStack Start v1 (React 19, SSR)
- Build tool: Vite 7
- Routing: TanStack Router (file-based)
- Styling: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- Data: TanStack Query
- Language: TypeScript (strict)
- Tooling: ESLint, Prettier, Bun
- Target runtime: Cloudflare Workers (via Nitro)

## Project Structure

```
src/
  admin/         # Reserved for future admin panel
  assets/        # Images, logos, static brand assets
  components/
    site/        # Header, Footer, SiteLayout, PageHero
    ui/          # shadcn/ui primitives
  config/        # Site-wide configuration
  hooks/         # Reusable React hooks
  lib/           # Utilities, error handling, SW registration
  pages/         # Page components
  routes/        # TanStack Router file-based routes
  services/      # API/data services
  utils/         # Pure helpers
  styles.css     # Tailwind v4 entry + design tokens
```

## Requirements

- Bun 1.1+ (or Node.js 20+ with npm)

## Installation

```bash
bun install
```

## Development

```bash
bun run dev
```

Dev server runs on http://localhost:8080 with HMR.

## Production Build

```bash
bun run build
```

Outputs the client bundle to `dist/client/` and the SSR/Worker bundle to `dist/server/`. Preview locally with `bunx vite preview`.

## Deployment

Targets Cloudflare Workers via Nitro. After building:

```bash
npx nitro deploy --prebuilt
```

Static assets in `dist/client/` can be served from any CDN.

## Environment Variables

No secrets required for the public website. Place any future values in `.env` (git-ignored); browser-safe values must use the `VITE_` prefix.

## Scripts

- `bun run dev` — Start dev server
- `bun run build` — Production build
- `bun run lint` — Run ESLint

## License

(c) Southeast Landmark Ltd. All rights reserved.
