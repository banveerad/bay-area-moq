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

interface Props {
  name?: string
  title?: string
  dateLabel?: string
  timeLabel?: string
  venue?: string
  city?: string
  summary?: string
  capacity?: number | null
  rsvpUrl?: string
  googleUrl?: string
  outlookUrl?: string
  icsUrl?: string
}

const Email = ({
  name,
  title = 'A new MoQ Bay Area meetup',
  dateLabel,
  timeLabel,
  venue,
  city,
  summary,
  capacity,
  rsvpUrl = 'https://moqbayarea.com/meetups',
  googleUrl,
  outlookUrl,
  icsUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New meetup: ${title}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>MoQ Bay Area</Text>
        <Heading style={h1}>A new meetup is on the calendar</Heading>
        <Text style={text}>
          {name ? `Hi ${name},` : 'Hi there,'} we just added a new evening to the
          calendar. RSVPs are open{capacity ? ` and there are ${capacity} spots` : ''} —
          grab one before it fills up.
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

        <Section style={calSection}>
          <Link href={rsvpUrl} style={cta}>
            RSVP for this meetup
          </Link>
        </Section>

        {(googleUrl || outlookUrl || icsUrl) && (
          <Section style={calSection}>
            <Text style={calLabel}>Pencil it in</Text>
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

        <Text style={footer}>
          You're getting this because you asked to hear about new meetups. Change that any
          time at{' '}
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
  subject: (data: Record<string, any>) =>
    `New MoQ Bay Area meetup — ${(data['title'] as string) ?? 'save the date'}`,
  displayName: 'New meetup announcement',
  previewData: {
    name: 'Jane',
    title: 'MoQ hack night: relays and priorities',
    dateLabel: 'Thu, Sep 10, 2026',
    timeLabel: '6:30 - 9:00 PM',
    venue: 'Cloudflare SF',
    city: 'San Francisco',
    summary: 'Two short talks, then open hacking on a shared public relay.',
    capacity: 40,
    rsvpUrl: 'https://moqbayarea.com/meetups',
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
const cta = {
  display: 'inline-block',
  backgroundColor: '#e85d3a',
  color: '#ffffff',
  fontSize: '14px',
  textDecoration: 'none',
  padding: '12px 20px',
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
