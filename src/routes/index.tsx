import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@/assets/hero-moq.jpg";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate, type MeetupRow } from "@/lib/meetups";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MoQ Bay Area — Media Over QUIC Meetups & Community" },
      {
        name: "description",
        content:
          "A Bay Area community for Media Over QUIC and low-latency video streaming: meetups, hack nights, demos and resources across SF, Oakland and the Peninsula.",
      },
      { property: "og:title", content: "MoQ Bay Area — Media Over QUIC Meetups & Community" },
      {
        property: "og:description",
        content:
          "Meetups, hack nights and demos for Media Over QUIC and low-latency streaming engineers in the Bay Area.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const meetupsQuery = useQuery({
    queryKey: ["meetups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetups")
        .select(
          "id, title, event_date, time_label, venue, city, summary, status, rsvp_count, waitlist_count, capacity",
        )
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MeetupRow[];
    },
  });

  const upcoming = (meetupsQuery.data ?? [])
    .filter((m) => m.status !== "past")
    .slice(0, 2);


  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImage}
          alt="Video frames streaming across a network as glowing data traces"
          width={1600}
          height={912}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative mx-auto max-w-6xl px-5 py-28 sm:py-36">
          <p className="eyebrow">San Francisco Bay Area</p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
            Media Over QUIC,
            <br />
            <span className="text-ember">in a room together.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            A gathering of video streaming engineers, protocol nerds and codec people
            figuring out what live video looks like once it stops pretending to be HTTP.
          </p>
          <div className="mt-9">
            <Link
              to="/join"
              className="inline-flex items-center gap-3 bg-ember px-6 py-3 font-display text-sm text-primary-foreground transition-colors hover:bg-ember-soft"
            >
              Join the community
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-5">
          <h2 className="text-2xl">Next up</h2>
          <Link
            to="/meetups"
            className="font-display text-xs tracking-widest text-ember uppercase hover:underline"
          >
            All meetups
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {upcoming.map((m) => (
            <article key={m.id} className="border border-border bg-surface p-7">
              <p className="font-display text-xs tracking-widest text-ember uppercase">
                {formatEventDate(m.event_date)} · {m.time_label}
              </p>
              <h3 className="mt-4 text-lg leading-snug">{m.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{m.summary}</p>
              <p className="mt-6 font-display text-xs text-muted-foreground">
                {m.venue} — {m.city}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border rule-grid">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <p className="eyebrow">The premise</p>
            <h2 className="mt-4 text-3xl leading-tight">
              Sub-second live video, built on QUIC instead of workarounds.
            </h2>
            <p className="mt-5 text-muted-foreground">
              MoQ replaces the segment-and-poll model with a publish/subscribe transport
              where media objects flow through relays and priorities are explicit. It is
              early, unfinished, and exactly the sort of thing worth arguing about in
              person.
            </p>
            <Link
              to="/what-is-moq"
              className="mt-7 inline-block border border-ember px-5 py-3 font-display text-sm text-ember transition-colors hover:bg-ember hover:text-primary-foreground"
            >
              Read the primer
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-px border border-border bg-border">
            {[
              ["<200ms", "glass-to-glass target discussed at our demos"],
              ["4", "meetups planned across the Bay this year"],
              ["1", "shared public relay for hack nights"],
              ["0", "vendor pitches allowed"],
            ].map(([stat, label]) => (
              <div key={label} className="bg-surface p-6">
                <dt className="font-display text-2xl text-ember">{stat}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
