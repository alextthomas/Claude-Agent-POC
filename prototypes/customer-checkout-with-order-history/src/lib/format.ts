const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Always USD as $1,234.56 (AC-8.4). Integer cents converted for display only. */
export function formatMoney(cents: number): string {
  return money.format(cents / 100);
}

const dtf = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Browser-local time zone, `Oct 20, 2026, 3:45 PM` (UX-OQ-14). */
export function formatDateTime(ms: number): string {
  return dtf.format(new Date(ms)).replace(/[\u202f\u00a0]/g, " ");
}

export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-US", { hour12: false });
}

export function formatDuration(ms: number): string {
  const neg = ms < 0;
  const total = Math.abs(Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts = [h ? `${h}h` : "", m || h ? `${m}m` : "", `${s}s`].filter(
    Boolean,
  );
  return `${neg ? "-" : ""}${parts.join(" ")}`;
}

/**
 * Only same-origin relative paths are valid return targets (AC-13.7).
 * Decodes up to four times so double-encoded tricks are caught.
 */
export function safeReturnTarget(raw: string | null): string | null {
  if (!raw) return null;
  let cur = raw;
  for (let i = 0; i < 5; i += 1) {
    if (!cur.startsWith("/") || cur.startsWith("//")) return null;
    if (cur.includes("\\") || /[\x00-\x1f\x7f]/.test(cur)) return null;
    let dec: string;
    try {
      dec = decodeURIComponent(cur);
    } catch {
      return null;
    }
    if (dec === cur) return raw;
    cur = dec;
  }
  return null;
}

export function codePoints(s: string): number {
  return Array.from(s.normalize("NFC")).length;
}
