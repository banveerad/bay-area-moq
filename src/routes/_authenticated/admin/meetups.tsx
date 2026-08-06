import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { formatEventDate, type MeetupRow } from "@/lib/meetups";
import { MemberProfileDialog } from "@/components/member-profile-dialog";

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
  capacity: string;
};

const empty: FormState = {
  title: "",
  event_date: "",
  time_label: "6:30 – 9:00 PM",
  venue: "",
  city: "",
  summary: "",
  status: "open",
  capacity: "",
};

const inputClass =
  "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ember";

type AttendeeRow = {
  id: string;
  meetup_id: string;
  user_id: string;
  status: string;
  created_at: string;
};

function AdminMeetupsPage() {
  const { isAdmin, loading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [openList, setOpenList] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);


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

  const attendeesQuery = useQuery({
    queryKey: ["admin-attendees"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("id, meetup_id, user_id, status, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AttendeeRow[];
    },
  });

  const profilesQuery = useQuery({
    queryKey: ["admin-profiles"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, display_name, company");
      if (error) throw error;
      return data ?? [];
    },
  });

  const nameFor = (userId: string) => {
    const p = (profilesQuery.data ?? []).find((x) => x.id === userId);
    if (!p) return "Member";
    return [p.display_name || "Member", p.company].filter(Boolean).join(" · ");
  };

  const attendeesFor = (meetupId: string, status: string) =>
    (attendeesQuery.data ?? []).filter((a) => a.meetup_id === meetupId && a.status === status);


  const reset = () => {
    setEditingId(null);
    setForm(empty);
    setFormOpen(false);
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(empty);
    setFormOpen(true);
  };

  const refreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["meetups"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-attendees"] });
    void queryClient.invalidateQueries({ queryKey: ["rsvps"] });
  };

  const setRsvpStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "going" | "waitlist" }) => {
      const { error } = await supabase.from("rsvps").update({ status }).eq("id", id);
      if (error) throw error;
      return status;
    },
    onSuccess: (status) => {
      refreshAll();
      toast.success(status === "going" ? "Moved to going." : "Moved to waitlist.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeRsvp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rsvps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      refreshAll();
      toast.success("RSVP removed.");
    },
    onError: (error: Error) => toast.error(error.message),
  });


  const save = useMutation({
    mutationFn: async () => {
      if (!form.title || !form.event_date || !form.venue || !form.city) {
        throw new Error("Title, date, venue and city are required.");
      }
      const trimmed = form.capacity.trim();
      const capacity = trimmed === "" ? null : Number(trimmed);
      if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) {
        throw new Error("Capacity must be a whole number of 1 or more, or left blank.");
      }
      const payload = { ...form, capacity };
      if (editingId) {
        const { error } = await supabase.from("meetups").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("meetups").insert(payload);
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
        <h1 className="text-3xl">Page not found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Organiser tools</p>
          <h1 className="mt-4 text-4xl">Manage meetups</h1>
        </div>
        <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/members"
          className="border border-border px-5 py-3 font-display text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
        >
          Manage members
        </Link>
        <button
          type="button"
          onClick={startCreate}
          className="bg-ember px-5 py-3 font-display text-xs tracking-widest uppercase text-background transition-opacity hover:opacity-90"
        >
          + Add meetup
        </button>
        </div>
      </div>

      {formOpen && (
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
          <label className="text-sm">
            <span className="text-muted-foreground">Capacity (blank = unlimited)</span>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
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
          <button
            type="button"
            onClick={reset}
            className="border border-border px-5 py-3 font-display text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </form>
      )}

      <ul className="mt-12 divide-y divide-border border-y border-border">
        {(meetupsQuery.data ?? []).map((m) => {
          const goingList = attendeesFor(m.id, "going");
          const waitList = attendeesFor(m.id, "waitlist");
          const expanded = openList === m.id;
          const full = m.capacity != null && goingList.length >= m.capacity;
          return (
            <li key={m.id} className="py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-xs tracking-widest uppercase text-ember">
                    {formatEventDate(m.event_date)} · {m.status}
                  </p>
                  <h3 className="mt-2 text-base">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {m.venue} — {m.city}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {m.rsvp_count}
                    {m.capacity != null ? ` / ${m.capacity}` : ""} going · {m.waitlist_count}{" "}
                    waitlisted
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenList(expanded ? null : m.id)}
                    className="border border-border px-4 py-2 font-display text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
                  >
                    {expanded ? "Hide members" : "Members"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(m.id);
                      setFormOpen(true);
                      setForm({
                        title: m.title,
                        event_date: m.event_date,
                        time_label: m.time_label,
                        venue: m.venue,
                        city: m.city,
                        summary: m.summary,
                        status: m.status,
                        capacity: m.capacity != null ? String(m.capacity) : "",
                      });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="border border-ember px-4 py-2 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-background"
                  >
                    ✎ Edit meetup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${m.title}"? This also removes all its RSVPs.`))
                        remove.mutate(m.id);
                    }}
                    className="border border-destructive px-4 py-2 font-display text-xs tracking-widest uppercase text-destructive transition-colors hover:bg-destructive hover:text-background"
                  >
                    ✕ Delete meetup
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="mt-5 grid gap-6 border border-border bg-surface p-5 sm:grid-cols-2">
                  <div>
                    <p className="font-display text-xs tracking-widest uppercase text-ember">
                      Going ({goingList.length}
                      {m.capacity != null ? ` / ${m.capacity}` : ""})
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {goingList.length === 0 && (
                        <li className="text-muted-foreground">Nobody yet.</li>
                      )}
                      {goingList.map((a) => (
                        <li key={a.id} className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setProfileUserId(a.user_id)}
                            className="text-left text-muted-foreground underline decoration-border underline-offset-4 hover:text-ember"
                          >
                            {nameFor(a.user_id)}
                          </button>
                          <span className="flex gap-2">
                            <button
                              type="button"
                              disabled={setRsvpStatus.isPending}
                              onClick={() => setRsvpStatus.mutate({ id: a.id, status: "waitlist" })}
                              className="border border-border px-2 py-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-50"
                            >
                              → Waitlist
                            </button>
                            <button
                              type="button"
                              disabled={removeRsvp.isPending}
                              onClick={() => {
                                if (confirm(`Remove ${nameFor(a.user_id)}'s RSVP?`))
                                  removeRsvp.mutate(a.id);
                              }}
                              className="border border-destructive px-2 py-1 text-xs uppercase tracking-wider text-destructive hover:bg-destructive hover:text-background disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-display text-xs tracking-widest uppercase text-muted-foreground">
                      Waitlist ({waitList.length})
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {waitList.length === 0 && (
                        <li className="text-muted-foreground">Nobody waiting.</li>
                      )}
                      {waitList.map((a, i) => (
                        <li key={a.id} className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setProfileUserId(a.user_id)}
                            className="text-left text-muted-foreground underline decoration-border underline-offset-4 hover:text-ember"
                          >
                            {i + 1}. {nameFor(a.user_id)}
                          </button>
                          <span className="flex gap-2">
                            <button
                              type="button"
                              disabled={setRsvpStatus.isPending}
                              title={full ? "Meetup is at capacity — raise capacity first" : undefined}
                              onClick={() => {
                                if (
                                  full &&
                                  !confirm("This meetup is at capacity. Move them to going anyway?")
                                )
                                  return;
                                setRsvpStatus.mutate({ id: a.id, status: "going" });
                              }}
                              className="border border-ember px-2 py-1 text-xs uppercase tracking-wider text-ember hover:bg-ember hover:text-background disabled:opacity-50"
                            >
                              → Going
                            </button>
                            <button
                              type="button"
                              disabled={removeRsvp.isPending}
                              onClick={() => {
                                if (confirm(`Remove ${nameFor(a.user_id)} from the waitlist?`))
                                  removeRsvp.mutate(a.id);
                              }}
                              className="border border-destructive px-2 py-1 text-xs uppercase tracking-wider text-destructive hover:bg-destructive hover:text-background disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <MemberProfileDialog userId={profileUserId} onClose={() => setProfileUserId(null)} />
    </div>
  );
}

