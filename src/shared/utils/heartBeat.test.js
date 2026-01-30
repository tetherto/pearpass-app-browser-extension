import { createHeartbeat } from './heartBeat'

describe('createHeartbeat', () => {
  let nowSpy
  let now = 0

  beforeEach(() => {
    now = 0
    nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now)
  })

  afterEach(() => {
    nowSpy.mockRestore()
    jest.clearAllMocks()
  })

  it('does not fire before interval, fires after interval', () => {
    const fn = jest.fn()
    const hb = createHeartbeat(fn, 1000)

    hb() // t=0, diff=0 => no call
    expect(fn).toHaveBeenCalledTimes(0)

    now = 1000
    hb() // t=1000, diff=1000 => call
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throttles calls within the interval', () => {
    const fn = jest.fn()
    const hb = createHeartbeat(fn, 1000)

    hb() // t=0, no call
    now = 1000
    hb() // first allowed call
    now = 1500
    hb() // within interval, no additional call

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('allows another call after interval elapses', () => {
    const fn = jest.fn()
    const hb = createHeartbeat(fn, 1000)

    hb() // t=0, no call
    now = 1000
    hb() // first call
    now = 1800
    hb() // within interval since last call, no new call
    now = 2100
    hb() // diff=1100, second call

    expect(fn).toHaveBeenCalledTimes(2)
  })
})
