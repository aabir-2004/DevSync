# <p align="center"><span style="font-family:monospace; font-weight:black; font-size:40px; color:#E8590C;">{</span> DevSync <span style="font-family:monospace; font-weight:black; font-size:40px; color:#E8590C;">}</span></p>

<p align="center">
  <strong>A premium, collaborative workspace for peer-to-peer cohort learning.</strong><br>
  Built with Next.js 15+ App Router, Tailwind CSS v4, and Supabase SSR.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Next.js%2015-orange?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Styling-Tailwind%20v4-blue?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Database-Supabase%20Postgres-green?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Security-RLS%20Enforced-red?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL Security">
</p>

---

## Overview
**DevSync** is a highly interactive community platform engineered to facilitate peer-to-peer cohort engagement, structured notes sharing, technical blogging, forum discussion boards, and progressive DSA sheet tracking. 

The application is structured inside a highly premium **3-column App Shell** with custom dark mode filters, HSL orange-accent configurations (`#E8590C`), interactive micro-animations, and full database integrations designed to run at **zero operational costs** (utilizing the Supabase Free Tier database, client-side WebSocket streams, and Vercel Hobby hosting).

---

## Feature Modules



### 1. Unified Workspace Dashboard
* **Glassmorphic Hero Welcome Deck**: Personalized greetings utilizing dynamic session checks.
* **Explore Quick Grid**: Sleek shortcut cards to resources, blogs, discussions, and sheets equipped with glowing hover transitions.
* **Urgent Announcement Banner**: Intercepts and highlights critical cohort notifications (e.g. placement deadlines, hackathons) in real time.
* **Trending Spotlight**: Automatically gathers and lists the highest upvoted notes and blogs to elevate popular community contributions.

### 2. Structured Resource Sharing
* **Metadata Taxonomy**: Group shared lectures and PDFs by category, subject, semester, and tags.
* **External Link Redirection**: Bypasses storage constraints by indexing metadata locally and linking directly to Google Drive, YouTube, or external student shares.
* **Filter Deck**: Fast searching with asynchronous type/subject filters.

### 3. Rich Text Tech Blogs
* **TipTap Content Editor**: Clean WYSIWYG editor containing styled menus, placeholders, slug generators, and status toggles (Draft vs Published).
* **Slug Redirection**: Handles custom slugs with suffix generators preventing conflicts.
* **Views & Upvotes Engine**: Tracking views dynamically and supporting community upvotes.

### 4. Interactive Discussion Forums
* **Thread Feed**: Category filters (DSA, College, Projects, Research) with pinned and locked state configurations for moderators.
* **Recursive 2-Level Comment Tree**: Renders nested comment threads dynamically by invoking recursive Common Table Expression (CTE) PostgreSQL database functions.

### 5. DSA Progression Tracker
* **Curriculum Sheets**: Grouped cleanly by standard topic taxonomies (Arrays, Trees, Graphs, DP).
* **Asynchronous Progress Checkboxes**: Instantly updates progress status (`solved`, `attempted`, `unsolved`) utilizing Supabase database upserts.
* **Visual Gauges**: Renders total circular completion rates and difficulty ratio splits (Easy, Medium, Hard).

### 6. Dynamic Panel Integrations
* **Live Sidebar**:
  - Dynamically calculates active weekly challenge progress from the database.
  - Generates top contributor leaderboards listing students sorted by their reputation points.
* **Live RightPanel**:
  - Parallel light queries fetching the latest announcements and active community metrics.
  - Dynamic Activity timeline displaying recent notes uploads, published blogs, and forum starts.

---

## Technology Stack

| Layer | Technology | Key Usage |
| --- | --- | --- |
| **Frontend** | Next.js 15.1.x (App Router) | React Server Components, cookie SSR session handling, API routing |
| **Styling** | Tailwind CSS v4.0 | Next-gen `@theme` definitions, HSL custom palette, micro-animations |
| **Database** | PostgreSQL (Supabase) | 12 core tables, composite indexes, CTE recursive query functions |
| **Realtime** | Supabase WebSockets | Staggered realtime notificationsbell alerts streams |
| **Auth** | Supabase Auth (`@supabase/ssr`) | Rigid email authentication, route protection middleware |
| **Validation** | Zod | Strictly enforced form client validations and API parsing |
| **Editor** | TipTap React StarterKit | Rich text composing panel with custom lowlights |

---

##  Project Directory Structure

```text
DEVSYNC/
├── app/                           # App Router Pages & Groups
│   ├── (auth)/                    # Centered Auth pages (Login, Signup, Verify, Forgot, Reset)
│   ├── (dashboard)/               # 3-Column dashboard layout & sub-pages
│   │   ├── admin/                 # Reports queue, user moderator console, announcements composer
│   │   ├── announcements/         # Announcements board feed
│   │   ├── blogs/                 # Listing, compose TipTap, reader view
│   │   ├── dsa/                   # Progress tracking sheets & statistics
│   │   ├── forums/                # discussion boards & recursive comment details
│   │   ├── resources/             # note uploads & listing grids
│   │   ├── search/                # Unified Debounced search
│   │   └── page.tsx               # Homepage Hub layout
│   ├── providers.tsx              # React Query client & Auth wrapper
│   └── globals.css                # Tailwind design system variables
├── components/                    # UI Component library
│   ├── auth/                      # authentication forms
│   ├── blogs/                     # TipTap editors & article cards
│   ├── forums/                    # comment trees, comment forms, discussion cards
│   ├── layout/                    # Navbar, Sidebar, RightPanel, Footer App Shell
│   ├── resources/                 # grid systems & subject upload forms
│   └── shared/                    #VoteButton, Avatar, Modal, Toast, SearchBar, Skeleton primitives
├── lib/                           # Core utilities
│   ├── supabase/                  # Server-side cookies client & browser SSR client instances
│   ├── validations/               # Zod validation schemas
│   ├── reputation.ts              # XP reputation leveling calculation helpers
│   └── slugify.ts                 # title to URL slug generators
├── supabase/                      # Database DDL & SQL migrations
└── middleware.ts                  # route protection, JWT refreshes, and admin overrides
```

---

##  Getting Started

### Prerequisites
* **Node.js** v18.18+ or v20+
* **Supabase Account** (Free tier is fully supported)

### 1. Clone & Install
```bash
git clone https://github.com/aabir-2004/DevSync.git
cd DevSync
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file at the root of the project:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anonymous-key
```

### 3. Initialize Database Migrations
Locate the SQL DDL files inside `supabase/migrations/` and run them sequentially inside the Supabase SQL editor:
1. `20260601000000_initial_schema.sql` (12 core tables & indexes)
2. `20260601000001_triggers.sql` (auto-syncing profiles & text search vectors)
3. `20260601000002_rls_policies.sql` (RLS security rules & admin bypass)
4. `20260601000003_forum_functions.sql` (recursive CTE comment tree fetch RPC)
5. `20260601000004_global_search.sql` (UNION ALL full text search RPC)

### 4. Run Locally
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Validate TypeScript builds
Make sure all types check out before deployment:
```bash
npx tsc --noEmit
```

---

##  Database & Security RLS Policies
DevSync implements **Row-Level Security (RLS)** at the database tier ensuring strict tenancy controls:
* **Profiles**: Users can edit only their own profile details. Banned users are rejected.
* **Content Sharing**: Active students can write resources and blogs. Only the content owner or an administrator can delete them.
* **Moderation Queue**: Flaggers write to `reports`. Only users holding `admin` or `moderator` roles in `public.users` can query the report feed and trigger ban actions.
