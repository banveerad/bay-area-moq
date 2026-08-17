import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMeetupAccess } from "@/hooks/use-meetup-access";

const DISCORD_URL = "https://discord.gg/ZBNyHkkX";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.2.36-.42.84-.573 1.22a18.27 18.27 0 0 0-5.552 0A13.2 13.2 0 0 0 9.18 3a19.74 19.74 0 0 0-4.43 1.37C1.93 8.6 1.17 12.77 1.55 16.88a19.9 19.9 0 0 0 5.99 3.04c.47-.64.89-1.32 1.25-2.04-.69-.26-1.35-.58-1.97-.95.17-.12.33-.25.49-.38a14.2 14.2 0 0 0 12.38 0c.16.14.32.26.49.38-.62.37-1.29.69-1.98.95.36.72.78 1.4 1.25 2.04a19.86 19.86 0 0 0 6-3.04c.45-4.77-.77-8.9-3.13-12.51ZM8.52 14.42c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.41 2.15-2.41 1.2 0 2.17 1.09 2.15 2.41 0 1.33-.95 2.41-2.15 2.41Zm6.96 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.41 2.15-2.41 1.21 0 2.17 1.09 2.15 2.41 0 1.33-.94 2.41-2.15 2.41Z" />
    </svg>
  );
}

const links = [
  { to: "/meetups", label: "Meetups" },
  { to: "/what-is-moq", label: "What is MoQ" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;


export function SiteHeader() {
  const { isAuthenticated, loading } = useAuth();
  const { hasAccess } = useMeetupAccess();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 lg:flex lg:justify-between">
        <Link to="/" onClick={close} className="truncate font-display text-sm tracking-tight">
          <span className="text-ember">moq+more</span>
          <span className="text-muted-foreground">://</span>
          <span>bayarea</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative whitespace-nowrap px-3 py-2 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:inset-x-3 data-[status=active]:after:bottom-1 data-[status=active]:after:h-0.5 data-[status=active]:after:bg-ember"
            >
              {l.label}
            </Link>
          ))}
          {hasAccess && (
            <Link
              to="/admin"
              className="relative whitespace-nowrap px-3 py-2 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:inset-x-3 data-[status=active]:after:bottom-1 data-[status=active]:after:h-0.5 data-[status=active]:after:bg-ember"
            >
              Organiser
            </Link>
          )}
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Join our Discord"
            title="Join our Discord"
            className="ml-1 grid h-9 w-9 place-items-center text-muted-foreground transition-colors hover:text-ember"
          >
            <DiscordIcon className="h-5 w-5" />
          </a>
          {!loading &&

            (isAuthenticated ? (
              <Link
                to="/account"
                className="ml-2 whitespace-nowrap border border-border px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className: "ml-2 whitespace-nowrap border border-ember px-3 py-2 text-foreground",
                }}
              >
                Account
              </Link>
            ) : (
              <Link
                to="/auth"
                className="ml-2 whitespace-nowrap border border-ember px-3 py-2 text-ember transition-colors hover:bg-ember hover:text-background"
              >
                Sign in
              </Link>
            ))}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-10 w-10 shrink-0 place-items-center border border-border text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <nav className="border-t border-border bg-background px-5 pb-5 pt-2 text-sm lg:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={close}
              className="block border-b border-border/60 py-3 pl-3 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className:
                  "block border-b border-border/60 border-l-2 border-l-ember bg-surface py-3 pl-3 text-foreground",
              }}
            >
              {l.label}
            </Link>
          ))}
          {hasAccess && (
            <Link
              to="/admin"
              onClick={close}
              className="block border-b border-border/60 py-3 pl-3 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className:
                  "block border-b border-border/60 border-l-2 border-l-ember bg-surface py-3 pl-3 text-foreground",
              }}
            >
              Organiser
            </Link>
          )}
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className="flex items-center gap-2 border-b border-border/60 py-3 pl-3 text-muted-foreground transition-colors hover:text-foreground"
          >
            <DiscordIcon className="h-4 w-4" />
            Discord
          </a>
          {!loading &&

            (isAuthenticated ? (
              <Link
                to="/account"
                onClick={close}
                className="mt-4 block border border-border px-3 py-2 text-center text-foreground"
              >
                Account
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={close}
                className="mt-4 block border border-ember px-3 py-2 text-center text-ember"
              >
                Sign in
              </Link>
            ))}
        </nav>
      )}
    </header>
  );
}
