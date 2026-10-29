import 'server-only'

import nodemailer from 'nodemailer'
import { prisma } from '@/lib/db'
import { getServerUrl } from '@/lib/seo'
import { leadEmail, smtpConfig } from './lead-email'

/**
 * Emails a new contact message to the "Notification email" in Site settings (or the public email).
 * The result is written on the message, so nothing is lost silently: notifiedAt when sent, notifyError
 * when it could not be sent (shown in /admin/messages). The message itself is already saved.
 */
export async function notifyLead(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) return
  const fail = (reason: string) => prisma.lead.update({ where: { id: leadId }, data: { notifyError: reason.slice(0, 500) } })

  const smtp = smtpConfig()
  if (!smtp) {
    await fail('Email is not set up (SMTP_* in .env), so this message was not emailed. It is only here.')
    return
  }
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { notificationEmail: true, publicEmail: true, companyName: true } })
  const to = settings?.notificationEmail || settings?.publicEmail
  if (!to) {
    await fail('No notification email is set in Site settings, so this message was not emailed.')
    return
  }
  try {
    const mail = leadEmail(lead, { siteUrl: getServerUrl(), companyName: settings?.companyName || 'BrightLink' })
    const transport = nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.secure, auth: smtp.auth, connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000 })
    await transport.sendMail({ from: smtp.from, to, replyTo: mail.replyTo, subject: mail.subject, text: mail.text, html: mail.html })
    await prisma.lead.update({ where: { id: leadId }, data: { notifiedAt: new Date(), notifyError: null } })
  } catch (error) {
    console.error('[contact] notification email failed', error)
    await fail(`Sending the email failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
