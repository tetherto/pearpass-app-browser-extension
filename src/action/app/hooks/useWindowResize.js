import { useEffect, useMemo } from 'react'

import { PASSKEY_PAGES } from '../../../shared/constants/passkey'
import {
  mainExtensionWindowSize,
  passkeyWindowSize
} from '../../../shared/constants/windowSizes'
import { useRouter } from '../../../shared/context/RouterContext'

/**
 * Hook that dynamically resizes the extension popup window based on the current page
 * and returns the current window size for component styling.
 *
 * @returns {{width: number, height: number}} The current window size
 */
export const useWindowResize = () => {
  const { currentPage, state } = useRouter()

  // Determine the target size based on current page
  const targetSize = useMemo(() => {
    const isPasskeyFlow =
      PASSKEY_PAGES.includes(currentPage) || state?.inPasskeyFlow === true
    return isPasskeyFlow ? passkeyWindowSize : mainExtensionWindowSize
  }, [currentPage, state])

  useEffect(() => {
    // Resize the current popup window
    if (chrome?.windows?.getCurrent) {
      chrome.windows.getCurrent((currentWindow) => {
        if (
          currentWindow &&
          currentWindow.type === 'popup' &&
          chrome?.windows?.update
        ) {
          chrome.windows.update(currentWindow.id, {
            width: targetSize.width,
            height: targetSize.height
          })
        }
      })
    }
  }, [targetSize])

  return targetSize
}
