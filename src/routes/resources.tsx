import { createFileRoute } from "@tanstack/react-router";
import { resources } from "@/data/community";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "MoQ Resources — Specs, Open Source & Talks" },
      {
        name: "description",
        content:
          "Curated Media Over QUIC resources: IETF drafts, WebTransport, moq-rs and moq-js repos, plus talks worth watching before the next meetup.",
      },
      { property: "og:title", content: "MoQ Resources — Specs, Open Source & Talks" },
      {
        property: "og:description",
        content:
          "Drafts, repos and talks the Bay Area MoQ community actually uses.",
      },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20">
      <p className="eyebrow">Reading list</p>
      <h1 className="mt-4 text-4xl">Resources</h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        Everything below is what people at the meetups actually open. Skim the drafts,
        clone a relay, show up with questions.
      </p>

      <div className="mt-12 space-y-12">
        {resources.map((group) => (
          <section key={group.group}>
            <h2 className="border-b border-border pb-4 text-xl">{group.group}</h2>
            <ul className="mt-5 space-y-px bg-border">
              {group.items.map((item) => (
                <li key={item.href} className="bg-surface">
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
                      <span className="mt-2 block text-sm text-muted-foreground">
                        {item.note}
                      </span>
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
    </div>
  );
}
