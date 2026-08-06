import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — MoQ Bay Area" },
      {
        name: "description",
        content:
          "Terms and conditions for MoQ Bay Area member accounts, meetup attendance, and community conduct.",
      },
      { property: "og:title", content: "Terms & Conditions — MoQ Bay Area" },
      {
        property: "og:description",
        content: "Membership terms, code of conduct, and privacy basics for the MoQ Bay Area community.",
      },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    heading: "1. Membership",
    body: [
      "A MoQ Bay Area account is free and exists so you can RSVP to meetups and keep a member profile. You are responsible for the accuracy of the information you provide and for keeping your credentials secure.",
      "You must be at least 16 years old to create an account. We may suspend or remove accounts that violate these terms or our code of conduct.",
    ],
  },
  {
    heading: "2. Code of conduct",
    body: [
      "This is a technical community. Be respectful, assume good faith, and keep discussion focused on Media Over QUIC, streaming, and adjacent engineering topics.",
      "No harassment, discrimination, or personal attacks. No vendor pitches during talks or hack time. Organizers may ask anyone not following these rules to leave an event or the community.",
    ],
  },
  {
    heading: "3. Events and RSVPs",
    body: [
      "RSVPs help hosts plan space, food, and capacity. Please cancel if your plans change. Venues are donated by community members, so follow any additional venue rules while on site.",
      "Attendance is at your own risk. MoQ Bay Area and hosting venues are not liable for loss, injury, or damage arising from attendance.",
    ],
  },
  {
    heading: "4. Content you share",
    body: [
      "Talks, demos, and code you present remain yours. By presenting you allow us to list your name, talk title, and a short description on this site.",
      "Photos or recordings may be taken at events. Tell an organizer if you prefer not to appear in them.",
    ],
  },
  {
    heading: "5. Privacy",
    body: [
      "We store only what your account needs: your email, and any display name, company, and interests you choose to add. We do not sell member data or share it with advertisers.",
      "You can edit your profile at any time from your account page, and you can ask us to delete your account and profile data by contacting the organizers.",
    ],
  },
  {
    heading: "6. Changes",
    body: [
      "These terms may change as the community grows. Material changes will be announced on the site. Continuing to use your account after a change means you accept the updated terms.",
    ],
  },
];

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 text-4xl leading-tight">Terms &amp; Conditions</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated August 2026. Plain-language terms for a volunteer-run, community meetup group.
      </p>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-lg tracking-tight">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 border border-border bg-surface p-6 text-sm text-muted-foreground">
        Questions about these terms? Reach the organizers from the{" "}
        <a href="/contact" className="text-ember hover:underline">
          contact page
        </a>
        .
      </div>
    </div>
  );
}
