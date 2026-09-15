import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

const inputSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(200),
})

/**
 * Returns email addresses for the given member ids.
 * Admins can look up anyone; meetup managers only get emails for users who
 * RSVP'd to a meetup they manage.
 */
export const getMemberEmails = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    })

    let allowedIds = data.userIds

    if (!isAdmin) {
      const { data: managed } = await context.supabase
        .from('meetup_managers')
        .select('meetup_id')
        .eq('user_id', context.userId)
      const meetupIds = (managed ?? []).map((m) => m.meetup_id)
      if (meetupIds.length === 0) throw new Error('Forbidden')

      const { data: rsvps } = await context.supabase
        .from('rsvps')
        .select('user_id')
        .in('meetup_id', meetupIds)
        .in('user_id', data.userIds)
      const visible = new Set((rsvps ?? []).map((r) => r.user_id).filter(Boolean))
      allowedIds = data.userIds.filter((id) => visible.has(id))
      if (allowedIds.length === 0) throw new Error('Forbidden')
    }

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const emails: Record<string, string> = {}
    for (const id of allowedIds) {
      const { data: res } = await supabaseAdmin.auth.admin.getUserById(id)
      if (res?.user?.email) emails[id] = res.user.email
    }
    return emails
  })
