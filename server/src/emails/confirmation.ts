import { BOOKING_REASON_LABELS, BRANCH_TIME_ZONE, type BookingDto } from "@bookmark/shared";

const dateFormat = new Intl.DateTimeFormat("en-ZA", {
  timeZone: BRANCH_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-ZA", {
  timeZone: BRANCH_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function confirmationEmail(booking: BookingDto) {
  const start = new Date(booking.startsAt);
  const end = new Date(booking.endsAt);
  const when = `${dateFormat.format(start)}, ${timeFormat.format(start)} to ${timeFormat.format(end)}`;
  const reason = BOOKING_REASON_LABELS[booking.reason];
  const { branch } = booking;

  const subject = `Your appointment is confirmed (${booking.reference})`;

  const text = [
    `Hi ${booking.fullName},`,
    "",
    "Your appointment is confirmed.",
    "",
    `Reference: ${booking.reference}`,
    `When:      ${when}`,
    `Where:     ${branch.name}, ${branch.address}`,
    branch.primaryNumber ? `Phone:     ${branch.primaryNumber}` : null,
    `Service:   ${reason}`,
    "",
    "Please bring your ID and quote your reference when you arrive.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#64748b">${label}</td><td style="padding:4px 0"><strong>${escapeHtml(value)}</strong></td></tr>`;

  const html = `<!doctype html>
<html>
  <body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a;line-height:1.5">
    <h1 style="font-size:20px">Your appointment is confirmed</h1>
    <p>Hi ${escapeHtml(booking.fullName)},</p>
    <table style="border-collapse:collapse">
      ${row("Reference", booking.reference)}
      ${row("When", when)}
      ${row("Where", `${branch.name}, ${branch.address}`)}
      ${branch.primaryNumber ? row("Phone", branch.primaryNumber) : ""}
      ${row("Service", reason)}
    </table>
    <p>Please bring your ID and quote your reference when you arrive.</p>
  </body>
</html>`;

  return { subject, text, html };
}
