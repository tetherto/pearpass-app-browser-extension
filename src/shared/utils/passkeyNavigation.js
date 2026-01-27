import { logger } from './logger.js'

/**
 * Checks if we should redirect back to the passkey selection page.
 * @param {Object} routerState - The current router state
 * @returns {boolean} True if we're in a passkey flow that needs to return to passkey selection
 */
export const shouldReturnToPasskeySelection = (routerState = null) =>
  // Check if we're in a passkey flow and have the necessary passkey page info to return to
  routerState?.inPasskeyFlow === true && routerState?.page

/**
 * Redirects to the passkey selection page with parameters from router state.
 * Window resizing is handled by useWindowResize hook based on currentPage.
 * @param {Function} navigate - Router navigation function (required)
 * @param {Object} passkeyParams - The passkey parameters from router state (required)
 */
export const redirectToPasskeySelection = (navigate, passkeyParams) => {
  if (!navigate || !passkeyParams) {
    logger.error(
      'redirectToPasskeySelection requires both navigate and passkeyParams'
    )
    return
  }

  navigate(passkeyParams.page, {
    state: {
      serializedPublicKey: passkeyParams.serializedPublicKey,
      requestId: passkeyParams.requestId,
      requestOrigin: passkeyParams.requestOrigin,
      tabId: passkeyParams.tabId,
      isVerified: passkeyParams.isVerified
    }
  })
}
