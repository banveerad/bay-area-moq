# moq+more://bayarea

A community site for Bay Area video streaming engineers — Media Over QUIC (MoQ), live streaming, VOD, encoding, packaging, CDNs, ads and ad insertion.

**Live**: https://moqbayarea.com · **Discord**: https://discord.gg/ZBNyHkkX

## What the site does

- **Meetups** — upcoming and past events, each with its own shareable URL, SEO metadata and JSON-LD.
- **RSVPs & waitlist** — logged-in members RSVP; once a meetup hits capacity, further sign-ups roll into a waitlist and get promoted automatically when a spot frees up.
- **Calendar + email** — RSVP confirmation emails plus one-click add to Google, Outlook or Apple Calendar.
- **Announcements** — organisers can email a new meetup to every member who opted in to notifications.
- **Resources** — a curated, admin-editable list of MoQ and video-tech links, specs and talks.
- **Admin tools** — an organiser dashboard for meetups (create/edit/delete, move attendees between going/waitlist), members, and resources.
- **Per-event managers** — an admin can grant someone rights to manage a single meetup and nothing else.
- **Contact** — inquiry form protected by Cloudflare Turnstile that emails the organisers directly.
- **Auth** — email/password and Google sign-in, with terms acknowledgement.

## Tech stack

- **TanStack Start** (React 19, TanStack Router + Query) on Vite 7, deployed to an edge runtime
- **Tailwind CSS v4** with a semantic token design system ("charcoal & ember")
- **shadcn/ui** + Radix primitives, `lucide-react`, `sonner` for toasts
- **Supabase** (Postgres + RLS, auth, storage) via Lovable Cloud
- **React Email** templates for transactional mail, sent from `notify.moqbayarea.com`
- Server logic in `createServerFn` server functions; public webhooks under `src/routes/api/public/*`

## Project layout

```text
src/
  routes/            file-based routes (incl. _authenticated/ and admin/)
  components/        UI + site chrome (header, hero, cards)
  lib/               server functions, *.server.ts helpers, email templates
  integrations/      generated backend client and types
  data/              static content
supabase/migrations/ database schema, RLS policies, triggers
```

## Local development

Requires Node.js 20+.

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

The app runs at http://localhost:8080.

Environment variables live in `.env` and point at the hosted backend (publishable keys only — every table is protected by row-level security). To run fully independently, create your own Supabase project, apply the migrations in `supabase/migrations/`, and set:

```sh
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

Server-side secrets (email sending, Turnstile) are configured in the hosting environment and are never committed.

Useful scripts: `npm run build`, `npm run lint`, `npm run format`.

## Contributing

Issues and pull requests are welcome — bug fixes, accessibility improvements, resource additions and copy edits especially. Keep changes focused, use the existing design tokens instead of hardcoded colours, and describe what you changed and why.

## License

[MIT](./LICENSE)

---

Built and maintained with [Lovable](https://lovable.dev); changes in the editor sync to this repository.
