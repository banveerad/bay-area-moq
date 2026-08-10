import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Turnstile } from "@/components/turnstile";
import { guestRsvp } from "@/lib/guest-rsvp.functions";
import type { MeetupRow } from "@/lib/meetups";
import { AddToCalendar } from "@/components/add-to-calendar";

const inputClass =
  "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ember";

export function GuestRsvpForm({
  meetup,
  full,
  align = "left",
}: {
  meetup: MeetupRow;
  full: boolean;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [done, setDone] = useState<"going" | "waitlist" | null>(null);

  const submit = useServerFn(guestRsvp);

  const rsvp = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2) throw new Error("Please enter your name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        throw new Error("Please enter a valid email address.");
      if (!token) throw new Error("Please complete the captcha.");
      return submit({
        data: {
          meetupId: meetup.id,
          name: name.trim(),
          email: email.trim(),
          linkedin: linkedin.trim(),
          captchaToken: token,
        },
      });
    },
    onSuccess: (result) => {
      setDone(result.status);
      toast.success(
        result.duplicate
          ? result.status === "waitlist"
            ? "You're already on the waitlist for this one."
            : "You're already on the list for this one."
          : result.status === "going"
            ? "You're on the list — check your email for the details."
            : "This one is full — you're on the waitlist.",
      );
    },
    onError: (error: Error) => {
      setResetKey((k) => k + 1);
      setToken(null);
      toast.error(error.message);
    },
  });

  if (done) {
    return (
      <div className={align === "right" ? "md:text-right" : ""}>
        <p className="font-display text-xs tracking-widest uppercase text-ember">
          {done === "going" ? "You're on the list" : "You're on the waitlist"}
        </p>
        {done === "going" && (
          <div className="mt-3">
            <AddToCalendar event={meetup} align={align === "right" ? "right" : "left"} />
          </div>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer border border-ember px-4 py-2 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-background"
      >
        {full ? "Join waitlist" : "RSVP"}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        rsvp.mutate();
      }}
      className="space-y-3 border border-border bg-surface p-4 text-left"
    >
      <p className="font-display text-xs tracking-widest uppercase text-ember">
        {full ? "Join the waitlist" : "RSVP"}
      </p>
      <input
        className={inputClass}
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        required
      />
      <input
        className={inputClass}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={255}
        required
      />
      <input
        className={inputClass}
        placeholder="LinkedIn URL (optional)"
        value={linkedin}
        onChange={(e) => setLinkedin(e.target.value)}
        maxLength={255}
      />
      <div className="max-w-full origin-left scale-[0.92] overflow-hidden">
        <Turnstile onVerify={setToken} resetKey={resetKey} />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={rsvp.isPending || !token}
          className="cursor-pointer border border-ember px-4 py-2 font-display text-xs tracking-widest uppercase text-ember transition-colors hover:bg-ember hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {rsvp.isPending ? "Sending…" : full ? "Join waitlist" : "Confirm RSVP"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer border border-border px-4 py-2 font-display text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
