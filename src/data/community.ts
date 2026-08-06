export type Meetup = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  summary: string;
  status: "open" | "waitlist" | "past";
};

export const meetups: Meetup[] = [
  {
    id: "moq-sf-01",
    title: "MoQ Night 01 — Relays, Tracks & Sub-second Latency",
    date: "Thu, Sep 17 2026",
    time: "6:30 – 9:00 PM",
    venue: "Cloudflare, 101 Townsend St",
    city: "San Francisco",
    summary:
      "Kickoff meetup. A walkthrough of the moq-transport draft, then two live demos pushing tracks through a public relay.",
    status: "open",
  },
  {
    id: "moq-oak-02",
    title: "Hack Night — Build a Publisher in 90 Minutes",
    date: "Wed, Oct 7 2026",
    time: "6:00 – 9:30 PM",
    venue: "Temescal Works, Oakland",
    city: "Oakland",
    summary:
      "Bring a laptop. We pair up and ship a WebTransport publisher and player against a shared relay, with mentors on hand.",
    status: "open",
  },
  {
    id: "moq-pa-03",
    title: "Encoding Deep Dive — LOC, CMAF & Frame-level Packaging",
    date: "Tue, Nov 3 2026",
    time: "6:30 – 9:00 PM",
    venue: "Palo Alto Research Loft",
    city: "Palo Alto",
    summary:
      "How media gets carved into objects and groups, and what that means for congestion response and playback buffers.",
    status: "waitlist",
  },
  {
    id: "moq-sj-04",
    title: "Field Notes — Running MoQ in Production",
    date: "Thu, Jul 9 2026",
    time: "6:30 – 9:00 PM",
    venue: "San Jose Tech Annex",
    city: "San Jose",
    summary:
      "Three teams shared what broke first: relay fan-out, priority inversion, and QUIC on flaky mobile networks.",
    status: "past",
  },
];

export const resources = [
  {
    group: "Specs & drafts",
    items: [
      {
        label: "IETF moq Working Group",
        href: "https://datatracker.ietf.org/wg/moq/about/",
        note: "Charter, drafts and mailing list archive.",
      },
      {
        label: "moq-transport draft",
        href: "https://datatracker.ietf.org/doc/draft-ietf-moq-transport/",
        note: "The core publish/subscribe transport over QUIC.",
      },
      {
        label: "WebTransport (W3C)",
        href: "https://www.w3.org/TR/webtransport/",
        note: "The browser-side API most MoQ demos build on.",
      },
    ],
  },
  {
    group: "Open source to run tonight",
    items: [
      {
        label: "moq-rs",
        href: "https://github.com/cloudflare/moq-rs",
        note: "Rust relay and CLI tools — the usual starting point.",
      },
      {
        label: "moq-js",
        href: "https://github.com/kixelated/moq-js",
        note: "Browser publisher and player written in TypeScript.",
      },
      {
        label: "quic-go",
        href: "https://github.com/quic-go/quic-go",
        note: "Handy when you want to poke at the QUIC layer directly.",
      },
    ],
  },
  {
    group: "Talks & background",
    items: [

      {
        label: "QUIC, explained (RFC 9000)",
        href: "https://www.rfc-editor.org/rfc/rfc9000.html",
        note: "The transport everything here sits on top of.",
      },
    ],
  },
];
