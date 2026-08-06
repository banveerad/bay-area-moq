const TZ = "America/Los_Angeles";

export type CalendarEvent = {
  title: string;
  event_date: string;
  time_label: string;
  venue: string;
  city: string;
  summary: string;
};

function parseTimes(label: string): { start: [number, number]; end: [number, number] | null } {
  const matches = [...label.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi)];
  const meridiems = matches.map((m) => m[3]?.toLowerCase() ?? null);
  const lastMeridiem = [...meridiems].reverse().find(Boolean) ?? "pm";

  const toPair = (i: number): [number, number] | null => {
    const m = matches[i];
    if (!m) return null;
    let h = Number(m[1]);
    const min = Number(m[2] ?? 0);
    const mer = meridiems[i] ?? lastMeridiem;
    if (mer === "pm" && h < 12) h += 12;
    if (mer === "am" && h === 12) h = 0;
    return [h, min];
  };

  const start = toPair(0) ?? [18, 30];
  const end = toPair(1);
  return { start, end };
}

/** Offset in minutes of America/Los_Angeles from UTC for the given wall time. */
function tzOffsetMinutes(y: number, mo: number, d: number, h: number, mi: number) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(guess));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"));
  return (asUtc - guess) / 60000;
}

function toUtcDate(dateStr: string, [h, mi]: [number, number]) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const yy = y ?? 1970;
  const mm = mo ?? 1;
  const dd = d ?? 1;
  const offset = tzOffsetMinutes(yy, mm, dd, h, mi);
  return new Date(Date.UTC(yy, mm - 1, dd, h, mi) - offset * 60000);
}

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function eventWindow(ev: CalendarEvent) {
  const { start, end } = parseTimes(ev.time_label);
  const startAt = toUtcDate(ev.event_date, start);
  const endAt = end
    ? toUtcDate(ev.event_date, end)
    : new Date(startAt.getTime() + 2.5 * 60 * 60 * 1000);
  return { startAt, endAt: endAt > startAt ? endAt : new Date(startAt.getTime() + 9e6) };
}

export function calendarLinks(ev: CalendarEvent) {
  const { startAt, endAt } = eventWindow(ev);
  const location = `${ev.venue}, ${ev.city}, CA`;
  const details = `${ev.summary}\n\nMoQ Bay Area — https://moqbayarea.com/meetups`;

  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    ev.title,
  )}&dates=${stamp(startAt)}/${stamp(endAt)}&details=${encodeURIComponent(
    details,
  )}&location=${encodeURIComponent(location)}`;

  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(
    ev.title,
  )}&startdt=${startAt.toISOString()}&enddt=${endAt.toISOString()}&body=${encodeURIComponent(
    details,
  )}&location=${encodeURIComponent(location)}`;

  return { google, outlook };
}

export function buildIcs(ev: CalendarEvent) {
  const { startAt, endAt } = eventWindow(ev);
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MoQ Bay Area//Meetups//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${stamp(startAt)}-moqbayarea@moqbayarea.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(startAt)}`,
    `DTEND:${stamp(endAt)}`,
    `SUMMARY:${esc(ev.title)}`,
    `DESCRIPTION:${esc(ev.summary)}`,
    `LOCATION:${esc(`${ev.venue}, ${ev.city}, CA`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(ev: CalendarEvent) {
  const blob = new Blob([buildIcs(ev)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
