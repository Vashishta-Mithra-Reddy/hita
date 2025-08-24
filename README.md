# Hita

Hita is a knowledge platform focused on well-being and healthy living. It curates and presents information across:

- Foods (nutritional info, benefits, dietary badges, seasonal/region availability)
- Products (brands, categories, links, offline availability, features, tags)
- Brands (overview and associated products)
- Remedies (ingredients, preparation, usage, symptoms treated)
- Supplementation guides
- Wellness tips

It is built with Next.js (App Router), React, Tailwind CSS, Supabase (Postgres + Auth + Storage), TypeScript, and OpenAI for vector embeddings.

## Features

- Modern App Router-based Next.js app with responsive, accessible UI
- Consistent layout across Foods, Products, Brands, Remedies, and Wellness Tips pages
- Skeleton loading components for smooth perceived performance
- Supabase-backed data layer with typed query helpers
- Embeddings population script to create vector search data
- Theming and dark mode support

## Tech Stack

- Framework: Next.js (App Router), React
- UI: Tailwind CSS, Radix UI
- Data: Supabase (Postgres, Auth, Storage)
- Language: TypeScript
- Vector embeddings: OpenAI (text-embedding-3-small)

## Project Structure

- <mcfile name="app" path="c:\Vashishta\hita\app\"></mcfile>
  - Foods: <mcfile name="foods" path="c:\Vashishta\hita\app\foods\"></mcfile>
  - Products: <mcfile name="products" path="c:\Vashishta\hita\app\products\"></mcfile>
  - Brands: <mcfile name="brands" path="c:\Vashishta\hita\app\brands\"></mcfile>
  - Remedies: <mcfile name="remedies" path="c:\Vashishta\hita\app\remedies\"></mcfile>
  - Wellness Tips: <mcfile name="wellness-tips" path="c:\Vashishta\hita\app\wellness-tips\"></mcfile>
  - Auth: <mcfile name="auth" path="c:\Vashishta\hita\app\auth\"></mcfile>
  - Root layout/page: <mcfile name="layout.tsx" path="c:\Vashishta\hita\app\layout.tsx"></mcfile>, <mcfile name="page.tsx" path="c:\Vashishta\hita\app\page.tsx"></mcfile>
- <mcfile name="components" path="c:\Vashishta\hita\components\"></mcfile>
  - Cards: FoodCard, ProductCard, RemedyCard
  - Skeletons: <mcfile name="skeletons" path="c:\Vashishta\hita\components\skeletons\"></mcfile>
  - UI primitives and shared components
- <mcfile name="lib/supabase" path="c:\Vashishta\hita\lib\supabase\"></mcfile>
  - Client setup: <mcfile name="client.ts" path="c:\Vashishta\hita\lib\supabase\client.ts"></mcfile>, <mcfile name="server.ts" path="c:\Vashishta\hita\lib\supabase\server.ts"></mcfile>
  - Domain helpers: <mcfile name="products.ts" path="c:\Vashishta\hita\lib\supabase\products.ts"></mcfile>, <mcfile name="foods.ts" path="c:\Vashishta\hita\lib\supabase\foods.ts"></mcfile>, <mcfile name="wellness.ts" path="c:\Vashishta\hita\lib\supabase\wellness.ts"></mcfile>
- Scripts: <mcfile name="populate.ts" path="c:\Vashishta\hita\scripts\populate.ts"></mcfile> (embeddings)
- Database schema SQL: <mcfile name="schema.sql" path="c:\Vashishta\hita\supabase\schema.sql"></mcfile>
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

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used for the app’s Supabase client on both server and browser contexts via <mcfile name="client.ts" path="c:\Vashishta\hita\lib\supabase\client.ts"></mcfile> and <mcfile name="server.ts" path="c:\Vashishta\hita\lib\supabase\server.ts"></mcfile>.
- `SUPABASE_SERVICE_ROLE_KEY` is required by the embeddings script to perform admin operations.
- `OPENAI_API_KEY` is required by the embeddings script to create vector embeddings.

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

The app uses Supabase Postgres tables for content such as categories, brands, products, foods, remedies, supplementation guides, wellness tips, and embeddings. See <mcfile name="schema.sql" path="c:\Vashishta\hita\supabase\schema.sql"></mcfile> for the canonical database structure.

Typed query helpers:

- Products: <mcfile name="products.ts" path="c:\Vashishta\hita\lib\supabase\products.ts"></mcfile>
  - Includes nested joins with `brand:brands(*)`, `category:categories(*)`, `product_links(*)`, and `offline_availability(*)`.
- Foods: <mcfile name="foods.ts" path="c:\Vashishta\hita\lib\supabase\foods.ts"></mcfile>
  - Includes helpers to safely extract nested data (vitamins, minerals, seasons, regions).
- Wellness Tips: <mcfile name="wellness.ts" path="c:\Vashishta\hita\lib\supabase\wellness.ts"></mcfile>

## Pages Overview

- Foods: browse and detail pages with bento-style sections (nutritional info, badges, benefits, availability)
- Products: browse and detail pages, brand/category info, links, and offline availability
- Brands: index and detail pages, including associated products
- Remedies: index and detail pages (ingredients, preparation, usage)
- Wellness Tips: list and filter by category
- Auth: sign up, login, password actions

Skeleton components under <mcfile name="skeletons" path="c:\Vashishta\hita\components\skeletons\"></mcfile> provide consistent loading placeholders across pages.

## Embeddings Population

The script at <mcfile name="populate.ts" path="c:\Vashishta\hita\scripts\populate.ts"></mcfile> generates aggregated content for:

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

- Next.js config: <mcfile name="next.config.ts" path="c:\Vashishta\hita\next.config.ts"></mcfile> (remote image host)
- Tailwind configuration: <mcfile name="tailwind.config.ts" path="c:\Vashishta\hita\tailwind.config.ts"></mcfile>
- ESLint config: <mcfile name="eslint.config.mjs" path="c:\Vashishta\hita\eslint.config.mjs"></mcfile>
- TypeScript config: <mcfile name="tsconfig.json" path="c:\Vashishta\hita\tsconfig.json"></mcfile>

## Deployment

- Provide the required environment variables in your hosting platform
- Build the app (`npm run build`) and start it (`npm start`)
- Ensure Supabase network access and keys are configured

## Contributing

- Open issues and PRs are welcome
- Please follow the existing code style and run `npm run lint` before submitting

## License

This project is provided as-is for educational purposes. If you intend to use it in production, review licensing for dependencies and services (Supabase, OpenAI, etc.), and add your preferred license here.
