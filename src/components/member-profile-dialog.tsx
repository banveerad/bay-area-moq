import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate } from "@/lib/meetups";

type Props = {
  userId: string | null;
  onClose: () => void;
};

export function MemberProfileDialog({ userId, onClose }: Props) {
  const profileQuery = useQuery({
    queryKey: ["admin-member", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, company, interests, created_at")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const rsvpQuery = useQuery({
    queryKey: ["admin-member-rsvps", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("id, status, created_at, meetups(title, event_date)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const roleQuery = useQuery({
    queryKey: ["admin-member-roles", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as string);
    },
  });

  if (!userId) return null;

  const profile = profileQuery.data;
  const roles = roleQuery.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-5 py-16"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-border bg-surface p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-ember">
              Member profile
            </p>
            <h2 className="mt-3 text-2xl">
              {profileQuery.isLoading ? "Loading…" : profile?.display_name || "Member"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-border px-3 py-1 font-display text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>

        {!profileQuery.isLoading && !profile && (
          <p className="mt-6 text-sm text-muted-foreground">
            This member hasn't filled in a profile yet.
          </p>
        )}

        {profile && (
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Company</dt>
              <dd>{profile.company || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Interests</dt>
              <dd className="whitespace-pre-wrap">{profile.interests || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Member since</dt>
              <dd>{new Date(profile.created_at).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd>{roles.includes("admin") ? "Organiser" : "Member"}</dd>
            </div>
          </dl>
        )}

        <p className="mt-8 font-display text-xs tracking-widest uppercase text-muted-foreground">
          RSVP history
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {rsvpQuery.isLoading && <li className="text-muted-foreground">Loading…</li>}
          {!rsvpQuery.isLoading && (rsvpQuery.data ?? []).length === 0 && (
            <li className="text-muted-foreground">No RSVPs yet.</li>
          )}
          {(rsvpQuery.data ?? []).map((r) => {
            const meetup = r.meetups as { title: string; event_date: string } | null;
            return (
              <li key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-border pb-2">
                <span>{meetup?.title ?? "Meetup"}</span>
                <span className="text-muted-foreground">
                  {meetup ? formatEventDate(meetup.event_date) : ""} · {r.status}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
