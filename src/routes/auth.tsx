import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — MoQ Bay Area" },
      {
        name: "description",
        content:
          "Sign in or create a MoQ Bay Area member account to RSVP for meetups and keep your profile up to date.",
      },
      { property: "og:title", content: "Sign in — MoQ Bay Area" },
      {
        property: "og:description",
        content: "Member sign in for the Media Over QUIC Bay Area community.",
      },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
});

function safePath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);


  const destination = safePath(search.redirect);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void navigate({ to: destination, replace: true });
    }
  }, [isAuthenticated, loading, destination, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    if (mode === "signup" && !acceptedTerms) {
      toast.error("Please accept the terms and conditions to create an account");
      return;
    }
    setBusy(true);

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName.trim().slice(0, 80) },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your email to confirm your account.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      sessionStorage.setItem("moq_auth_redirect", destination);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        return;
      }
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    const parsedEmail = z.string().trim().email().safeParse(email);
    if (!parsedEmail.success) {
      toast.error("Enter your email address first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent.");
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="eyebrow">Members</p>
      <h1 className="mt-4 text-3xl leading-tight">
        {mode === "signin" ? "Sign in" : "Create an account"}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        A member account lets you RSVP for meetups and keep your profile current. Free, always.
      </p>

      {sent ? (
        <div className="mt-10 border border-border bg-surface p-6 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="text-foreground">{email}</span>. Click it
          to finish creating your account.
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mt-10 w-full border border-border bg-surface px-4 py-3 text-sm transition-colors hover:bg-surface-raised disabled:opacity-50"
          >
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or use email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">
                  Display name
                </span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={80}
                  placeholder="Ada Lovelace"
                  className="mt-2 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ember"
                />
              </label>
            )}
            <label className="block">
              <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">
                Email
              </span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
                className="mt-2 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ember"
              />
            </label>
            <label className="block">
              <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">
                Password
              </span>
              <input
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
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
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="transition-colors hover:text-foreground"
            >
              {mode === "signin" ? "Need an account? Sign up" : "Already a member? Sign in"}
            </button>
            {mode === "signin" && (
              <button
                type="button"
                onClick={handleReset}
                className="transition-colors hover:text-foreground"
              >
                Forgot password?
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
