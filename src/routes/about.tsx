import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MoQ Bay Area — Who We Are" },
      {
        name: "description",
        content:
          "MoQ Bay Area is a volunteer-run tech group for Media Over QUIC: knowledge sharing, demos of what people are building, market opportunities, and open problems worth solving.",
      },
      { property: "og:title", content: "About MoQ Bay Area — Who We Are" },
      {
        property: "og:description",
        content:
          "A Bay Area community around Media Over QUIC — talks, demos, market discussion and problem-solving, run by volunteers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const goals = [
  [
    "Build the community",
    "Put the people working on Media Over QUIC in the same room on a regular cadence — engineers, researchers, product folks and newcomers alike.",
  ],
  [
    "Share what we know",
    "Deep dives on transport, packaging, latency and codecs. Bring the trace, the graph, the ugly workaround — the useful details live there.",
  ],
  [
    "Show what you are building",
    "Demos over decks. Prototypes, side projects and half-finished experiments are all fair game, working or not.",
  ],
  [
    "Talk about the market",
    "Where MoQ actually wins, who is adopting it, what it displaces, and which use cases are still waiting for someone to build them.",
  ],
  [
    "Name the hard problems",
    "Interop gaps, missing tooling, spec ambiguities, operational pain. We write them down instead of rediscovering them.",
  ],
  [
    "Find the solutions",
    "Turn those problems into experiments, patches, docs and follow-up sessions — and report back at the next meetup.",
  ],
];

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
        A tech group for the people building live video&apos;s next transport.
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
          The goal is simple: build a real community around Media Over QUIC. That means
          sharing knowledge, showing what people are actually building, arguing about the
          market opportunity, and naming the problems nobody has solved yet — then
          chasing them down together. Not a users&apos; group for one product, not a
          standards committee. Just a good tech group.
        </p>
        <p>
          It is volunteer-run and free. Venues are donated by companies in the Bay who
          care about the protocol; food is whatever the host can swing. Nobody is paid,
          nothing is sponsored content, and the organisers rotate so it does not collapse
          when one person gets busy.
        </p>
      </div>

      <h2 className="mt-14 text-2xl">What we are here to do</h2>
      <div className="mt-6 grid gap-px bg-border sm:grid-cols-2">
        {goals.map(([title, body]) => (
          <div key={title} className="bg-surface p-6">
            <h3 className="font-display text-sm">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

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
        Want to host, speak, demo something, or just find out when the next one is?{" "}
        <Link to="/contact" className="text-ember hover:underline">
          Get in touch
        </Link>
        .
      </p>

    </div>
  );
}
