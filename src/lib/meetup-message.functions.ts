import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

const inputSchema = z.object({
  meetupId: z.string().uuid(),
  message: z.string().trim().min(5).max(4000),
  audience: z.enum(['going', 'waitlist', 'all']),
})

export const messageAttendees = createServerFn({ method: 'POST' })
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

    const { data: profile } = await context.supabase
      .from('profiles')
      .select('display_name')
      .eq('id', context.userId)
      .maybeSingle()

    const { messageAttendees: run } = await import('@/lib/meetup-message.server')
    return run({
      meetupId: data.meetupId,
      message: data.message,
      audience: data.audience,
      fromName: profile?.display_name ?? null,
    })
  })
