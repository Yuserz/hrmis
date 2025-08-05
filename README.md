# HRMIS

A modern HR Management Information System built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), [shadcn/ui](https://ui.shadcn.com), [Zustand](https://zustand-demo.pmnd.rs/), and [TypeScript](https://www.typescriptlang.org/). Uses the Next.js App Directory structure.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Directory)
- **Database & Auth:** [Supabase](https://supabase.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** [pnpm](https://pnpm.io/)

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Project Structure

This project uses the Next.js App Directory structure:

```
/app         # Application routes and pages
/components  # Reusable UI components
/lib         # Utilities and helpers
/store       # Zustand stores
/types       # TypeScript types
```

## Environment Variables

Create a `.env.local` file in the root and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Useful Scripts

- `pnpm dev` – Start the development server
- `pnpm build` – Build for production
- `pnpm start` – Start the production server
- `pnpm lint` – Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## Deployment

The easiest way to deploy your Next.js app is with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)