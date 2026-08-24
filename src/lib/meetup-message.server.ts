import { sendTemplateEmail } from '@/lib/email-templates/send-email'
import { formatEventDate } from '@/lib/meetups'

export type MessageAudience = 'going' | 'waitlist' | 'all'

export async function messageAttendees(input: {
  meetupId: string
  message: string
  audience: MessageAudience
  fromName?: string | null
}) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: meetup } = await supabaseAdmin
    .from('meetups')
    .select('id, title, event_date, time_label, venue, city')
    .eq('id', input.meetupId)
    .maybeSingle()

  if (!meetup) throw new Error('Meetup not found')

  let query = supabaseAdmin
    .from('rsvps')
    .select('user_id, status')
    .eq('meetup_id', input.meetupId)
    .not('user_id', 'is', null)

  if (input.audience !== 'all') query = query.eq('status', input.audience)

  const { data: rsvps } = await query

  const dateLabel = formatEventDate(meetup.event_date)
  const stamp = Date.now()
  let sent = 0
  let skipped = 0

  for (const rsvp of rsvps ?? []) {
    if (!rsvp.user_id) {
      skipped += 1
      continue
    }
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('display_name')
      .eq('id', rsvp.user_id)
      .maybeSingle()
    const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(rsvp.user_id)
    const email = userRes?.user?.email
    if (!email) {
      skipped += 1
      continue
    }
    try {
      const result = await sendTemplateEmail('meetup-message', email, {
        idempotencyKey: `meetup-message-${meetup.id}-${rsvp.user_id}-${stamp}`,
        templateData: {
          name: profile?.display_name,
          title: meetup.title,
          dateLabel,
          timeLabel: meetup.time_label,
          venue: meetup.venue,
          city: meetup.city,
          message: input.message,
          meetupUrl: `https://moqbayarea.com/meetups/${meetup.id}`,
          fromName: input.fromName ?? undefined,
        },
      })
      if (result?.sent) sent += 1
      else skipped += 1
    } catch (error) {
      console.error('meetup message failed', error)
      skipped += 1
    }
  }

  return { sent, skipped }
}
