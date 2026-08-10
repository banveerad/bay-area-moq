import { sendTemplateEmail } from '@/lib/email-templates/send-email'
import { formatEventDate } from '@/lib/meetups'
import { calendarLinks } from '@/lib/calendar'

export interface GuestRsvpInput {
  meetupId: string
  name: string
  email: string
  linkedin?: string | null
}

export async function createGuestRsvp(input: GuestRsvpInput) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: meetup } = await supabaseAdmin
    .from('meetups')
    .select(
      'id, title, event_date, time_label, venue, city, summary, status, rsvp_count, waitlist_count, capacity',
    )
    .eq('id', input.meetupId)
    .maybeSingle()

  if (!meetup) throw new Error('That meetup no longer exists.')
  if (meetup.status === 'past' || meetup.status === 'cancelled') {
    throw new Error('This meetup is no longer taking RSVPs.')
  }

  const email = input.email.trim().toLowerCase()

  const { data: existing } = await supabaseAdmin
    .from('rsvps')
    .select('id, status')
    .eq('meetup_id', input.meetupId)
    .is('user_id', null)
    .ilike('guest_email', email)
    .maybeSingle()

  if (existing) {
    return { status: existing.status as 'going' | 'waitlist', duplicate: true as const }
  }

  const { data: inserted, error } = await supabaseAdmin
    .from('rsvps')
    .insert({
      meetup_id: input.meetupId,
      user_id: null,
      guest_name: input.name.trim(),
      guest_email: email,
      guest_linkedin: input.linkedin?.trim() || null,
    })
    .select('status')
    .single()

  if (error) throw new Error(error.message)

  const status = (inserted?.status === 'waitlist' ? 'waitlist' : 'going') as
    | 'going'
    | 'waitlist'

  const dateLabel = formatEventDate(meetup.event_date)
  const { google, outlook } = calendarLinks(meetup)
  const icsUrl = `https://moqbayarea.com/api/public/calendar/${meetup.id}.ics`
  const key = `${input.meetupId}-${email}-${status}-${Date.now()}`

  try {
    await sendTemplateEmail('rsvp-update', email, {
      idempotencyKey: `guest-rsvp-${key}`,
      templateData: {
        name: input.name.trim(),
        action: status,
        title: meetup.title,
        dateLabel,
        timeLabel: meetup.time_label,
        venue: meetup.venue,
        city: meetup.city,
        summary: meetup.summary,
        changedByOrganiser: false,
        googleUrl: google,
        outlookUrl: outlook,
        icsUrl,
      },
    })
  } catch (err) {
    console.error('guest rsvp email failed', err)
  }

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
        idempotencyKey: `guest-rsvp-admin-${admin.user_id}-${key}`,
        templateData: {
          memberName: `${input.name.trim()} (guest)`,
          memberEmail: email,
          action: status,
          title: meetup.title,
          dateLabel,
          venue: meetup.venue,
          city: meetup.city,
          goingCount: meetup.rsvp_count,
          waitlistCount: meetup.waitlist_count,
          capacity: meetup.capacity,
          byOrganiser: false,
        },
      })
    } catch (err) {
      console.error('guest rsvp organiser email failed', err)
    }
  }

  return { status, duplicate: false as const }
}
