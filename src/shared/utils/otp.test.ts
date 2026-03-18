import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

import { getTimerColor } from './otp'

describe('getTimerColor', () => {
  it('should return errorRed when expiring is true', () => {
    expect(getTimerColor(true)).toBe(colors.errorRed.mode1)
  })

  it('should return primary400 when expiring is false', () => {
    expect(getTimerColor(false)).toBe(colors.primary400.mode1)
  })
})
