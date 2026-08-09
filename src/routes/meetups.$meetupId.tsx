import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatEventDate, statusLabel, type MeetupRow } from "@/lib/meetups";
import { AddToCalendar } from "@/components/add-to-calendar";
import { notifyRsvpChange } from "@/lib/rsvp-notify.functions";

const SITE = "https://moqbayarea.com";

const SELECT =
  "id, title, event_date, time_label, venue, city, summary, status, rsvp_count, waitlist_count, capacity";

export const Route = createFileRoute("/meetups/$meetupId")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("meetups")
      .select(SELECT)
      .eq("id", params.meetupId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { meetup: data as MeetupRow };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE}/meetups/${params.meetupId}`;
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }],
      };
    }
    const m = loaderData.meetup;
    const title = `${m.title} — ${formatEventDate(m.event_date)} — moq+more Bay Area`;
    const description =
      m.summary ||
      `${m.title} at ${m.venue}, ${m.city} on ${formatEventDate(m.event_date)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: m.title,
            startDate: m.event_date,
            description,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: m.venue,
              address: { "@type": "PostalAddress", addressLocality: m.city },
            },
            url,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-24">
      <h1 className="text-3xl">Page not found</h1>
      <Link to="/meetups" className="mt-6 inline-block text-sm text-ember hover:underline">
        Back to meetups
      </Link>
    </div>
  ),
  component: MeetupDetail,
});

function MeetupDetail() {
  const { meetupId } = Route.useParams();
  const initial = Route.useLoaderData().meetup;
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const meetupQuery = useQuery({
    queryKey: ["meetup", meetupId],
    initialData: initial,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetups")
        .select(SELECT)
        .eq("id", meetupId)
        .single();
      if (error) throw error;
      return data as MeetupRow;
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
    mutationFn: async ({ going }: { going: boolean }) => {
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
      void queryClient.invalidateQueries({ queryKey: ["meetup", meetupId] });
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

  const m = meetupQuery.data;
  const mine = (rsvpsQuery.data ?? []).find((r) => r.meetup_id === meetupId);
  const going = Boolean(mine);
  const full = m.capacity != null && m.rsvp_count >= m.capacity;

  const share = async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : SITE}/meetups/${meetupId}`;
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title: m.title, text: m.summary, url });
        return;
      } catch {
        /* user cancelled, fall through to copy */
      }
    }
    try {
      await nav?.clipboard?.writeText(url);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-20">
      <Link
        to="/meetups"
        className="font-display text-xs tracking-widest text-ember uppercase hover:underline"
      >
        ← All meetups
      </Link>

      <p className="mt-8 font-display text-xs tracking-widest text-ember uppercase">
        {formatEventDate(m.event_date)} · {m.time_label}
      </p>
      <h1 className="mt-4 text-4xl leading-tight">{m.title}</h1>
      <p className="mt-4 font-display text-sm text-muted-foreground">
        {m.venue} — {m.city}
      </p>
      {m.status !== "open" && (
        <p className="mt-2 font-display text-xs tracking-widest uppercase text-muted-foreground">
          {statusLabel[m.status] ?? m.status}
        </p>
      )}

      {m.summary && (
        <p className="mt-8 whitespace-pre-line text-muted-foreground">{m.summary}</p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-8">
        {isAuthenticated ? (
          <button
            type="button"
            disabled={toggleRsvp.isPending}
            onClick={() => toggleRsvp.mutate({ going })}
            className={`border px-5 py-2 font-display text-xs tracking-widest uppercase transition-colors disabled:opacity-50 ${
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
        ) : (
          <Link
            to="/auth"
            className="border border-ember px-5 py-2 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-background"
          >
            {full ? "Sign in to join waitlist" : "Sign in to RSVP"}
          </Link>
        )}

        {mine?.status === "going" && <AddToCalendar event={m} />}

        <button
          type="button"
          onClick={share}
          className="border border-border px-5 py-2 font-display text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:border-ember hover:text-ember"
        >
          {copied ? "Link copied" : "Share"}
        </button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {m.rsvp_count}
        {m.capacity != null ? ` / ${m.capacity}` : ""} going
        {m.waitlist_count > 0 ? ` · ${m.waitlist_count} waitlisted` : ""}
      </p>
      {mine?.status === "waitlist" && (
        <p className="mt-1 text-xs text-ember">You're on the waitlist</p>
      )}
    </article>
  );
}
