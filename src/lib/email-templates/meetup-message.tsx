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
  message?: string
  meetupUrl?: string
  fromName?: string
}

const Email = ({
  name,
  title = 'A MoQ Bay Area meetup',
  dateLabel,
  timeLabel,
  venue,
  city,
  message = '',
  meetupUrl = 'https://moqbayarea.com/meetups',
  fromName,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Update for ${title}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>MoQ Bay Area</Text>
        <Heading style={h1}>A note about your meetup</Heading>
        <Text style={text}>
          {name ? `Hi ${name},` : 'Hi there,'} here's an update from the organisers
          {fromName ? ` (${fromName})` : ''} about a meetup you signed up for.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>{title}</Text>
          {(dateLabel || timeLabel) && (
            <Text style={cardMeta}>{[dateLabel, timeLabel].filter(Boolean).join(' · ')}</Text>
          )}
          {(venue || city) && (
            <Text style={cardMeta}>{[venue, city].filter(Boolean).join(' — ')}</Text>
          )}
        </Section>

        <Text style={messageStyle}>{message}</Text>

        <Section style={calSection}>
          <Link href={meetupUrl} style={cta}>
            View the meetup
          </Link>
        </Section>

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
  subject: (data: Record<string, any>) =>
    `Update — ${(data['title'] as string) ?? 'MoQ Bay Area meetup'}`,
  displayName: 'Custom message to attendees',
  previewData: {
    name: 'Jane',
    title: 'MoQ hack night: relays and priorities',
    dateLabel: 'Thu, Sep 10, 2026',
    timeLabel: '6:30 - 9:00 PM',
    venue: 'Cloudflare SF',
    city: 'San Francisco',
    message: 'Heads up: badge pickup is on the 2nd floor. Doors open at 6:15.',
    meetupUrl: 'https://moqbayarea.com/meetups',
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
const messageStyle = {
  fontSize: '14px',
  color: '#1a1a1a',
  lineHeight: '1.6',
  whiteSpace: 'pre-line' as const,
  margin: '0 0 24px',
}
const link = { color: '#e85d3a', textDecoration: 'underline' }
const calSection = { margin: '0 0 24px' }
const cta = {
  display: 'inline-block',
  backgroundColor: '#e85d3a',
  color: '#ffffff',
  fontSize: '14px',
  textDecoration: 'none',
  padding: '12px 20px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '28px 0 0' }
