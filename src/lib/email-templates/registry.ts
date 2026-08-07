import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as rsvpUpdateTemplate } from './rsvp-update'
import { template as rsvpAdminAlertTemplate } from './rsvp-admin-alert'
import { template as meetupAnnouncementTemplate } from './meetup-announcement'
import { template as contactInquiryTemplate } from './contact-inquiry'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'rsvp-update': rsvpUpdateTemplate,
  'rsvp-admin-alert': rsvpAdminAlertTemplate,
  'meetup-announcement': meetupAnnouncementTemplate,
  'contact-inquiry': contactInquiryTemplate,
}


