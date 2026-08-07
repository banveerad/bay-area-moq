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
  email?: string
  topic?: string
  message?: string
}

const Email = ({ name, email, topic = 'General question', message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`${topic} from ${name ?? email ?? 'a visitor'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>moq+more · contact form</Text>
        <Heading style={h1}>{topic}</Heading>
        <Text style={text}>
          <strong>{name ?? 'Someone'}</strong>
          {email ? (
            <>
              {' — '}
              <Link href={`mailto:${email}`} style={link}>
                {email}
              </Link>
            </>
          ) : null}
        </Text>

        <Section style={card}>
          <Text style={cardMeta}>{message ?? '(no message)'}</Text>
        </Section>

        <Text style={footer}>Reply directly to this email to reach the sender.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => {
    const topic = (data['topic'] as string) ?? 'General question'
    const who = (data['name'] as string) ?? (data['email'] as string) ?? 'a visitor'
    return `[moq+more] ${topic} — ${who}`
  },
  displayName: 'Contact form inquiry',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    topic: 'Talk or demo pitch',
    message: 'I would love to demo our MoQ relay at the next meetup.',
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
const cardMeta = {
  fontSize: '13px',
  color: '#55575d',
  whiteSpace: 'pre-wrap' as const,
  margin: '0',
}
const link = { color: '#e85d3a', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#999999', margin: '28px 0 0' }
