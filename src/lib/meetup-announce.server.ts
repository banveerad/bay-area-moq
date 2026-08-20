import { sendTemplateEmail } from '@/lib/email-templates/send-email'
import { formatEventDate } from '@/lib/meetups'
import { calendarLinks } from '@/lib/calendar'

export async function announceMeetup(meetupId: string) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: meetup } = await supabaseAdmin
    .from('meetups')
    .select('id, title, event_date, time_label, venue, city, summary, capacity, is_draft')
    .eq('id', meetupId)
    .maybeSingle()

  if (!meetup) throw new Error('Meetup not found')
  if (meetup.is_draft) throw new Error('Mark the meetup as ready before notifying members')


  const dateLabel = formatEventDate(meetup.event_date)
  const { google, outlook } = calendarLinks(meetup)
  const icsUrl = `https://moqbayarea.com/api/public/calendar/${meetup.id}.ics`

  const { data: subscribers } = await supabaseAdmin
    .from('profiles')
    .select('id, display_name')
    .eq('notify_new_meetups', true)

  let sent = 0
  let skipped = 0

  for (const profile of subscribers ?? []) {
    const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(profile.id)
    const email = userRes?.user?.email
    if (!email) {
      skipped += 1
      continue
    }
    try {
      const result = await sendTemplateEmail('meetup-announcement', email, {
        idempotencyKey: `meetup-announcement-${meetup.id}-${profile.id}`,
        templateData: {
          name: profile.display_name,
          title: meetup.title,
          dateLabel,
          timeLabel: meetup.time_label,
          venue: meetup.venue,
          city: meetup.city,
          summary: meetup.summary,
          capacity: meetup.capacity,
          rsvpUrl: `https://moqbayarea.com/meetups/${meetup.id}`,
          googleUrl: google,
          outlookUrl: outlook,
          icsUrl,
        },
      })
      if (result?.sent) sent += 1
      else skipped += 1
    } catch (error) {
      console.error('meetup announcement failed', error)
      skipped += 1
    }
  }

  await supabaseAdmin
    .from('meetups')
    .update({ announced_at: new Date().toISOString() })
    .eq('id', meetup.id)

  return { sent, skipped }
}
