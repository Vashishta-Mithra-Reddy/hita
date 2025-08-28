# Hita

Hita is an AI-powered knowledge platform focused on well-being and healthy living. It curates and presents information across:

- Foods (nutritional info, benefits, dietary badges, seasonal/region availability)
- Products (brands, categories, links, offline availability, features, tags)
- Brands (overview and associated products)
- Remedies (ingredients, preparation, usage, symptoms treated)
- Supplementation guides
- Wellness tips
- AI Agent (intelligent search and recommendations)
- Health Issues (browse content by specific health concerns)
- User Submissions (community-contributed content)

It is built with Next.js (App Router), React, Tailwind CSS, Supabase (Postgres + Auth + Storage), TypeScript, OpenAI for vector embeddings, and Google GenAI for enhanced AI capabilities.

## Features

- Modern App Router-based Next.js app with responsive, accessible UI
- AI-powered search agent with semantic search capabilities
- Consistent layout across Foods, Products, Brands, Remedies, and Wellness Tips pages
- Health issues browsing for targeted content discovery
- User content submission system with authentication
- Skeleton loading components for smooth perceived performance
- Supabase-backed data layer with typed query helpers
- Embeddings population script to create vector search data
- Complete authentication flow with password reset and email confirmation
- Enhanced UI with animations, modals, and responsive navigation
- Theming and dark mode support
- 3D graphics and interactive elements

## Tech Stack

- Framework: Next.js (App Router), React
- UI: Tailwind CSS, Radix UI, Framer Motion
- 3D Graphics: Three.js, React Three Fiber
- Data: Supabase (Postgres, Auth, Storage)
- Language: TypeScript
- AI: OpenAI (text-embedding-3-small), Google GenAI
- Web Scraping: Puppeteer
- Animations: Framer Motion, React Spring
- Theming: next-themes

## Project Structure

- `app/`
  - Foods: `app/foods/`
  - Products: `app/products/`
  - Brands: `app/brands/`
  - Remedies: `app/remedies/`
  - Wellness Tips: `app/wellness-tips/`
  - Auth: `app/auth/`
  - Agent: `app/agent/` (AI search and recommendations)
  - Issues: `app/issues/` (browse by health concerns)
  - Submit: `app/submit/` (user content submission)
  - API: `app/api/agent/search/` (search API endpoint)
  - Root layout/page: `app/layout.tsx`, `app/page.tsx`
- `components/`
  - Cards: FoodCard, ProductCard, RemedyCard, WellnessTipCard, BrandCard
  - Skeletons: `components/skeletons/`
  - UI primitives: `components/ui/`
  - Blocks: `components/blocks/` (header, footer, navigation)
  - Animations: `components/animations/` (FadeInWhenVisible, InViewWrapper)
  - Auth components: login-form, sign-up-form, forgot-password-form, update-password-form
  - Interactive components: modal, pagination-controls, theme-switcher
- `lib/supabase/`
  - Client setup: `lib/supabase/client.ts`, `lib/supabase/server.ts`
  - Domain helpers: `lib/supabase/products.ts`, `lib/supabase/foods.ts`, `lib/supabase/wellness.ts`, `lib/supabase/remedies.ts`
  - Middleware: `lib/supabase/middleware.ts`
- `lib/`
  - Utilities: `lib/utils.ts`
  - Reddit integration: `lib/reddit.ts`
- Scripts: `scripts/populate.ts` (embeddings)
- Database schema SQL: `supabase/schema.sql`
- Config: Tailwind, ESLint, Next, TSConfig

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- A Supabase project with Postgres enabled

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file at the project root:

