import { isV2 } from '../utils/designVersion'

export const passkeyWindowSize = {
  width: 460,
  height: 440
}

export const mainExtensionWindowSize = isV2()
  ? { width: 650, height: 500 }
  : { width: 600, height: 455 }
