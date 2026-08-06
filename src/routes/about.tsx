import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MoQ Bay Area — Who We Are" },
      {
        name: "description",
        content:
          "MoQ Bay Area is a volunteer-run group of streaming engineers, protocol folks and codec people meeting across SF, Oakland and the South Bay to build with Media Over QUIC.",
      },
      { property: "og:title", content: "About MoQ Bay Area — Who We Are" },
      {
        property: "og:description",
        content:
          "How this volunteer-run Media Over QUIC community started, how meetups run, and the house rules.",
      },
    ],
  }),
  component: AboutPage,
});

const principles = [
  [
    "Working code beats slideware",
    "Every meetup has something running on screen, even when it fails live. Especially then.",
  ],
  [
    "No vendor pitches",
    "Talk about what you built and how it broke. Product decks go somewhere else.",
  ],
  [
    "Beginners are the point",
    "Half the room has never opened a QUIC trace. Explain the acronym the first time you use it.",
  ],
  [
    "Everything gets shared",
    "Slides, repos and notes go out to the list after each night so people who missed it can catch up.",
  ],
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow">About</p>
      <h1 className="mt-4 text-4xl leading-tight">
        A few engineers, one draft spec, and a lot of arguing.
      </h1>

      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          MoQ Bay Area started the way these things usually do: a hallway conversation
          after a conference talk, a group chat, and then someone offering a room with a
          projector. We are streaming engineers, transport nerds, codec people and a
          steady stream of curious newcomers who want to understand where live video is
          heading before it arrives.
        </p>
        <p>
          The group is volunteer-run and free. Venues are donated by companies in the
          Bay who care about the protocol; food is whatever the host can swing. Nobody
          is paid, nothing is sponsored content, and the organisers rotate so it does not
          collapse when one person gets busy.
        </p>
      </div>

      <h2 className="mt-14 text-2xl">How a night runs</h2>
      <ol className="mt-6 space-y-px border border-border bg-border">
        {[
          ["6:00", "Doors, food, and the awkward name-tag portion."],
          ["6:45", "One longer talk — usually 20 minutes on a specific piece of the stack."],
          ["7:20", "Lightning demos. Five minutes, half-working software encouraged."],
          ["8:00", "Open hacking against the shared relay until the venue closes."],
        ].map(([time, what]) => (
          <li key={time} className="grid gap-2 bg-surface p-6 sm:grid-cols-[90px_1fr]">
            <p className="font-display text-sm text-ember">{time}</p>
            <p className="text-sm text-muted-foreground">{what}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-2xl">House rules</h2>
      <div className="mt-6 grid gap-px bg-border sm:grid-cols-2">
        {principles.map(([title, body]) => (
          <div key={title} className="bg-surface p-6">
            <h3 className="font-display text-sm">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <p className="mt-14 border-l-2 border-ember bg-surface p-6 text-sm text-muted-foreground">
        Want to host, speak, or just find out when the next one is?{" "}
        <Link to="/contact" className="text-ember hover:underline">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
