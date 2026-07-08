const LATEST_EVENT_HOUR_IST = 21;

/** Matches backend `validate_scheduled_at_not_late` (IST / India local). */
export function validateEventScheduledAt(scheduled: Date): string | null {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(scheduled);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  if (hour > LATEST_EVENT_HOUR_IST || (hour === LATEST_EVENT_HOUR_IST && minute > 0)) {
    return `Events cannot be scheduled after ${LATEST_EVENT_HOUR_IST}:00 IST`;
  }
  return null;
}

export function validateEventTimeLocal(timeLocal: string): string | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(timeLocal.trim());
  if (!match) return "Enter a valid time";
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > LATEST_EVENT_HOUR_IST || (hour === LATEST_EVENT_HOUR_IST && minute > 0)) {
    return `Events cannot be scheduled after ${LATEST_EVENT_HOUR_IST}:00 local time`;
  }
  return null;
}
