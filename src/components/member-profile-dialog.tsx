import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate } from "@/lib/meetups";
import { getMemberEmails } from "@/lib/member-emails.functions";

type Props = {
  userId: string | null;
  onClose: () => void;
};

export function MemberProfileDialog({ userId, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const profileQuery = useQuery({
    queryKey: ["admin-member", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, last_name, company, interests, created_at")
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

  const emailQuery = useQuery({
    queryKey: ["admin-member-email", userId],
    enabled: Boolean(userId),
    retry: false,
    queryFn: async () => {
      const emails = await getMemberEmails({ data: { userIds: [userId!] } });
      return emails[userId!] ?? null;
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
              {profileQuery.isLoading ? "Loading…" : [profile?.display_name, profile?.last_name].filter(Boolean).join(" ") || "Member"}
            </h2>
            {emailQuery.data && (
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={`mailto:${emailQuery.data}`}
                  className="text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-ember"
                >
                  {emailQuery.data}
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(emailQuery.data!);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {
                      // clipboard unavailable — silently ignore
                    }
                  }}
                  className="border border-border px-2 py-0.5 font-display text-[10px] tracking-widest uppercase text-muted-foreground hover:text-ember"
                  aria-label="Copy email address"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
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
