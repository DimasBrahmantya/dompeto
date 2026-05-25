@AGENTS.md
# 💰 Daily Financial Records Website — Full Prompt & Setup Guide

---

## ✅ PROMPT (Copy & Paste to AI or Use as Dev Spec)

> Build a **Daily Financial Records Web App** using **Next.js 14 (App Router)** and **Supabase** as the backend database. The app is designed for personal daily expense tracking with the following complete feature set:

---

### 🧩 CORE FEATURES

#### 1. Transaction Input Form
- Input fields:
  - **Date** (default: today)
  - **Description / Notes** (what was spent on)
  - **Category** (dropdown: Food & Drink, Transport, Shopping, Bills & Utilities, Health, Entertainment, Education, Other)
  - **Nominal / Amount** (currency formatted, IDR / Rupiah by default)
  - **Payment Method**: toggle between `Cash` and `Debit`
  - **Type**: toggle between `Expense` and `Income`
- Submit button with validation
- Success/error toast notifications

#### 2. Daily Transaction List
- Show all transactions for the selected date
- Each entry displays: time, category icon, description, payment method badge (Cash / Debit), and amount
- Color-coded: green for income, red for expense
- Edit and delete functionality per row
- Daily total summary at the bottom of the list

#### 3. Weekly Summary
- Auto-calculated: total expenses and income for the current week (Mon–Sun)
- Breakdown by day (bar mini-chart or table)
- Net balance for the week

#### 4. Monthly Summary
- Total income, total expense, and net savings for the current month
- Breakdown by category (pie chart or donut chart)
- Progress bar for each category showing % of total spending

#### 5. Monthly Comparison Chart
- Bar chart comparing **total expenditure per month** for the last 12 months
- Toggle between viewing: All / Expense Only / Income Only
- Highlight current month

#### 6. Largest Expenditure Panel
- Show the **top 5 biggest single expenses** (all time or filterable by month)
- Display: rank, description, category, amount, date, payment method

#### 7. Dashboard Overview (Home Page)
- Quick stats cards: Today's Total Spend, This Week, This Month, Balance
- Recent transactions list (last 10)
- Quick-add floating button (FAB)

#### 8. Filters & Search
- Filter by: date range, category, payment method, type (income/expense)
- Search by description keyword
- Export transactions to CSV

---

### 🗃️ SUPABASE DATABASE SCHEMA

Create the following tables in Supabase:

```sql
-- Table: transactions
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  description text not null,
  category text not null,
  amount numeric(15, 2) not null,
  payment_method text check (payment_method in ('cash', 'debit')) not null,
  type text check (type in ('income', 'expense')) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table transactions enable row level security;

-- Policy: Users can only see their own data
create policy "Users can manage their own transactions"
  on transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for faster queries
create index idx_transactions_date on transactions(date);
create index idx_transactions_user_id on transactions(user_id);
```

---

### 🎨 DESIGN STYLE

- **Theme**: Dark mode financial dashboard — deep navy/charcoal backgrounds, crisp white text, emerald green for income, rose red for expense
- **Font**: `Sora` for headings, `JetBrains Mono` for numbers/amounts, `Inter` for body
- **Charts**: Use `Recharts` or `Chart.js` via `react-chartjs-2`
- **UI Components**: Use `shadcn/ui` for base components (cards, buttons, inputs, dialogs)
- **Icons**: `lucide-react`
- **Animations**: Smooth page transitions, number count-up on dashboard stats
- **Currency format**: Indonesian Rupiah (IDR), formatted as `Rp 1.250.000`
- **Responsive**: Mobile-first design, works perfectly on phone (bottom nav) and desktop (sidebar nav)

---

### 🔐 AUTHENTICATION

- Supabase Auth with Email + Password login
- Protected routes using Next.js middleware
- Session persistence via Supabase cookies

---

### 📁 PROJECT STRUCTURE

