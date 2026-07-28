import { authService } from '../services/auth.service';

/**
 * Persist last quiz device for admin "Last Quiz" (authenticated users).
 * Fire-and-forget — never blocks the sell flow.
 */
export function reportLastQuizDevice(ctx) {
  if (!ctx?.slug && !ctx?.modelName) return;
  authService.reportLastQuiz(ctx).catch(() => {});
}
