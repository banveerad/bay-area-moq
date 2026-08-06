import { useState } from "react";
import { calendarLinks, downloadIcs, type CalendarEvent } from "@/lib/calendar";

const itemClass =
  "block w-full px-4 py-2 text-left font-display text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:bg-ember hover:text-background";

export function AddToCalendar({
  event,
  align = "left",
}: {
  event: CalendarEvent;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const links = calendarLinks(event);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="border border-border px-4 py-2 font-display text-xs tracking-widest uppercase text-muted-foreground transition-colors hover:border-ember hover:text-ember"
      >
        + Add to calendar
      </button>
      {open && (
        <div
          className={`absolute z-20 mt-1 w-52 border border-border bg-surface py-1 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <a
            href={links.google}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            Google Calendar
          </a>
          <a
            href={links.outlook}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            Outlook
          </a>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              downloadIcs(event);
              setOpen(false);
            }}
          >
            Apple / .ics
          </button>
        </div>
      )}
    </div>
  );
}
