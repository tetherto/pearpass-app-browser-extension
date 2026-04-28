export const SORT_KEYS = {
  TITLE_AZ: 'title_az',
  LAST_UPDATED_NEWEST: 'last_updated_newest',
  LAST_UPDATED_OLDEST: 'last_updated_oldest',
  DATE_ADDED_NEWEST: 'date_added_newest',
  DATE_ADDED_OLDEST: 'date_added_oldest'
} as const

export type SortKey = (typeof SORT_KEYS)[keyof typeof SORT_KEYS]

export const SORT_BY_TYPE: Record<
  SortKey,
  { key: string; direction: 'asc' | 'desc' }
> = {
  [SORT_KEYS.TITLE_AZ]: { key: 'data.title', direction: 'asc' },
  [SORT_KEYS.LAST_UPDATED_NEWEST]: { key: 'updatedAt', direction: 'desc' },
  [SORT_KEYS.LAST_UPDATED_OLDEST]: { key: 'updatedAt', direction: 'asc' },
  [SORT_KEYS.DATE_ADDED_NEWEST]: { key: 'createdAt', direction: 'desc' },
  [SORT_KEYS.DATE_ADDED_OLDEST]: { key: 'createdAt', direction: 'asc' }
}
