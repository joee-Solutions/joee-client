/** 24-hour clock slots (e.g. 30-minute steps: 00:00 … 23:30) */
export function buildTimeOptions24h(stepMinutes: number): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

export const TIME_OPTIONS_24H = buildTimeOptions24h(30);

/** Parse common time strings to HH:mm (24h). Returns "" if unrecognized. */
export function parseToHHmm24(raw: string | undefined): string {
  if (!raw || typeof raw !== "string") return "";
  let s = raw.trim();
  if (s.includes(" - ")) s = s.split(" - ")[0].trim();

  const twelve = s.match(/^(\d{1,2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?|am|pm)$/i);
  if (twelve) {
    let h = parseInt(twelve[1], 10);
    const m = parseInt(twelve[2], 10);
    const ap = twelve[3].toLowerCase().replace(/\./g, "");
    if (ap.startsWith("p") && h < 12) h += 12;
    if (ap.startsWith("a") && h === 12) h = 0;
    return `${String(Math.min(23, Math.max(0, h))).padStart(2, "0")}:${String(Math.min(59, Math.max(0, m))).padStart(2, "0")}`;
  }

  const twentyfour = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyfour) {
    const h = Math.min(23, Math.max(0, parseInt(twentyfour[1], 10)));
    const m = Math.min(59, Math.max(0, parseInt(twentyfour[2], 10)));
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return "";
}

export function snapToTimeSlot(hhmm: string, slots: string[]): string {
  if (!hhmm || slots.length === 0) return "";
  if (slots.includes(hhmm)) return hhmm;
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (isNaN(h) || isNaN(m)) return "";
  const total = h * 60 + m;
  let best = slots[0];
  let bestDiff = Infinity;
  for (const slot of slots) {
    const [sh, sm] = slot.split(":").map((x) => parseInt(x, 10));
    const d = Math.abs(sh * 60 + sm - total);
    if (d < bestDiff) {
      bestDiff = d;
      best = slot;
    }
  }
  return best;
}

/** Normalize arbitrary API/display time to a valid select value. */
export function valueForTimeSelect24h(
  raw: string | undefined,
  slots: string[] = TIME_OPTIONS_24H
): string {
  const p = parseToHHmm24(raw);
  if (!p) return "";
  return snapToTimeSlot(p, slots);
}
