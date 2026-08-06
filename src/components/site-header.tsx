import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";

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
  const { isAdmin } = useIsAdmin();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="font-display text-sm tracking-tight">
          <span className="text-ember">moq</span>
          <span className="text-muted-foreground">://</span>
          <span>bayarea</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "px-3 py-2 text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <Link
                to="/admin/meetups"
                className="px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "px-3 py-2 text-foreground" }}
              >
                Manage meetups
              </Link>
              <Link
                to="/admin/members"
                className="px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "px-3 py-2 text-foreground" }}
              >
                Manage members
              </Link>
            </>
          )}
          {!loading &&
            (isAuthenticated ? (
              <Link
                to="/account"
                className="ml-2 border border-border px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "ml-2 border border-ember px-3 py-2 text-foreground" }}
              >
                Account
              </Link>
            ) : (
              <Link
                to="/auth"
                className="ml-2 border border-ember px-3 py-2 text-ember transition-colors hover:bg-ember hover:text-background"
              >
                Sign in
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
