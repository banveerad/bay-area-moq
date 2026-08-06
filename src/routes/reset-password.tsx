import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — MoQ Bay Area" },
      {
        name: "description",
        content: "Choose a new password for your MoQ Bay Area member account.",
      },
      { property: "og:title", content: "Set a new password — MoQ Bay Area" },
      {
        property: "og:description",
        content: "Choose a new password for your MoQ Bay Area member account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z.string().min(8).max(72).safeParse(password);
    if (!parsed.success) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated.");
      void navigate({ to: "/account", replace: true });
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="eyebrow">Members</p>
      <h1 className="mt-4 text-3xl leading-tight">Set a new password</h1>
      {!ready ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Open the reset link from your email on this device to continue.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <label className="block">
            <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">
              New password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={72}
              required
              className="mt-2 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ember"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-ember px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Update password
          </button>
        </form>
      )}
    </div>
  );
}
