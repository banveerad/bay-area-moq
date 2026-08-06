import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

type RsvpAction = 'going' | 'waitlist' | 'cancelled' | 'removed'

interface Props {
  name?: string
  action?: RsvpAction
  title?: string
  dateLabel?: string
  timeLabel?: string
  venue?: string
  city?: string
  summary?: string
  changedByOrganiser?: boolean
  googleUrl?: string
  outlookUrl?: string
  icsUrl?: string
}

const HEADLINES: Record<RsvpAction, string> = {
  going: "You're confirmed",
  waitlist: "You're on the waitlist",
  cancelled: 'Your RSVP was cancelled',
  removed: 'Your RSVP was removed',
}

const BODY_COPY: Record<RsvpAction, string> = {
  going: 'You have a spot at this meetup. See you there.',
  waitlist:
    'This meetup is at capacity, so you are on the waitlist. If a spot opens up you will be moved up automatically and we will email you.',
  cancelled: 'Your RSVP for this meetup has been cancelled.',
  removed: 'An organiser removed your RSVP for this meetup.',
}

const Email = ({
  name,
  action = 'going',
  title = 'A MoQ Bay Area meetup',
  dateLabel,
  timeLabel,
  venue,
  city,
  summary,
  changedByOrganiser,
  googleUrl,
  outlookUrl,
  icsUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`${HEADLINES[action]} — ${title}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>MoQ Bay Area</Text>
        <Heading style={h1}>{HEADLINES[action]}</Heading>
        <Text style={text}>
          {name ? `Hi ${name},` : 'Hi there,'} {BODY_COPY[action]}
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>{title}</Text>
          {(dateLabel || timeLabel) && (
            <Text style={cardMeta}>
              {[dateLabel, timeLabel].filter(Boolean).join(' · ')}
            </Text>
          )}
          {(venue || city) && (
            <Text style={cardMeta}>{[venue, city].filter(Boolean).join(' — ')}</Text>
          )}
          {summary && <Text style={cardSummary}>{summary}</Text>}
        </Section>

        {action === 'going' && (googleUrl || outlookUrl || icsUrl) && (
          <Section style={calSection}>
            <Text style={calLabel}>Add to your calendar</Text>
            {googleUrl && (
              <Link href={googleUrl} style={calButton}>
                Google Calendar
              </Link>
            )}
            {outlookUrl && (
              <Link href={outlookUrl} style={calButton}>
                Outlook
              </Link>
            )}
            {icsUrl && (
              <Link href={icsUrl} style={calButton}>
                Apple / .ics
              </Link>
            )}
          </Section>
        )}

        {changedByOrganiser && action !== 'removed' && (
          <Text style={text}>This change was made by an organiser.</Text>
        )}

        <Text style={footer}>
          Manage your meetups any time at{' '}
          <Link href="https://moqbayarea.com/account" style={link}>
            moqbayarea.com/account
          </Link>
          .
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => {
    const action = (data['action'] as RsvpAction) ?? 'going'
    const title = (data['title'] as string) ?? 'MoQ Bay Area meetup'
    return `${HEADLINES[action]} — ${title}`
  },
  displayName: 'RSVP update (member)',
  previewData: {
    name: 'Jane',
    action: 'going',
    title: 'MoQ hack night: relays and priorities',
    dateLabel: 'Thu, Sep 10, 2026',
    timeLabel: '6:30 - 9:00 PM',
    venue: 'Cloudflare SF',
    city: 'San Francisco',
    summary: 'Two short talks, then open hacking on a shared public relay.',
    googleUrl: 'https://calendar.google.com/calendar/render',
    outlookUrl: 'https://outlook.live.com/calendar/0/deeplink/compose',
    icsUrl: 'https://moqbayarea.com/api/public/calendar/example.ics',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const eyebrow = {
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: '#e85d3a',
  margin: '0 0 12px',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  margin: '0 0 18px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const card = {
  border: '1px solid #e5e2df',
  borderLeft: '3px solid #e85d3a',
  padding: '16px 18px',
  margin: '0 0 24px',
}
const cardTitle = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  margin: '0 0 8px',
}
const cardMeta = { fontSize: '13px', color: '#55575d', margin: '0 0 4px' }
const cardSummary = { fontSize: '13px', color: '#77797d', margin: '10px 0 0' }
const link = { color: '#e85d3a', textDecoration: 'underline' }
const calSection = { margin: '0 0 24px' }
const calLabel = {
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: '#77797d',
  margin: '0 0 12px',
}
const calButton = {
  display: 'inline-block',
  border: '1px solid #e85d3a',
  color: '#e85d3a',
  fontSize: '13px',
  textDecoration: 'none',
  padding: '9px 14px',
  marginRight: '8px',
  marginBottom: '8px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '28px 0 0' }
