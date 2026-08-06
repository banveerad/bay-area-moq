import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { formatEventDate, statusLabel, type MeetupRow } from "@/lib/meetups";
import { AddToCalendar } from "@/components/add-to-calendar";

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

function MeetupsPage() {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useIsAdmin();
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


  const toggleRsvp = useMutation({
    mutationFn: async ({ meetupId, going }: { meetupId: string; going: boolean }) => {
      if (going) {
        const { error } = await supabase
          .from("rsvps")
          .delete()
          .eq("meetup_id", meetupId)
          .eq("user_id", user!.id);
        if (error) throw error;
        return "cancelled" as const;
      }
      const { data, error } = await supabase
        .from("rsvps")
        .insert({ meetup_id: meetupId, user_id: user!.id })
        .select("status")
        .single();
      if (error) throw error;
      return (data?.status === "waitlist" ? "waitlist" : "going") as "waitlist" | "going";
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

  const meetups = meetupsQuery.data ?? [];
  const rsvps = rsvpsQuery.data ?? [];
  const upcoming = meetups.filter((m) => m.status !== "past");
  const past = meetups.filter((m) => m.status === "past");

  const myRsvp = (id: string) => rsvps.find((r) => r.meetup_id === id);



  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1 className="mt-4 text-4xl">Meetups</h1>
        </div>
        {isAdmin && (
          <Link
            to="/admin/meetups"
            className="border border-ember px-5 py-3 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-background"
          >
            Manage meetups
          </Link>
        )}
      </div>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        Evenings are half talk, half hands-on. Doors at 6, food, then two sessions and
        open hacking until the venue kicks us out.
      </p>

      {meetupsQuery.isLoading && (
        <p className="mt-12 text-sm text-muted-foreground">Loading the calendar…</p>
      )}

      <ul className="mt-12 divide-y divide-border border-y border-border">
        {upcoming.map((m) => {
          const mine = myRsvp(m.id);
          const going = Boolean(mine);
          const full = m.capacity != null && m.rsvp_count >= m.capacity;
          return (
            <li key={m.id} className="grid gap-4 py-8 md:grid-cols-[210px_1fr_190px]">
              <div className="font-display text-sm">
                <p className="text-ember">{formatEventDate(m.event_date)}</p>
                <p className="mt-1 text-muted-foreground">{m.time_label}</p>
              </div>
              <div>
                <h2 className="text-lg leading-snug">{m.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{m.summary}</p>
                <p className="mt-4 font-display text-xs text-muted-foreground">
                  {m.venue} — {m.city}
                </p>
              </div>
              <div className="md:text-right">
                {m.status !== "open" && (
                  <p className="font-display text-xs tracking-widest uppercase text-muted-foreground">
                    {statusLabel[m.status] ?? m.status}
                  </p>
                )}
                {full && m.status === "open" && (
                  <p className="font-display text-xs tracking-widest uppercase text-muted-foreground">
                    Full — waitlist
                  </p>
                )}

                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      disabled={toggleRsvp.isPending}
                      onClick={() => toggleRsvp.mutate({ meetupId: m.id, going })}
                      className={`mt-3 border px-4 py-2 font-display text-xs tracking-widest uppercase transition-colors disabled:opacity-50 ${
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
                        <AddToCalendar event={m} align="right" />
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="mt-3 inline-block border border-ember px-4 py-2 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-background"
                  >
                    {full ? "Sign in to join waitlist" : "Sign in to RSVP"}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {past.length > 0 && (
        <>
          <h2 className="mt-16 text-2xl">Already happened</h2>
          <ul className="mt-6 space-y-4">
            {past.map((m) => (
              <li key={m.id} className="border border-border bg-surface p-6">
                <p className="font-display text-xs tracking-widest text-muted-foreground uppercase">
                  {formatEventDate(m.event_date)} · {m.city}
                </p>
                <h3 className="mt-3 text-base">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{m.summary}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
