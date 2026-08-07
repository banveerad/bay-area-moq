import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMeetupAccess } from "@/hooks/use-meetup-access";

const links = [
  { to: "/meetups", label: "Meetups" },
  { to: "/what-is-moq", label: "What is MoQ" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/join", label: "Join" },
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
