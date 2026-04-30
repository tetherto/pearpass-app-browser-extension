export const isOnline = (): boolean =>
  typeof navigator === 'undefined' ? true : navigator.onLine
