export type PreviewRecord = {
  id: string
  type: string
  data?: {
    title?: string
    username?: string
    email?: string
    websites?: Array<string | { website?: string }>
  }
}
