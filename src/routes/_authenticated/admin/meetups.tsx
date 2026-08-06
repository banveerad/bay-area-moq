import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { formatEventDate, type MeetupRow } from "@/lib/meetups";

export const Route = createFileRoute("/_authenticated/admin/meetups")({
  head: () => ({
    meta: [
      { title: "Manage Meetups — Bay Area MoQ" },
      {
        name: "description",
        content: "Organiser tools for creating, editing and removing Bay Area MoQ meetups.",
      },
      { property: "og:title", content: "Manage Meetups — Bay Area MoQ" },
      {
        property: "og:description",
        content: "Organiser tools for the Bay Area Media Over QUIC meetup calendar.",
      },
    ],
  }),
  component: AdminMeetupsPage,
});

type FormState = {
  title: string;
  event_date: string;
  time_label: string;
  venue: string;
  city: string;
  summary: string;
  status: string;
};

const empty: FormState = {
  title: "",
  event_date: "",
  time_label: "6:30 – 9:00 PM",
  venue: "",
  city: "",
  summary: "",
  status: "open",
};

const inputClass =
  "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ember";

function AdminMeetupsPage() {
  const { isAdmin, loading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const meetupsQuery = useQuery({
    queryKey: ["meetups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetups")
        .select("id, title, event_date, time_label, venue, city, summary, status, rsvp_count")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MeetupRow[];
    },
  });

  const reset = () => {
    setEditingId(null);
    setForm(empty);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.title || !form.event_date || !form.venue || !form.city) {
        throw new Error("Title, date, venue and city are required.");
      }
      if (editingId) {
        const { error } = await supabase.from("meetups").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("meetups").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["meetups"] });
      toast.success(editingId ? "Meetup updated." : "Meetup added.");
      reset();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meetups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["meetups"] });
      toast.success("Meetup deleted.");
      reset();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (loading) {
    return <p className="mx-auto max-w-3xl px-5 py-20 text-muted-foreground">Checking access…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-3xl">Organisers only</h1>
        <p className="mt-4 text-muted-foreground">
          This page is for meetup organisers. If you should have access, ask an existing
          organiser to add you.
        </p>
        <Link to="/meetups" className="mt-6 inline-block text-ember underline">
          Back to meetups
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-20">
      <p className="eyebrow">Organiser tools</p>
      <h1 className="mt-4 text-4xl">Manage meetups</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="mt-10 space-y-4 border border-border bg-surface p-7"
      >
        <h2 className="text-lg">{editingId ? "Edit meetup" : "New meetup"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="text-muted-foreground">Title</span>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Date</span>
            <input
              type="date"
              className={inputClass}
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Time</span>
            <input
              className={inputClass}
              value={form.time_label}
              onChange={(e) => setForm({ ...form, time_label: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Venue</span>
            <input
              className={inputClass}
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">City</span>
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-muted-foreground">Summary</span>
            <textarea
              rows={3}
              className={inputClass}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Status</span>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="open">open</option>
              <option value="waitlist">waitlist</option>
              <option value="past">past</option>
            </select>
          </label>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={save.isPending}
            className="border border-ember px-5 py-3 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-background disabled:opacity-50"
          >
            {editingId ? "Save changes" : "Add meetup"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="border border-border px-5 py-3 font-display text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="mt-12 divide-y divide-border border-y border-border">
        {(meetupsQuery.data ?? []).map((m) => (
          <li key={m.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xs tracking-widest uppercase text-ember">
                {formatEventDate(m.event_date)} · {m.status}
              </p>
              <h3 className="mt-2 text-base">{m.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {m.venue} — {m.city}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(m.id);
                  setForm({
                    title: m.title,
                    event_date: m.event_date,
                    time_label: m.time_label,
                    venue: m.venue,
                    city: m.city,
                    summary: m.summary,
                    status: m.status,
                  });
                }}
                className="border border-border px-4 py-2 font-display text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${m.title}"?`)) remove.mutate(m.id);
                }}
                className="border border-border px-4 py-2 font-display text-xs tracking-widest uppercase text-muted-foreground hover:border-ember hover:text-ember"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
