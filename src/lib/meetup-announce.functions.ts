import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

const inputSchema = z.object({ meetupId: z.string().uuid() })

export const announceMeetup = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    })
    if (!isAdmin) {
      const { data: isManager } = await context.supabase.rpc('is_meetup_manager', {
        _user_id: context.userId,
        _meetup_id: data.meetupId,
      })
      if (!isManager) throw new Error('Forbidden')
    }

    const { announceMeetup: run } = await import('@/lib/meetup-announce.server')
    return run(data.meetupId)
  })
