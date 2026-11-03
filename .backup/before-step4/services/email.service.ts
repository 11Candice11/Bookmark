import type { BookingDto } from "@bookmark/shared";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { confirmationEmail } from "../emails/confirmation.js";

// Local development sends to MailHog (SMTP on 1025, no auth, no TLS).
const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
});

export async function sendBookingConfirmation(to: string, booking: BookingDto): Promise<void> {
  const { subject, text, html } = confirmationEmail(booking);
  await transport.sendMail({ from: env.EMAIL_FROM, to, subject, text, html });
}
