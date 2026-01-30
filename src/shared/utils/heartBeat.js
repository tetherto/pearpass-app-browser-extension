/**
 * Creates an activity heartbeat.
 *
 * The returned function should be called on user activity (mouse move, key press, etc).
 * It will invoke `fn` at most once per `intervalMs`, and only while activity is happening.
 *
 * - Continuous activity → fn is called periodically (e.g. once per second)
 * - No activity → fn is never called
 *
 * This is useful for syncing “user is active” state without sending messages
 * on every single event.
 */
export function createHeartbeat(fn, intervalMs) {
  let lastSentAt = 0

  return () => {
    const now = Date.now()
    if (now - lastSentAt >= intervalMs) {
      lastSentAt = now
      fn()
    }
  }
}
