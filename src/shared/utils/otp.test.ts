import { getTimerColor } from './otp'

describe('getTimerColor', () => {
  it('should return error red when expiring is true', () => {
    expect(getTimerColor(true)).toBe('#D13B3D')
  })

  it('should return primary when expiring is false', () => {
    expect(getTimerColor(false)).toBe('#B0D944')
  })
})
