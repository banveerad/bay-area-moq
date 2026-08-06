import { createFileRoute } from "@tanstack/react-router";
import { meetups } from "@/data/community";

export const Route = createFileRoute("/meetups")({
  head: () => ({
    meta: [
      { title: "MoQ Meetups & Hack Nights in the Bay Area" },
      {
        name: "description",
        content:
          "Upcoming Media Over QUIC meetups, hack nights and deep dives in San Francisco, Oakland, Palo Alto and San Jose.",
      },
      { property: "og:title", content: "MoQ Meetups & Hack Nights in the Bay Area" },
      {
        property: "og:description",
        content:
          "Dates, venues and topics for Bay Area Media Over QUIC meetups and hack nights.",
      },
    ],
  }),
  component: MeetupsPage,
});

const statusLabel = {
  open: "RSVP open",
  waitlist: "Waitlist",
  past: "Past",
} as const;

function MeetupsPage() {
  const upcoming = meetups.filter((m) => m.status !== "past");
  const past = meetups.filter((m) => m.status === "past");

  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <p className="eyebrow">Calendar</p>
      <h1 className="mt-4 text-4xl">Meetups</h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        Evenings are half talk, half hands-on. Doors at 6, food, then two sessions and
        open hacking until the venue kicks us out.
      </p>

      <ul className="mt-12 divide-y divide-border border-y border-border">
        {upcoming.map((m) => (
          <li key={m.id} className="grid gap-4 py-8 md:grid-cols-[210px_1fr_120px]">
            <div className="font-display text-sm">
              <p className="text-ember">{m.date}</p>
              <p className="mt-1 text-muted-foreground">{m.time}</p>
            </div>
            <div>
              <h2 className="text-lg leading-snug">{m.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{m.summary}</p>
              <p className="mt-4 font-display text-xs text-muted-foreground">
                {m.venue} — {m.city}
              </p>
            </div>
            <p className="font-display text-xs tracking-widest uppercase md:text-right">
              <span className={m.status === "open" ? "text-ember" : "text-muted-foreground"}>
                {statusLabel[m.status]}
              </span>
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mt-16 text-2xl">Already happened</h2>
      <ul className="mt-6 space-y-4">
        {past.map((m) => (
          <li key={m.id} className="border border-border bg-surface p-6">
            <p className="font-display text-xs tracking-widest text-muted-foreground uppercase">
              {m.date} · {m.city}
            </p>
            <h3 className="mt-3 text-base">{m.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{m.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
