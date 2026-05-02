import { normalizeUrl } from './normalizeUrl'

export const getHostname = (value?: string | null): string | null => {
  if (!value || typeof value !== 'string') return null

  const normalized = normalizeUrl(value, true)
  if (!normalized) return null

  try {
    return new URL(normalized).hostname.toLowerCase()
  } catch {
    return null
  }
}
