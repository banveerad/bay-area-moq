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
  memberName?: string
  memberEmail?: string
  action?: RsvpAction
  title?: string
  dateLabel?: string
  venue?: string
  city?: string
  goingCount?: number
  waitlistCount?: number
  capacity?: number | null
  byOrganiser?: boolean
}

const ACTION_LABEL: Record<RsvpAction, string> = {
  going: 'RSVP confirmed',
  waitlist: 'Joined waitlist',
  cancelled: 'RSVP cancelled',
  removed: 'RSVP removed by organiser',
}

const Email = ({
  memberName,
  memberEmail,
  action = 'going',
  title = 'A MoQ Bay Area meetup',
  dateLabel,
  venue,
  city,
  goingCount,
  waitlistCount,
  capacity,
  byOrganiser,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`${ACTION_LABEL[action]}: ${memberName ?? memberEmail ?? 'A member'} — ${title}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>MoQ Bay Area · organisers</Text>
        <Heading style={h1}>{ACTION_LABEL[action]}</Heading>
        <Text style={text}>
          <strong>{memberName ?? memberEmail ?? 'A member'}</strong>
          {memberEmail && memberName ? ` (${memberEmail})` : ''} — {title}
          {byOrganiser ? ' (changed by an organiser)' : ''}
        </Text>

        <Section style={card}>
          {(dateLabel || venue || city) && (
            <Text style={cardMeta}>
              {[dateLabel, venue, city].filter(Boolean).join(' · ')}
            </Text>
          )}
          <Text style={cardMeta}>
            Going: {goingCount ?? '—'}
            {capacity ? ` / ${capacity}` : ''} · Waitlist: {waitlistCount ?? 0}
          </Text>
        </Section>

        <Text style={footer}>
          Manage the roster at{' '}
          <Link href="https://moqbayarea.com/admin/meetups" style={link}>
            moqbayarea.com/admin/meetups
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
    const who = (data['memberName'] as string) ?? (data['memberEmail'] as string) ?? 'A member'
    const title = (data['title'] as string) ?? 'MoQ Bay Area meetup'
    return `${ACTION_LABEL[action]}: ${who} — ${title}`
  },
  displayName: 'RSVP change (organiser alert)',
  previewData: {
    memberName: 'Jane Doe',
    memberEmail: 'jane@example.com',
    action: 'waitlist',
    title: 'MoQ hack night: relays and priorities',
    dateLabel: 'Thu, Sep 10, 2026',
    venue: 'Cloudflare SF',
    city: 'San Francisco',
    goingCount: 20,
    waitlistCount: 3,
    capacity: 20,
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
  fontSize: '20px',
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
  padding: '14px 18px',
  margin: '0 0 24px',
}
const cardMeta = { fontSize: '13px', color: '#55575d', margin: '0 0 4px' }
const link = { color: '#e85d3a', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#999999', margin: '28px 0 0' }
