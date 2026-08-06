export type MeetupRow = {
  id: string;
  title: string;
  event_date: string;
  time_label: string;
  venue: string;
  city: string;
  summary: string;
  status: string;
  rsvp_count: number;
  waitlist_count: number;
  capacity: number | null;
  announced_at?: string | null;



};

export const statusLabel: Record<string, string> = {
  open: "RSVP open",
  waitlist: "Waitlist",
  past: "Past",
};

export function formatEventDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
