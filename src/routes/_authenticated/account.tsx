import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatEventDate } from "@/lib/meetups";
import { AddToCalendar } from "@/components/add-to-calendar";
import { notifyRsvpChange } from "@/lib/rsvp-notify.functions";


export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Your account — MoQ Bay Area" },
      {
        name: "description",
        content: "Manage your MoQ Bay Area member profile: display name, company and interests.",
      },
      { property: "og:title", content: "Your account — MoQ Bay Area" },
      {
        property: "og:description",
        content: "Manage your MoQ Bay Area member profile.",
      },
    ],
  }),
  component: AccountPage,
});

const profileSchema = z.object({
  display_name: z.string().trim().max(80).nullable(),
  company: z.string().trim().max(120).nullable(),
  interests: z.string().trim().max(500).nullable(),
});

function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ display_name: "", company: "", interests: "" });
  const [busy, setBusy] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, company, interests, notify_new_meetups")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const setNotifyPref = useMutation({
    mutationFn: async (value: boolean) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user!.id, notify_new_meetups: value }, { onConflict: "id" });
      if (error) throw error;
      return value;
    },
    onSuccess: (value) => {
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success(
        value ? "We'll email you about new meetups." : "New-meetup emails turned off.",
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const { data: myRsvps = [], isLoading: rsvpsLoading } = useQuery({
    queryKey: ["my-rsvps", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select(
          "id, status, created_at, meetups(id, title, event_date, time_label, venue, city, summary, status)",
        )
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).filter((r) => r.meetups);
    },
  });

  const notify = useServerFn(notifyRsvpChange);

  const cancelRsvp = useMutation({
    mutationFn: async ({ id, meetupId }: { id: string; meetupId: string }) => {
      const { error } = await supabase.from("rsvps").delete().eq("id", id);
      if (error) throw error;
      try {
        await notify({ data: { meetupId, action: "cancelled" } });
      } catch (err) {
        console.error(err);
      }
    },
    onSuccess: () => {
      toast.success("RSVP cancelled.");
      void queryClient.invalidateQueries({ queryKey: ["my-rsvps", user?.id] });
      void queryClient.invalidateQueries({ queryKey: ["meetups"] });
      void queryClient.invalidateQueries({ queryKey: ["rsvps"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const sortedRsvps = [...myRsvps].sort((a, b) =>
    (a.meetups!.event_date ?? "").localeCompare(b.meetups!.event_date ?? ""),
  );


  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        company: profile.company ?? "",
        interests: profile.interests ?? "",
      });
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = profileSchema.safeParse({
      display_name: form.display_name || null,
      company: form.company || null,
      interests: form.interests || null,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...parsed.data }, { onConflict: "id" });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile saved.");
      void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <p className="eyebrow">Account</p>
      <h1 className="mt-4 text-3xl leading-tight">Your member profile</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Signed in as <span className="text-foreground">{user?.email}</span>
      </p>

      <form onSubmit={handleSave} className="mt-10 space-y-4">
        <label className="block">
          <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">
            Display name
          </span>
          <input
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            maxLength={80}
            className="mt-2 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ember"
          />
        </label>
        <label className="block">
          <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">
            Company or project
          </span>
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            maxLength={120}
            className="mt-2 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ember"
          />
        </label>
        <label className="block">
          <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">
            What you're into
          </span>
          <textarea
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
            maxLength={500}
            rows={4}
            placeholder="moq-transport, WebCodecs, sub-second live sports…"
            className="mt-2 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ember"
          />
        </label>
        <label className="flex items-start gap-3 border border-border bg-surface px-4 py-3.5">
          <input
            type="checkbox"
            checked={profile?.notify_new_meetups ?? true}
            disabled={setNotifyPref.isPending}
            onChange={(e) => setNotifyPref.mutate(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--color-ember,#e85d3a)]"
          />
          <span className="text-sm text-muted-foreground">
            Email me when a new meetup is announced.
          </span>
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="bg-ember px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Save profile
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="border border-border px-5 py-2.5 text-sm transition-colors hover:bg-surface"
          >
            Sign out
          </button>
        </div>
      </form>

      <section className="mt-16 border-t border-border pt-10">
        <p className="eyebrow">Your meetups</p>
        <h2 className="mt-3 text-xl leading-tight">RSVPs &amp; waitlist</h2>

        {rsvpsLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : sortedRsvps.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            You haven't RSVP'd to anything yet.{" "}
            <Link to="/meetups" className="text-ember hover:underline">
              Browse meetups
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border border border-border">
            {sortedRsvps.map((rsvp) => {
              const m = rsvp.meetups!;
              return (
                <li key={rsvp.id} className="flex flex-wrap items-start justify-between gap-4 bg-surface px-4 py-4">
                  <div>
                    <p className="font-display text-xs tracking-widest uppercase">
                      <span className={rsvp.status === "going" ? "text-ember" : "text-muted-foreground"}>
                        {rsvp.status === "going" ? "Going" : "Waitlisted"}
                      </span>
                    </p>
                    <p className="mt-1.5 text-sm text-foreground">{m.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatEventDate(m.event_date)} · {m.time_label} · {m.venue}, {m.city}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {rsvp.status === "going" && <AddToCalendar event={m} align="right" />}
                    <button
                      type="button"
                      onClick={() => cancelRsvp.mutate({ id: rsvp.id, meetupId: rsvp.meetups!.id })}
                      disabled={cancelRsvp.isPending}
                      className="border border-border px-3 py-1.5 text-xs transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
                    >
                      {rsvp.status === "going" ? "Cancel RSVP" : "Leave waitlist"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>

  );
}
