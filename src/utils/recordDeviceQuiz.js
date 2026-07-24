import { deviceService } from '../services/device.service';

/**
 * Count a quiz open once per browser session so refreshes don't inflate rankings.
 */
export function recordDeviceQuizOnce(slug) {
  if (!slug || typeof window === 'undefined') return;

  const key = `dk_quiz_recorded_${slug}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // continue without dedupe if storage blocked
  }

  deviceService.recordQuiz(slug).catch(() => {
    // non-blocking — ranking should never break the quiz UX
  });
}
