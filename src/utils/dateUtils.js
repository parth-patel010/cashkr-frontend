/** India has no DST — IST is always UTC+5:30 */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

export const TIME_SLOTS = [
  { label: '10:00 AM - 12:00 PM', value: '10am-12pm', popular: true, startHour: 10 },
  { label: '12:00 PM - 2:00 PM', value: '12pm-2pm', popular: false, startHour: 12 },
  { label: '2:00 PM - 4:00 PM', value: '2pm-4pm', popular: false, startHour: 14 },
  { label: '4:00 PM - 6:00 PM', value: '4pm-6pm', popular: false, startHour: 16 },
  { label: '6:00 PM - 8:00 PM', value: '6pm-8pm', popular: false, startHour: 18 },
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Wall-clock parts in India Standard Time (independent of browser timezone / Intl quirks). */
export function getIndiaNow(now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const year = ist.getUTCFullYear();
  const month = ist.getUTCMonth() + 1;
  const day = ist.getUTCDate();
  const hour = ist.getUTCHours();
  const dow = ist.getUTCDay(); // 0 = Sunday
  return {
    year,
    month,
    day,
    hour,
    dow,
    dateKey: `${year}-${pad2(month)}-${pad2(day)}`,
    isSunday: dow === 0,
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow],
  };
}

/** Date anchored at noon IST for a given India calendar day. */
export function indiaCalendarDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0) - IST_OFFSET_MS);
}

function addCalendarDays(year, month, day, delta) {
  const utc = new Date(Date.UTC(year, month - 1, day + delta, 12, 0, 0));
  const y = utc.getUTCFullYear();
  const m = utc.getUTCMonth() + 1;
  const d = utc.getUTCDate();
  const dow = utc.getUTCDay();
  return {
    year: y,
    month: m,
    day: d,
    dow,
    dateKey: `${y}-${pad2(m)}-${pad2(d)}`,
    isSunday: dow === 0,
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow],
  };
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

/** India calendar date YYYY-MM-DD. */
export function formatDateISO(date) {
  return getIndiaNow(date).dateKey;
}

/**
 * Slot is bookable if the selected India day is in the future, or today (IST)
 * and current India hour is still before the slot start hour.
 */
export function isTimeSlotAvailable(date, slotValue, now = new Date()) {
  if (!date || !slotValue) return false;

  const indiaNow = getIndiaNow(now);
  const selectedKey = formatDateISO(date);
  if (selectedKey < indiaNow.dateKey) return false;
  if (selectedKey > indiaNow.dateKey) return true;

  const slot = TIME_SLOTS.find((s) => s.value === slotValue);
  if (!slot) return false;
  return indiaNow.hour < slot.startHour;
}

export function hasAvailableTimeSlots(date, now = new Date()) {
  return TIME_SLOTS.some((s) => isTimeSlotAvailable(date, s.value, now));
}

/**
 * Next `count` pickup days in IST.
 * Always puts today first when any slot is still open (including Sunday).
 * Skips later Sundays.
 */
export function getNextDays(count = 7, now = new Date()) {
  const days = [];
  const indiaNow = getIndiaNow(now);
  const today = indiaCalendarDate(indiaNow.year, indiaNow.month, indiaNow.day);

  if (hasAvailableTimeSlots(today, now)) {
    days.push(today);
  }

  let cursor = addCalendarDays(indiaNow.year, indiaNow.month, indiaNow.day, 1);
  for (let i = 0; days.length < count && i < count + 21; i++) {
    if (!cursor.isSunday) {
      days.push(indiaCalendarDate(cursor.year, cursor.month, cursor.day));
    }
    cursor = addCalendarDays(cursor.year, cursor.month, cursor.day, 1);
  }

  return days;
}
