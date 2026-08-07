import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import heroImage from "@/assets/hero-moq.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatEventDate, type MeetupRow } from "@/lib/meetups";
import { AddToCalendar } from "@/components/add-to-calendar";
import { notifyRsvpChange } from "@/lib/rsvp-notify.functions";
import { RotatingWords } from "@/components/rotating-words";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bay Area — Video Tech and Media Over QUIC Meetups & Community" },
      {
        name: "description",
        content:
          "A Bay Area community for Media Over QUIC and low-latency video streaming: meetups, hack nights, demos and resources across SF, Oakland and the Peninsula.",
      },
      { property: "og:title", content: "Bay Area — Video Tech and Media Over QUIC Meetups & Community" },
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
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

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

  const rsvpsQuery = useQuery({
    queryKey: ["rsvps", user?.id],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("meetup_id, status")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const notify = useServerFn(notifyRsvpChange);

  const toggleRsvp = useMutation({
    mutationFn: async ({ meetupId, going }: { meetupId: string; going: boolean }) => {
      if (going) {
        const { error } = await supabase
          .from("rsvps")
          .delete()
          .eq("meetup_id", meetupId)
          .eq("user_id", user!.id);
        if (error) throw error;
        try {
          await notify({ data: { meetupId, action: "cancelled" } });
        } catch (err) {
          console.error(err);
        }
        return "cancelled" as const;
      }
      const { data, error } = await supabase
        .from("rsvps")
        .insert({ meetup_id: meetupId, user_id: user!.id })
        .select("status")
        .single();
      if (error) throw error;
      const status = (data?.status === "waitlist" ? "waitlist" : "going") as
        | "waitlist"
        | "going";
      try {
        await notify({ data: { meetupId, action: status } });
      } catch (err) {
        console.error(err);
      }
      return status;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["rsvps"] });
      void queryClient.invalidateQueries({ queryKey: ["meetups"] });
      toast.success(
        result === "going"
          ? "You're on the list."
          : result === "waitlist"
            ? "This one is full — you're on the waitlist."
            : "RSVP cancelled.",
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rsvps = rsvpsQuery.data ?? [];
  const myRsvp = (id: string) => rsvps.find((r) => r.meetup_id === id);

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
            Community for
            <br />
            <RotatingWords
              className="text-ember"
              words={[
                "Media Over QUIC.",
                "Live streaming.",
                "Video on demand.",
                "Advertising.",
                "Encoding.",
                "Packaging.",
                "CDNs.",
                "General video tech.",
              ]}

            />
          </h1>

          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            A community of streaming engineers, protocol nerds and codec people figuring
            out what live video looks like once it stops pretending to be HTTP, and what
            that changes for everything around it, from encoding and packaging to ads,
            playback and the quality your viewers actually see.
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
        {!meetupsQuery.isLoading && upcoming.length === 0 && (
          <div className="mt-8 border border-border bg-surface p-7">
            <p className="font-display text-xs tracking-widest text-ember uppercase">
              Nothing on the calendar
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              New meetups are coming soon — join the community and you'll hear about the
              next one first.
            </p>
          </div>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-2">

          {upcoming.map((m) => {
            const mine = myRsvp(m.id);
            const going = Boolean(mine);
            const full = m.capacity != null && m.rsvp_count >= m.capacity;
            return (
              <article
                key={m.id}
                className="group relative border border-border bg-surface p-7 transition-colors hover:border-ember"
              >
                <Link
                  to="/meetups/$meetupId"
                  params={{ meetupId: m.id }}
                  aria-label={m.title}
                  className="absolute inset-0 z-0"
                />
                <p className="font-display text-xs tracking-widest text-ember uppercase">
                  {formatEventDate(m.event_date)} · {m.time_label}
                </p>
                <h3 className="mt-4 text-lg leading-snug transition-colors group-hover:text-ember">
                  {m.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{m.summary}</p>
                <p className="mt-6 font-display text-xs text-muted-foreground">
                  {m.venue} — {m.city}
                </p>

                <div className="mt-6 border-t border-border pt-5">
                  {isAuthenticated ? (
                    <>
                      <button
                        type="button"
                        disabled={toggleRsvp.isPending}
                        onClick={() => toggleRsvp.mutate({ meetupId: m.id, going })}
                        className={`border px-4 py-2 font-display text-xs tracking-widest uppercase transition-colors disabled:opacity-50 ${
                          going
                            ? "border-border text-muted-foreground hover:text-foreground"
                            : "border-ember text-ember hover:bg-ember hover:text-background"
                        }`}
                      >
                        {going
                          ? mine?.status === "waitlist"
                            ? "Leave waitlist"
                            : "Cancel RSVP"
                          : full
                            ? "Join waitlist"
                            : "RSVP"}
                      </button>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {m.rsvp_count}
                        {m.capacity != null ? ` / ${m.capacity}` : ""} going
                        {m.waitlist_count > 0 ? ` · ${m.waitlist_count} waitlisted` : ""}
                      </p>
                      {mine?.status === "waitlist" && (
                        <p className="mt-1 text-xs text-ember">You're on the waitlist</p>
                      )}
                      {mine?.status === "going" && (
                        <div className="mt-3">
                          <AddToCalendar event={m} />
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="inline-block border border-ember px-4 py-2 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-background"
                    >
                      {full ? "Sign in to join waitlist" : "Sign in to RSVP"}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
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
