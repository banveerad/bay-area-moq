import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact MoQ Bay Area — Organisers, Venues & Talks" },
      {
        name: "description",
        content:
          "Reach the MoQ Bay Area organisers about hosting a meetup, pitching a talk or demo, or asking a question about Media Over QUIC.",
      },
      { property: "og:title", content: "Contact MoQ Bay Area — Organisers, Venues & Talks" },
      {
        property: "og:description",
        content:
          "Email the organisers about venues, talks, demos or general Media Over QUIC questions.",
      },
    ],
  }),
  component: ContactPage,
});




const topics = ["General question", "Talk or demo pitch", "Offering a venue", "Something else"];

function ContactPage() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");

  const mailto = `mailto:hello@moqbayarea.dev?subject=${encodeURIComponent(
    `[MoQ Bay Area] ${topic}`,
  )}&body=${encodeURIComponent(`${message}\n\n— ${name}`)}`;

  return (
    <div className="mx-auto max-w-4xl px-5 py-20">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-4 text-4xl leading-tight">Get in touch</h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        Organisers read everything, usually within a day or two. If it is urgent and it is
        meetup night, the chat is faster than email.
      </p>

      <div className="mt-12 max-w-xl">
        <form

          className="space-y-5 border border-border bg-surface p-7"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = mailto;
          }}
        >
          <div>
            <label
              htmlFor="name"
              className="font-display text-xs tracking-widest text-muted-foreground uppercase"
            >
              Your name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ember"
            />
          </div>
          <div>
            <label
              htmlFor="topic"
              className="font-display text-xs tracking-widest text-muted-foreground uppercase"
            >
              Topic
            </label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ember"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="message"
              className="font-display text-xs tracking-widest text-muted-foreground uppercase"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="mt-2 w-full resize-y border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ember"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-ember px-6 py-3 font-display text-sm text-primary-foreground transition-colors hover:bg-ember-soft"
          >
            Open in email
          </button>
          <p className="text-xs text-muted-foreground">
            This opens your own mail client with the message ready to send — nothing is
            stored here.
          </p>
        </form>
      </div>
    </div>
  );
}
