import { isV2 } from '../utils/designVersion'

export const DYNAMIC_WINDOW_MIN_HEIGHT = 150
export const DYNAMIC_WINDOW_MAX_HEIGHT = 510
// Used as the popup's opening height before content-driven resize takes over.
// Picked to roughly match typical passkey-screen content so the post-mount
// resize is barely perceptible.
export const DYNAMIC_WINDOW_INITIAL_HEIGHT = 400

export const passkeyWindowSize = isV2()
  ? {
      width: 375,
      minHeight: DYNAMIC_WINDOW_MIN_HEIGHT,
      initialHeight: DYNAMIC_WINDOW_INITIAL_HEIGHT,
      dynamic: true
    }
  : {
      width: 460,
      height: 440
    }

export const mainExtensionWindowSize = isV2()
  ? { width: 650, height: 500 }
  : { width: 600, height: 455 }
