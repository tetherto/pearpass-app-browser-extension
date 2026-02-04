import { renderHook, act } from '@testing-library/react'

jest.mock('pearpass-lib-constants', () => ({
  BE_AUTO_LOCK_ENABLED: true,
  DEFAULT_AUTO_LOCK_TIMEOUT: 300000
}))

import { useAutoLockPreferences } from './useAutoLockPreferences'
import { MESSAGE_TYPES } from '../shared/services/messageBridge'

describe('useAutoLockPreferences (extension)', () => {
  let onChangedListener
  const getMock = jest.fn()
  const addListenerMock = jest.fn((listener) => {
    onChangedListener = listener
  })
  const removeListenerMock = jest.fn()
  const sendMessageMock = jest.fn()

  beforeEach(() => {
    onChangedListener = undefined
    getMock.mockReset()
    addListenerMock.mockClear()
    removeListenerMock.mockClear()
    sendMessageMock.mockReset()

    // @ts-ignore
    global.chrome = {
      storage: {
        local: {
          get: getMock
        },
        onChanged: {
          addListener: addListenerMock,
          removeListener: removeListenerMock
        }
      },
      runtime: {
        sendMessage: sendMessageMock
      }
    }
  })

  it('initializes from chrome.storage.local and subscribes to changes', () => {
    // Simulate storage.get callback providing initial values
    getMock.mockImplementation((keys, cb) => {
      cb({ autoLockEnabled: false, autoLockTimeoutMs: 1234 })
    })

    const { result } = renderHook(() => useAutoLockPreferences())

    expect(getMock).toHaveBeenCalledWith(
      ['autoLockEnabled', 'autoLockTimeoutMs'],
      expect.any(Function)
    )
    expect(addListenerMock).toHaveBeenCalled()
    expect(result.current.isAutoLockEnabled).toBe(false)
    expect(result.current.timeoutMs).toBe(1234)

    // Simulate change event
    act(() => {
      onChangedListener({
        autoLockEnabled: { newValue: true },
        autoLockTimeoutMs: { newValue: 4567 }
      })
    })

    expect(result.current.isAutoLockEnabled).toBe(true)
    expect(result.current.timeoutMs).toBe(4567)
  })

  it('setAutoLockEnabled sends runtime message', () => {
    getMock.mockImplementation((keys, cb) => cb({}))
    const { result } = renderHook(() => useAutoLockPreferences())

    act(() => {
      result.current.setAutoLockEnabled(true)
    })

    expect(sendMessageMock).toHaveBeenCalledWith({
      type: MESSAGE_TYPES.SET_AUTO_LOCK_ENABLED,
      autoLockEnabled: true
    })
  })

  it('setTimeoutMs sends runtime message', () => {
    getMock.mockImplementation((keys, cb) => cb({}))
    const { result } = renderHook(() => useAutoLockPreferences())

    act(() => {
      result.current.setTimeoutMs(9999)
    })

    expect(sendMessageMock).toHaveBeenCalledWith({
      type: MESSAGE_TYPES.SET_AUTO_LOCK_TIMEOUT,
      autoLockTimeoutMs: 9999
    })
  })
})
