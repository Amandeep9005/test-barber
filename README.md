# Barber Ledger

A small shop ledger. Barbers log each sale from a phone or the counter tablet. The owner opens a report to see who made what.

Money is stored in cents. A day is a calendar day in the shop's time zone.

## Setup

1. Copy the example env file and fill in the real values:

```bash
cp .env.example .env.local
```

- `DATABASE_URL`: the pooled Neon connection string (`-pooler` in the host, `sslmode=require`).
- `APP_PIN`: the shared PIN for the whole app.
- `SHOP_TIMEZONE`: an IANA time zone, such as `America/Toronto`.

2. Create the tables and seed barbers and services:

```bash
npm install
npm run db:setup
```

Running `npm run db:setup` again is safe. It will not duplicate the seed rows.

3. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first visit goes to the PIN page.

## Deploy

1. Push this project to a new GitHub repository. `.env.local` is gitignored. Do not commit it.
2. In Vercel, choose **Add New → Project** and import the repository. The framework is detected automatically.
3. In **Storage**, open the existing Neon database, choose **Connect Project**, and select this project and all environments. That sets `DATABASE_URL`.
4. In **Project Settings → Environment Variables**, add `APP_PIN` and `SHOP_TIMEZONE`.
5. Optional: **Project Settings → Functions → region** `Cleveland (cle1)`, next to the Neon database in AWS US East (Ohio).
6. Redeploy. The tables already exist if `db:setup` ran against this same database.

The shared PIN is demo protection, not real authentication.
