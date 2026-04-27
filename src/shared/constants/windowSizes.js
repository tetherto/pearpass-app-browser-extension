import { isV2 } from '../utils/designVersion'

export const passkeyWindowSize = {
  width: 460,
  height: 440
}

export const mainExtensionWindowSize = {
  width: isV2() ? 650 : 600,
  height: isV2() ? 494 : 455
}
