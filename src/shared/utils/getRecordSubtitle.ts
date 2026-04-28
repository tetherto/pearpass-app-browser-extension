type RecordLike = {
  data?: Record<string, unknown>
}

const firstString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.length) return value
  }
  return ''
}

export const getRecordSubtitle = (record: RecordLike): string =>
  firstString(
    record.data?.username,
    record.data?.email,
    record.data?.name,
    record.data?.fullName
  )
