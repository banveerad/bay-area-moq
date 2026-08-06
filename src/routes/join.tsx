import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join the Bay Area MoQ Community" },
      {
        name: "description",
        content:
          "Get meetup announcements, join the chat, or pitch a talk or demo for an upcoming Bay Area Media Over QUIC night.",
      },
      { property: "og:title", content: "Join the Bay Area MoQ Community" },
      {
        property: "og:description",
        content:
          "Announcements, chat, and open calls for talks and demos from Bay Area MoQ engineers.",
      },
    ],
  }),
  component: JoinPage,
});

const ways = [
  {
    title: "Chat",
    body: "Day-to-day questions, relay outages, and someone always debugging certificates.",
    action: "Open the Discord",
    href: "https://discord.gg/yuW3HM8w",
  },
  {
    title: "Announcements",
    body: "One short email per meetup: date, venue, topics, RSVP link. Nothing else.",
    action: "Email the organisers",
    href: "mailto:hello@moqbayarea.dev",
  },
  {
    title: "Speak or demo",
    body: "20 minutes, or 5 minutes with something half-working on screen. Both welcome.",
    action: "Pitch a session",
    href: "mailto:talks@moqbayarea.dev",
  },
];

function JoinPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20">
      <p className="eyebrow">Get involved</p>
      <h1 className="mt-4 text-4xl leading-tight">Join us</h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        No membership, no dues. If you build encoders, players, relays, CDNs, or you are
        simply curious how live video gets faster — you are already the audience.
      </p>

      <div className="mt-12 space-y-px bg-border">
        {ways.map((w) => (
          <div
            key={w.title}
            className="flex flex-col gap-5 bg-surface p-7 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-lg">{w.title}</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">{w.body}</p>
            </div>
            <a
              href={w.href}
              className="shrink-0 border border-ember px-5 py-3 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-primary-foreground"
            >
              {w.action}
            </a>
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        Hosting space in SF, Oakland, the Peninsula or South Bay? That is the single most
        useful thing you can offer — email the organisers.
      </p>
    </div>
  );
}
