import { getRequestIP } from '@tanstack/react-start/server'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env['TURNSTILE_SECRET_KEY']
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not configured')
    return false
  }

  const body = new URLSearchParams({ secret, response: token })
  try {
    const ip = getRequestIP({ xForwardedFor: true })
    if (ip) body.set('remoteip', ip)
  } catch {
    // no request context — fine, remoteip is optional
  }

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body })
    const json = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    if (!json.success) {
      console.error('turnstile verification failed', json['error-codes'])
    }
    return Boolean(json.success)
  } catch (err) {
    console.error('turnstile verification error', err)
    return false
  }
}
