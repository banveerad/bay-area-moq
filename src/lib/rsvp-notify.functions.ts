import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

const inputSchema = z.object({
  meetupId: z.string().uuid(),
  action: z.enum(['going', 'waitlist', 'cancelled', 'removed']),
  targetUserId: z.string().uuid().optional(),
})

export const notifyRsvpChange = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const targetUserId = data.targetUserId ?? context.userId
    let byOrganiser = false

    if (targetUserId !== context.userId) {
      const { data: isAdmin } = await context.supabase.rpc('has_role', {
        _user_id: context.userId,
        _role: 'admin',
      })
      if (!isAdmin) throw new Error('Forbidden')
      byOrganiser = true
    }

    const { notifyRsvpChange: run } = await import('@/lib/rsvp-notify.server')
    return run({
      meetupId: data.meetupId,
      targetUserId,
      action: data.action,
      byOrganiser,
    })
  })
