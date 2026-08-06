import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ResourceRow } from "@/lib/resources";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "MoQ Resources — Specs, Open Source & Talks" },
      {
        name: "description",
        content:
          "Curated Media Over QUIC resources: IETF drafts, WebTransport, moq-rs and relay tooling, plus talks worth watching before the next meetup.",
      },
      { property: "og:title", content: "MoQ Resources — Specs, Open Source & Talks" },
      {
        property: "og:description",
        content: "Drafts, repos and talks the Bay Area MoQ community actually uses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ResourceRow[];
    },
  });

  const groups: { section: string; items: ResourceRow[] }[] = [];
  for (const item of data ?? []) {
    const existing = groups.find((g) => g.section === item.section);
    if (existing) existing.items.push(item);
    else groups.push({ section: item.section, items: [item] });
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-20">
      <p className="eyebrow">Reading list</p>
      <h1 className="mt-4 text-4xl">Resources</h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        Everything below is what people at the meetups actually open. Skim the drafts,
        clone a relay, show up with questions.
      </p>

      {isLoading ? (
        <p className="mt-12 text-muted-foreground">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="mt-12 border border-border bg-surface p-10 text-center">
          <h2 className="font-display text-lg tracking-tight">Reading list coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We're curating the drafts, repos and talks worth your time. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="mt-12 space-y-12">
          {groups.map((group) => (
            <section key={group.section}>
              <h2 className="border-b border-border pb-4 text-xl">{group.section}</h2>
              <ul className="mt-5 space-y-px bg-border">
                {group.items.map((item) => (
                  <li key={item.id} className="bg-surface">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start justify-between gap-6 p-6 transition-colors hover:bg-surface-raised"
                    >
                      <span>
                        <span className="font-display text-sm group-hover:text-ember">
                          {item.label}
                        </span>
                        {item.note ? (
                          <span className="mt-2 block text-sm text-muted-foreground">
                            {item.note}
                          </span>
                        ) : null}
                      </span>
                      <span aria-hidden className="font-display text-ember">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
