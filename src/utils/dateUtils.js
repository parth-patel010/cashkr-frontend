export function getNextDays(count = 7) {
  const days = [];
  const now = new Date();
  let start = new Date(now);
  // If after 6pm, skip today
  if (now.getHours() >= 18) start.setDate(start.getDate() + 1);
  else start.setDate(start.getDate() + 1); // always start from tomorrow
  for (let i = 0; days.length < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() !== 0) days.push(d); // skip Sunday
  }
  return days;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

export function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

export const TIME_SLOTS = [
  { label: '10:00 AM - 12:00 PM', value: '10am-12pm', popular: true },
  { label: '12:00 PM - 2:00 PM', value: '12pm-2pm', popular: false },
  { label: '2:00 PM - 4:00 PM', value: '2pm-4pm', popular: false },
  { label: '4:00 PM - 6:00 PM', value: '4pm-6pm', popular: false },
  { label: '6:00 PM - 8:00 PM', value: '6pm-8pm', popular: false },
];
