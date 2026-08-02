export const TIME_SLOTS = [
  { label: '10:00 AM - 12:00 PM', value: '10am-12pm', popular: true, startHour: 10 },
  { label: '12:00 PM - 2:00 PM', value: '12pm-2pm', popular: false, startHour: 12 },
  { label: '2:00 PM - 4:00 PM', value: '2pm-4pm', popular: false, startHour: 14 },
  { label: '4:00 PM - 6:00 PM', value: '4pm-6pm', popular: false, startHour: 16 },
  { label: '6:00 PM - 8:00 PM', value: '6pm-8pm', popular: false, startHour: 18 },
];

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

/** Local calendar date YYYY-MM-DD (avoids UTC shift from toISOString). */
export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Slot is bookable if the selected day is in the future, or today and
 * current local time is still before the slot start hour.
 */
export function isTimeSlotAvailable(date, slotValue, now = new Date()) {
  if (!date || !slotValue) return false;

  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (dayStart < todayStart) return false;
  if (dayStart > todayStart) return true;

  const slot = TIME_SLOTS.find((s) => s.value === slotValue);
  if (!slot) return false;
  return now.getHours() < slot.startHour;
}

export function hasAvailableTimeSlots(date, now = new Date()) {
  return TIME_SLOTS.some((s) => isTimeSlotAvailable(date, s.value, now));
}

/**
 * Next `count` pickup days (skips Sunday).
 * Includes today when at least one time slot is still open.
 */
export function getNextDays(count = 7, now = new Date()) {
  const days = [];
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!hasAvailableTimeSlots(start, now)) {
    start.setDate(start.getDate() + 1);
  }

  for (let i = 0; days.length < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() !== 0) days.push(d); // skip Sunday
  }
  return days;
}
