import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/what-is-moq")({
  head: () => ({
    meta: [
      { title: "What is Media Over QUIC? A Plain-English Primer" },
      {
        name: "description",
        content:
          "Media Over QUIC (MoQ) is a publish/subscribe transport for live video built on QUIC. How it works, how it differs from HLS and WebRTC, and where it is headed.",
      },
      { property: "og:title", content: "What is Media Over QUIC? A Plain-English Primer" },
      {
        property: "og:description",
        content:
          "How MoQ moves live media through relays over QUIC, and how it compares with HLS, LL-DASH and WebRTC.",
      },
    ],
  }),
  component: WhatIsMoqPage,
});

const comparisons = [
  {
    name: "HLS / LL-DASH",
    latency: "2–10s",
    note: "Segments over HTTP. Scales beautifully, buffers badly.",
  },
  {
    name: "WebRTC",
    latency: "<500ms",
    note: "Great for calls. Fan-out and media pipelines get expensive.",
  },
  {
    name: "MoQ",
    latency: "<200ms target",
    note: "Pub/sub over QUIC, cacheable through relays, one stack for both.",
  },
];

function WhatIsMoqPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow">Primer</p>
      <h1 className="mt-4 text-4xl leading-tight">What is Media Over QUIC?</h1>

      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Media Over QUIC — MoQ — is an IETF effort to move live media with a
          publish/subscribe model that runs directly on QUIC. Publishers push named
          tracks made of objects and groups; subscribers ask a relay for the tracks they
          want; the relay fans them out and can drop or reprioritise data when the
          network gets tight.
        </p>
        <p>
          The point is to stop choosing between the two bad options. Segmented HTTP
          streaming scales to millions but adds seconds of latency. Real-time stacks are
          fast but were designed for conversations, not broadcast fan-out. MoQ aims for
          one transport that a relay network can cache and a live encoder can drive at
          conversational latency.
        </p>
      </div>

      <h2 className="mt-14 text-2xl">The shape of it</h2>
      <ol className="mt-6 space-y-px border border-border bg-border">
        {[
          ["Track", "A named stream of media — a video layer, an audio channel, timed metadata."],
          ["Group", "An independently decodable chunk, roughly a GoP. The unit of recovery."],
          ["Object", "A frame-sized payload inside a group, with its own priority."],
          ["Relay", "Subscribes upstream, fans out downstream, drops what it must."],
        ].map(([term, def], i) => (
          <li key={term} className="bg-surface p-6">
            <p className="font-display text-sm text-ember">
              {String(i + 1).padStart(2, "0")} — {term}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{def}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-2xl">How it compares</h2>
      <div className="mt-6 divide-y divide-border border-y border-border">
        {comparisons.map((c) => (
          <div key={c.name} className="grid gap-2 py-5 sm:grid-cols-[1fr_160px]">
            <div>
              <p className="font-display text-sm">{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
            </div>
            <p className="font-display text-sm text-ember sm:text-right">{c.latency}</p>
          </div>
        ))}
      </div>

      <p className="mt-14 border-l-2 border-ember bg-surface p-6 text-sm text-muted-foreground">
        It is still a draft. Interop breaks, APIs move, and opinions differ — which is
        precisely why the meetups exist.
      </p>
    </div>
  );
}
