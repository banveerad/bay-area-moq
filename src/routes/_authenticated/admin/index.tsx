import { createFileRoute, Link } from "@tanstack/react-router";
import { useMeetupAccess } from "@/hooks/use-meetup-access";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Organiser Tools — Bay Area MoQ" },
      {
        name: "description",
        content: "Organiser dashboard for managing Bay Area MoQ meetups and members.",
      },
      { property: "og:title", content: "Organiser Tools — Bay Area MoQ" },
      {
        property: "og:description",
        content: "Manage meetups, RSVPs and member profiles for the Bay Area MoQ community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminHomePage,
});

const tools = [
  {
    to: "/admin/meetups",
    label: "Manage meetups",
    description: "Create, edit and delete events; handle RSVPs, capacity and the waitlist.",
  },
  {
    to: "/admin/members",
    label: "Manage members",
    description: "Search members, view profiles and RSVP history, grant organiser access.",
  },
  {
    to: "/admin/resources",
    label: "Manage resources",
    description: "Curate the specs, repos and talks listed on the public Resources page.",
  },
] as const;


function AdminHomePage() {
  const { isAdmin, hasAccess, loading } = useMeetupAccess();

  if (loading) {
    return <p className="mx-auto max-w-3xl px-5 py-20 text-muted-foreground">Checking access…</p>;
  }

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-3xl">Page not found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="font-display text-xs uppercase tracking-widest text-ember">Organiser tools</p>
      <h1 className="mt-3 font-display text-3xl tracking-tight">Admin</h1>
      <p className="mt-3 text-muted-foreground">
        {isAdmin
          ? "Everything organisers need to run Bay Area MoQ."
          : "You manage specific events. Only those meetups appear in your tools."}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {tools.filter((tool) => isAdmin || tool.to === "/admin/meetups").map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="border border-border bg-card p-6 transition-colors hover:border-ember"
          >
            <h2 className="font-display text-lg tracking-tight">{tool.label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
            <span className="mt-4 inline-block text-sm text-ember">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
