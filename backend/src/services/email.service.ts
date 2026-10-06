import nodemailer from 'nodemailer'
import { env } from '../config/env'
import { generateTicketQrBuffer } from './qr.service'

export interface TicketEmailInput {
  to: string
  attendeeName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  ticketCode: string
}

type MailTransporter = ReturnType<typeof nodemailer.createTransport>

let transporter: MailTransporter | null = null

export function isEmailEnabled(): boolean {
  return Boolean(env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASSWORD)
}

function getTransporter(): MailTransporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD },
    })
  }
  return transporter
}

function buildTicketEmail(input: TicketEmailInput): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f8fafc; padding:24px;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
      <div style="background:#7c3aed; padding:20px 24px; color:#ffffff;">
        <h1 style="margin:0; font-size:20px;">Evently</h1>
      </div>
      <div style="padding:24px; color:#111827;">
        <p style="margin:0 0 12px;">Hola ${input.attendeeName},</p>
        <p style="margin:0 0 16px;">Tu registro para el evento <strong>${input.eventTitle}</strong> ha sido confirmado.</p>
        <p style="margin:0 0 4px;">📅 <strong>Fecha:</strong> ${input.eventDate}</p>
        <p style="margin:0 0 4px;">🕐 <strong>Hora:</strong> ${input.eventTime}</p>
        <p style="margin:0 0 16px;">📍 <strong>Ubicación:</strong> ${input.eventLocation}</p>
        <p style="margin:0 0 16px;">🎟️ <strong>Código de entrada:</strong> ${input.ticketCode}</p>
        <p style="margin:0 0 8px;">Adjuntamos tu código QR:</p>
        <p style="margin:0 0 16px; text-align:center;">
          <img src="cid:ticket-qr" alt="Código QR de la entrada" width="220" style="border:1px solid #e5e7eb; border-radius:12px;" />
        </p>
        <p style="margin:24px 0 0;">¡Te esperamos en Evently!</p>
      </div>
    </div>
  </div>`
}

export async function sendTicketEmail(input: TicketEmailInput): Promise<boolean> {
  if (!isEmailEnabled()) {
    return false
  }

  try {
    const qr = await generateTicketQrBuffer(input.ticketCode)
    await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: `Tu entrada para ${input.eventTitle} - Evently`,
      html: buildTicketEmail(input),
      attachments: [{ filename: 'ticket-qr.png', content: qr, cid: 'ticket-qr' }],
    })
    return true
  } catch (error) {
    console.error('No se pudo enviar el correo de la entrada:', error)
    return false
  }
}
