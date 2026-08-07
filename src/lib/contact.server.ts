import { sendTemplateEmail } from '@/lib/email-templates/send-email'

export interface ContactInquiry {
  name: string
  email: string
  topic: string
  message: string
}

export async function sendContactInquiry(input: ContactInquiry) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

  const { data: admins } = await supabaseAdmin
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')

  const key = `contact-${Date.now()}-${input.email}`
  let delivered = 0

  for (const admin of admins ?? []) {
    const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(admin.user_id)
    const adminEmail = adminUser?.user?.email
    if (!adminEmail) continue
    try {
      const result = await sendTemplateEmail('contact-inquiry', adminEmail, {
        idempotencyKey: `${key}-${admin.user_id}`,
        replyTo: input.email,
        templateData: {
          name: input.name,
          email: input.email,
          topic: input.topic,
          message: input.message,
        },
      })
      if (result.sent) delivered += 1
    } catch (err) {
      console.error('contact inquiry send failed', err)
    }
  }

  return { delivered }
}
