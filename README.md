# Modern SaaS Dashboard Starter

A production-ready SaaS dashboard template built with the latest technologies.

## Tech Stack

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [NextAuth.js (Auth.js)](https://next-auth.js.org/)
- **Rate Limiting:** [Upstash Redis](https://upstash.com/)
- **Charts:** [Recharts](https://recharts.org/)

## Features

- **Role-based Auth:** Admin and User roles with secure route protection.
- **Analytics Dashboard:** Real-time-style charts and metrics.
- **Activity Logs:** Track every user action in the database.
- **Settings Panel:** Profile management, security, and API keys.
- **API Rate Limiting:** Global middleware-based rate limiting per user.
- **Dark Mode:** Seamless theme switching.

## Getting Started

### 1. Clone the repository
```bash
git clone <repo-url>
cd saas-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/saas_db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Upstash Redis (for Rate Limiting)
UPSTASH_REDIS_REST_URL="your-url"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Stripe (Billing)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."

# Resend (Emails)
RESEND_API_KEY="re_..."
EMAIL_FROM="onboarding@resend.dev"
```

### 4. Database Setup
```bash
npx prisma db push
npx prisma db seed
```

### 5. Run the development server
```bash
npm run dev
```

## Demo Credentials

- **Admin:** `admin@example.com` / `password123`
- **User:** `user@example.com` / `password123`

## Project Structure

- `src/app`: Next.js App Router routes and layouts.
- `src/components`: UI components (Shadcn UI + Custom).
- `src/lib`: Utility functions and shared logic (Prisma, Redis, Auth).
- `src/middleware.ts`: Security, route protection, and rate limiting.
- `prisma/`: Database schema and seed data.
