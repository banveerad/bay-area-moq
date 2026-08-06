import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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
        .select("display_name, company, interests")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

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
    </div>
  );
}