```plaintext
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

OPENAI_API_KEY=your_openai_api_key
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used for the app's Supabase client on both server and browser contexts via `lib/supabase/client.ts` and `lib/supabase/server.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` is required by the embeddings script to perform admin operations.
- `OPENAI_API_KEY` is required by the embeddings script to create vector embeddings.
- Additional API keys may be required for Google GenAI integration.

### Run the development server

```bash
npm run dev
```

Open the local URL printed in your terminal to view the app.

### Lint

```bash
npm run lint
```

### Build for production

```bash
npm run build
```

### Start the production server

```bash
npm start
```

## Data Layer

The app uses Supabase Postgres tables for content such as categories, brands, products, foods, remedies, supplementation guides, wellness tips, and embeddings. See `supabase/schema.sql` for the canonical database structure.

Typed query helpers:

- Products: `lib/supabase/products.ts`
  - Includes nested joins with `brand:brands(*)`, `category:categories(*)`, `product_links(*)`, and `offline_availability(*)`.
- Foods: `lib/supabase/foods.ts`
  - Includes helpers to safely extract nested data (vitamins, minerals, seasons, regions).
- Remedies: `lib/supabase/remedies.ts`
  - Includes helpers for remedy categories, ingredients, and preparation methods.
- Wellness Tips: `lib/supabase/wellness.ts`

## Pages Overview

- Foods: browse and detail pages with bento-style sections (nutritional info, badges, benefits, availability)
- Products: browse and detail pages, brand/category info, links, and offline availability
- Brands: index and detail pages, including associated products
- Remedies: index and detail pages (ingredients, preparation, usage)
- Wellness Tips: list and filter by category
- Agent: AI-powered search interface with semantic search capabilities
- Issues: browse content organized by specific health concerns
- Submit: authenticated content submission system for user contributions
- Auth: complete authentication flow (sign up, login, password reset, email confirmation, password update)

Skeleton components under `components/skeletons/` provide consistent loading placeholders across pages.

## Embeddings Population

The script at `scripts/populate.ts` generates aggregated content for:

- Products, Foods, Remedies, Supplementation Guides, Wellness Tips

It creates OpenAI embeddings (text-embedding-3-small) and inserts them into an `embeddings` table with a `vector(1536)` column.

Before running:

1. Ensure your `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENAI_API_KEY`.

2. The script attempts to ensure the `embeddings` table exists via a Postgres RPC called `exec_sql`. If that RPC isn’t available in your project, the script will print the SQL for you to run manually. You can create the table by running this SQL in the Supabase SQL editor:

```plaintext
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS embeddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  embedding vector(1536),
  content_type text NOT NULL,
  source_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS embeddings_content_type_idx ON embeddings(content_type);
CREATE INDEX IF NOT EXISTS embeddings_source_id_idx ON embeddings(source_id);
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

Run the script (without installing additional dev dependencies) using `npx`:

```bash
npx ts-node scripts\populate.ts
```

Alternatively, you can add a dev tool like `ts-node` or `tsx` and run it accordingly.

The script will:

- Load all relevant content (active records only)
- Generate aggregated text for each record
- Create embeddings with retry/backoff
- Insert embeddings in batches for efficiency

## Configuration

- Next.js config: `next.config.ts` (remote image host)
- Tailwind configuration: `tailwind.config.ts`
- ESLint config: `eslint.config.mjs`
- TypeScript config: `tsconfig.json`

## API Routes

- Search API: `app/api/agent/search/route.ts`
  - Provides semantic search capabilities using vector embeddings
  - Supports filtering by content type (products, foods, remedies, etc.)
  - Returns relevant results with metadata and similarity scores

## UI Components & Animations

The app includes enhanced UI components for better user experience:

- **Layout Components**: `components/blocks/`
  - Header with navigation and theme switching
  - Footer with site information
  - Bottom navigation for mobile
  - Responsive navigation components

- **Animation Components**: `components/animations/`
  - FadeInWhenVisible: Smooth fade-in animations for elements entering viewport
  - InViewWrapper: Intersection observer utilities for scroll-based animations

- **Interactive Components**:
  - Modal system for overlays
  - Pagination controls for content browsing
  - Theme switcher with dark/light mode support
  - Loading screens and skeleton components

- **3D Graphics**: Integration with Three.js for interactive visual elements

## Deployment

- Provide the required environment variables in your hosting platform
- Build the app (`npm run build`) and start it (`npm start`)
- Ensure Supabase network access and keys are configured

## Contributing

- Open issues and PRs are welcome
- Please follow the existing code style and run `npm run lint` before submitting

## License

This project is provided as-is for educational purposes. If you intend to use it in production, review licensing for dependencies and services (Supabase, OpenAI, etc.), and add your preferred license here.
