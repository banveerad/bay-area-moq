import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { verifyTurnstile } from '@/lib/turnstile.server'

const inputSchema = z.object({
  meetupId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  linkedin: z
    .string()
    .trim()
    .max(255)
    .refine((v) => v === '' || /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(v), {
      message: 'Enter a full LinkedIn profile URL.',
    })
    .optional(),
  captchaToken: z.string().min(1),
})

export const guestRsvp = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const ok = await verifyTurnstile(data.captchaToken)
    if (!ok) throw new Error('Captcha verification failed. Please try again.')

    const { createGuestRsvp } = await import('@/lib/guest-rsvp.server')
    return createGuestRsvp({
      meetupId: data.meetupId,
      name: data.name,
      email: data.email,
      linkedin: data.linkedin ?? null,
    })
  })