```
/app
  /dashboard         → Home overview
  /transactions      → Full transaction list + filters
  /add               → Add new transaction
  /analytics         → Charts & monthly comparison
  /top-expenses      → Largest expenditures
  /settings          → Profile, currency, preferences
/components
  /ui                → shadcn components
  /charts            → Chart components
  /forms             → Transaction form
  /layout            → Sidebar, Navbar, FAB
/lib
  supabase.ts        → Supabase client
  utils.ts           → Currency formatting, date helpers
/hooks
  useTransactions.ts → Data fetching hooks
  useAnalytics.ts    → Aggregation hooks
```

---

### 📦 TECH STACK SUMMARY

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Charts | Recharts |
| Icons | lucide-react |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| State | React hooks + Server Actions |
| Deployment | Vercel |

---

---

## 🚀 STEP-BY-STEP SETUP GUIDE

---

### STEP 1 — Prerequisites

Make sure you have these installed:
- **Node.js** v18+ → https://nodejs.org
- **npm** or **pnpm** (recommended)
- **Git** → https://git-scm.com
- A **Supabase account** → https://supabase.com (free tier is enough)
- A **Vercel account** → https://vercel.com (for deployment, optional)

---

### STEP 2 — Create the Next.js Project

Open your terminal and run:

```bash
npx create-next-app@latest daily-finance --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd daily-finance
```

---

### STEP 3 — Install Dependencies

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui setup
npx shadcn@latest init

# Install shadcn components you need
npx shadcn@latest add button card input label select dialog toast badge tabs

# Charts
npm install recharts

# Icons
npm install lucide-react

# Date utilities
npm install date-fns

# Number formatting
npm install numeral
npm install --save-dev @types/numeral
```

---

### STEP 4 — Create a Supabase Project

1. Go to → https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `daily-finance`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you (e.g., Southeast Asia)
4. Click **"Create new project"** — wait ~2 minutes

---

### STEP 5 — Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Paste and run this SQL:

```sql
-- Create transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  description text not null,
  category text not null,
  amount numeric(15, 2) not null,
  payment_method text check (payment_method in ('cash', 'debit')) not null,
  type text check (type in ('income', 'expense')) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table transactions enable row level security;

-- Create policy
create policy "Users can manage their own transactions"
  on transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index idx_transactions_date on transactions(date);
create index idx_transactions_user_id on transactions(user_id);
```

4. Click **"Run"** ✅

---

### STEP 6 — Get Your Supabase API Keys

1. In Supabase dashboard → **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xyzxyz.supabase.co`)
   - **anon public key** (long string)

---

### STEP 7 — Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
touch .env.local
```

Add these lines (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Add `.env.local` to `.gitignore` (it should be there by default).

---

### STEP 8 — Set Up Supabase Client

Create `/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

---

### STEP 9 — Set Up Auth Middleware

Create `/middleware.ts` in the project root:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

### STEP 10 — Build the App

Now use the **PROMPT** from the top of this document and feed it to:
- **Claude** (claude.ai) — ask it to generate each page/component one by one
- **Cursor** or **VS Code with Copilot** — paste the prompt and generate

Recommended build order:
1. `/lib/utils.ts` — currency formatting helpers
2. `/app/login` & `/app/register` — auth pages
3. `/components/layout` — sidebar + navbar
4. `/app/dashboard` — home overview
5. `/components/forms/TransactionForm.tsx` — add/edit form
6. `/app/transactions` — list with filters
7. `/app/analytics` — charts page
8. `/app/top-expenses` — biggest expenses

---

### STEP 11 — Run Locally

```bash
npm run dev
```

Open → http://localhost:3000

Register an account, start adding transactions! 🎉

---

### STEP 12 — Deploy to Vercel (Optional)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, then add environment variables:
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables
# Add: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Or connect your GitHub repo directly at https://vercel.com/new for automatic deployments.

---

## 🧠 BONUS TIPS

- **Supabase Auth Email**: Enable Email confirmations in Supabase → Authentication → Providers → Email
- **Currency**: All amounts stored as raw numbers; format on the frontend using `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`
- **Offline support**: Add `localStorage` caching for recent entries in case of connection issues
- **PWA**: Add a `manifest.json` and service worker to make it installable on mobile

---

*Generated for: Daily Financial Records Web App | Stack: Next.js 14 + Supabase | Last updated: April 2026*