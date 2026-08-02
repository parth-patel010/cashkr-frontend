const INDIA_TZ = 'Asia/Kolkata';

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

/** Current calendar date + hour in India (Asia/Kolkata). */
export function getIndiaNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: INDIA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(now);

  const get = (type) => parts.find((p) => p.type === type)?.value;
  let hour = parseInt(get('hour'), 10);
  if (hour === 24) hour = 0;

  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10);
  const day = parseInt(get('day'), 10);
  const weekday = get('weekday'); // Mon, Tue, ... Sun

  return {
    year,
    month,
    day,
    hour,
    weekday,
    dateKey: `${year}-${pad2(month)}-${pad2(day)}`,
    isSunday: weekday === 'Sun',
  };
}

/** Date object anchored at noon IST for a given India calendar day. */
export function indiaCalendarDate(year, month, day) {
  return new Date(`${year}-${pad2(month)}-${pad2(day)}T12:00:00+05:30`);
}

function addIndiaDays(year, month, day, delta) {
  const base = indiaCalendarDate(year, month, day);
  base.setTime(base.getTime() + delta * 24 * 60 * 60 * 1000);
  const next = getIndiaNow(base);
  return { year: next.year, month: next.month, day: next.day, weekday: next.weekday, isSunday: next.isSunday, dateKey: next.dateKey };
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/** India calendar date YYYY-MM-DD. */
export function formatDateISO(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
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
 * Next `count` pickup days in India time.
 * - Includes today (even Sunday) when at least one slot is still open.
 * - Skips future Sundays.
 */
export function getNextDays(count = 7, now = new Date()) {
  const days = [];
  const indiaNow = getIndiaNow(now);
  let cursor = {
    year: indiaNow.year,
    month: indiaNow.month,
    day: indiaNow.day,
    weekday: indiaNow.weekday,
    isSunday: indiaNow.isSunday,
    dateKey: indiaNow.dateKey,
  };

  const todayDate = indiaCalendarDate(cursor.year, cursor.month, cursor.day);
  if (!hasAvailableTimeSlots(todayDate, now)) {
    cursor = addIndiaDays(cursor.year, cursor.month, cursor.day, 1);
  }

  // Safety cap so we never loop forever
  for (let i = 0; days.length < count && i < count + 14; i++) {
    const d = indiaCalendarDate(cursor.year, cursor.month, cursor.day);
    const isToday = cursor.dateKey === indiaNow.dateKey;

    // Allow today even on Sunday; skip other Sundays
    if (!cursor.isSunday || isToday) {
      days.push(d);
    }

    cursor = addIndiaDays(cursor.year, cursor.month, cursor.day, 1);
  }

  return days;
}
