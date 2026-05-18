import "server-only"
import { resend } from "@/lib/resend"
import { env } from "@/lib/env"

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Welcome to SaaS Dash!",
      html: `<p>Hi ${escapeHtml(name)}, welcome aboard!</p>`,
    })
  } catch (error) {
    console.error("[mail.service] Failed to send welcome email:", error)
  }
}

export async function sendOrgInvitation(email: string, orgName: string, inviteLink: string) {
  // Validate inviteLink is a safe URL before embedding in email
  let safeLink: string
  try {
    const parsed = new URL(inviteLink)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Invalid protocol")
    }
    safeLink = parsed.toString()
  } catch {
    console.error("[mail.service] Rejected invalid inviteLink:", inviteLink)
    return
  }

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: `You've been invited to join ${escapeHtml(orgName)}`,
      html: `<p>You have been invited to join the <strong>${escapeHtml(orgName)}</strong> organization. Click <a href="${safeLink}">here</a> to join.</p>`,
    })
  } catch (error) {
    console.error("[mail.service] Failed to send invitation email:", error)
  }
}
