import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const inputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  topic: z.string().trim().min(1).max(80),
  message: z.string().trim().min(5).max(4000),
  captchaToken: z.string().min(1).max(2048),
})

export const sendContactMessage = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { verifyTurnstile } = await import('@/lib/turnstile.server')
    const ok = await verifyTurnstile(data.captchaToken)
    if (!ok) throw new Error('captcha_failed')

    const { sendContactInquiry } = await import('@/lib/contact.server')
    const { captchaToken: _token, ...payload } = data
    return sendContactInquiry(payload)
  })
