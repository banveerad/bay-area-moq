import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { MemberProfileDialog } from "@/components/member-profile-dialog";

export const Route = createFileRoute("/_authenticated/admin/members")({
  head: () => ({
    meta: [
      { title: "Manage Members — Bay Area MoQ" },
      {
        name: "description",
        content: "Organiser tools for reviewing Bay Area MoQ members, their profiles and RSVPs.",
      },
      { property: "og:title", content: "Manage Members — Bay Area MoQ" },
      {
        property: "og:description",
        content: "Review member profiles, RSVP activity and organiser access.",
      },
    ],
  }),
  component: AdminMembersPage,
});

function AdminMembersPage() {
  const { isAdmin, loading } = useIsAdmin();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const profilesQuery = useQuery({
    queryKey: ["admin-members"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, company, interests, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rolesQuery = useQuery({
    queryKey: ["admin-all-roles"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data ?? [];
    },
  });

  const rsvpsQuery = useQuery({
    queryKey: ["admin-attendees"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("rsvps").select("id, user_id, status");
      if (error) throw error;
      return data ?? [];
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
      toast.success("Role updated.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const isOrganiser = (id: string) =>
    (rolesQuery.data ?? []).some((r) => r.user_id === id && r.role === "admin");

  const counts = (id: string) => {
    const rows = (rsvpsQuery.data ?? []).filter((r) => r.user_id === id);
    return {
      going: rows.filter((r) => r.status === "going").length,
      waitlist: rows.filter((r) => r.status === "waitlist").length,
    };
  };

  const members = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = profilesQuery.data ?? [];
    if (!q) return rows;
    return rows.filter((m) =>
      [m.display_name, m.company, m.interests].some((v) => (v ?? "").toLowerCase().includes(q)),
    );
  }, [profilesQuery.data, query]);

  if (loading) {
    return <p className="mx-auto max-w-3xl px-5 py-20 text-muted-foreground">Checking access…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-3xl">Organisers only</h1>
        <p className="mt-4 text-muted-foreground">
          This page is for meetup organisers. If you should have access, ask an existing organiser
          to add you.
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
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl">Manage members</h1>
        <Link
          to="/admin/meetups"
          className="border border-border px-4 py-2 font-display text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
        >
          Manage meetups
        </Link>
      </div>

      <input
        placeholder="Search by name, company or interests"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-8 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ember"
      />

      <p className="mt-4 text-sm text-muted-foreground">
        {members.length} member{members.length === 1 ? "" : "s"}
      </p>

      <ul className="mt-6 divide-y divide-border border-y border-border">
        {members.map((m) => {
          const c = counts(m.id);
          const organiser = isOrganiser(m.id);
          return (
            <li
              key={m.id}
              className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-base">
                  {m.display_name || "Member"}
                  {organiser && (
                    <span className="ml-3 font-display text-xs tracking-widest uppercase text-ember">
                      Organiser
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {m.company || "No company"} · {c.going} going · {c.waitlist} waitlisted
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setOpenId(m.id)}
                  className="border border-ember px-4 py-2 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-background"
                >
                  View profile
                </button>
                {m.id !== user?.id && (
                  <button
                    type="button"
                    disabled={setRole.isPending}
                    onClick={() => setRole.mutate({ userId: m.id, makeAdmin: !organiser })}
                    className="border border-border px-4 py-2 font-display text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {organiser ? "Remove organiser" : "Make organiser"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
        {members.length === 0 && (
          <li className="py-6 text-sm text-muted-foreground">No members match that search.</li>
        )}
      </ul>

      <MemberProfileDialog userId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
