import { sendTemplateEmail } from '@/lib/email-templates/send-email'
import { formatEventDate } from '@/lib/meetups'
import { calendarLinks } from '@/lib/calendar'

export type RsvpAction = 'going' | 'waitlist' | 'cancelled' | 'removed'

export interface NotifyRsvpChangeInput {
  meetupId: string
  targetUserId: string
  action: RsvpAction
  byOrganiser: boolean
}

export async function notifyRsvpChange(input: NotifyRsvpChangeInput) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: meetup } = await supabaseAdmin
    .from('meetups')
    .select(
      'id, title, event_date, time_label, venue, city, summary, rsvp_count, waitlist_count, capacity',
    )
    .eq('id', input.meetupId)
    .maybeSingle()

  if (!meetup) return { sent: false as const }

  const dateLabel = formatEventDate(meetup.event_date)
  const { google, outlook } = calendarLinks(meetup)
  const icsUrl = `https://moqbayarea.com/api/public/calendar/${meetup.id}.ics`

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('display_name')
    .eq('id', input.targetUserId)
    .maybeSingle()

  const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(
    input.targetUserId,
  )
  const memberEmail = targetUser?.user?.email ?? null
  const memberName = profile?.display_name ?? null

  const key = `${input.meetupId}-${input.targetUserId}-${input.action}-${Date.now()}`

  if (memberEmail) {
    try {
      await sendTemplateEmail('rsvp-update', memberEmail, {
        idempotencyKey: `rsvp-update-${key}`,
        templateData: {
          name: memberName,
          action: input.action,
          title: meetup.title,
          dateLabel,
          timeLabel: meetup.time_label,
          venue: meetup.venue,
          city: meetup.city,
          summary: meetup.summary,
          changedByOrganiser: input.byOrganiser,
          googleUrl: google,
          outlookUrl: outlook,
          icsUrl,
        },
      })
    } catch (error) {
      console.error('rsvp member email failed', error)
    }
  }

  // Notify organisers
  const { data: admins } = await supabaseAdmin
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')

  for (const admin of admins ?? []) {
    const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(admin.user_id)
    const adminEmail = adminUser?.user?.email
    if (!adminEmail) continue
    try {
      await sendTemplateEmail('rsvp-admin-alert', adminEmail, {
        idempotencyKey: `rsvp-admin-${admin.user_id}-${key}`,
        templateData: {
          memberName,
          memberEmail,
          action: input.action,
          title: meetup.title,
          dateLabel,
          venue: meetup.venue,
          city: meetup.city,
          goingCount: meetup.rsvp_count,
          waitlistCount: meetup.waitlist_count,
          capacity: meetup.capacity,
          byOrganiser: input.byOrganiser,
        },
      })
    } catch (error) {
      console.error('rsvp organiser email failed', error)
    }
  }

  return { sent: true as const }
}
