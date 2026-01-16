import { getAllowHttpFromStorage } from '../../shared/utils/allowHttpStorage'

export const isContentScriptEnabled = async () => {
  const isSecure = window.location.protocol === 'https:'
  const isAllowHttpEnabled = await getAllowHttpFromStorage()

  return isSecure || isAllowHttpEnabled
}
