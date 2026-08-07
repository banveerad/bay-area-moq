import { createFileRoute, Link } from "@tanstack/react-router";
import organiserPhoto from "@/assets/banashankar-veerad.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MoQ Bay Area: Who We Are" },
      {
        name: "description",
        content:
          "MoQ Bay Area is a volunteer-run tech group for Media Over QUIC: knowledge sharing, demos of what people are building, market opportunities, and open problems worth solving.",
      },
      { property: "og:title", content: "About MoQ Bay Area: Who We Are" },
      {
        property: "og:description",
        content:
          "A Bay Area community around Media Over QUIC. Talks, demos, market discussion and problem-solving, run by volunteers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const goals = [
  ["Build the community", "Get the people working on MoQ in the same room on a regular cadence."],
  ["Share what we know", "Deep dives on transport, packaging, latency and codecs, with the real details."],
  ["Cover the whole stack", "Encoding, packaging, ABR, ads, playback and QoE, not just the transport layer."],

  ["Show what you are building", "Demos over decks. Prototypes and half-finished experiments welcome."],
  ["Talk about the market", "Where MoQ wins, who is adopting it, and what nobody has built yet."],
  ["Name the hard problems", "Interop gaps, missing tooling, spec ambiguities, operational pain."],
  ["Find the solutions", "Turn those into experiments and patches, then report back next meetup."],
];

const principles = [
  ["Working code beats slideware", "Something runs on screen every night, even when it fails live."],
  ["No vendor pitches", "Talk about what you built and how it broke."],
  ["Beginners are the point", "Explain the acronym the first time you use it."],
  ["Everything gets shared", "Slides, repos and notes go out after each night."],
];


function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow">About</p>
      <h1 className="mt-4 text-4xl leading-tight">
        A tech group for the people building live video&apos;s next transport.
      </h1>

      <div className="mt-8 flex items-center gap-5 bg-surface p-6">
        <img
          src={organiserPhoto.url}
          alt="Banashankar Veerad, organiser of MoQ Bay Area"
          className="h-20 w-20 shrink-0 rounded-full object-cover"
        />
        <div>
          <p className="eyebrow">Run by</p>
          <h2 className="mt-1 font-display text-sm">
            Banashankar Veerad{" "}
            <span className="font-body text-xs font-normal text-muted-foreground">
              A video tech novice bringing great minds together
            </span>
          </h2>
          <a
            href="https://www.linkedin.com/in/banashankar-veerad-b5892923/"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 inline-block text-sm text-ember hover:underline"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>
          We are streaming engineers, transport nerds, codec people and curious newcomers
          building a real community around Media Over QUIC: sharing knowledge, showing what
          people are building, arguing about the market, and chasing the unsolved problems.
        </p>
        <p>
          MoQ is the starting point, not the whole scope. Encoding, packaging, ABR, ad
          insertion, playback and QoE all get airtime too.
        </p>
        <p>
          Volunteer-run and free. Venues are donated by Bay Area companies that care about
          the protocol. Not a users&apos; group, not a standards committee. Just a good tech
          group.
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
