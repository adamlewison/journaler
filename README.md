# JRNLR

A minimal, private journaling app. Write entries, organise them into journals, and keep everything locked behind a 6-digit PIN.

Live at **[jrnlr.online](https://jrnlr.online)**

---

## What it does

- Create an account with just a username and PIN — no email required
- Write journal entries with a clean, distraction-free editor
- Organise entries across multiple named journals
- Auto-locks after 5 minutes of inactivity, requiring your PIN to resume
- Works as a PWA — installable on iPhone and Android

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Turso](https://turso.tech) — SQLite database
- [Upstash Redis](https://upstash.com) — rate limiting (optional)
- [Tailwind CSS v4](https://tailwindcss.com)

---

## Running locally

### 1. Clone

```bash
git clone https://github.com/your-username/journaler.git
cd journaler
npm install
```

### 2. Set up a database

Create a free database at [turso.tech](https://turso.tech), then grab your database URL and auth token from the Turso dashboard.

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
# Turso (required)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token-here

# Session signing secret — any long random string
SESSION_SECRET=change-me-to-something-random

# Upstash Redis (optional — rate limiting is disabled if omitted)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database schema is created automatically on first login.
