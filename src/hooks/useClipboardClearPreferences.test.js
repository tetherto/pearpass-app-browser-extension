import { renderHook, act } from '@testing-library/react'

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  DEFAULT_CLIPBOARD_CLEAR_TIMEOUT: 60_000
}))

import {
  useClipboardClearPreferences,
  ClipboardClearProvider
} from './useClipboardClearPreferences'
import { MESSAGE_TYPES } from '../shared/services/messageBridge'

describe('useClipboardClearPreferences (extension)', () => {
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

    global.chrome = {
      storage: {
        local: { get: getMock },
        onChanged: {
          addListener: addListenerMock,
          removeListener: removeListenerMock
        }
      },
      runtime: { sendMessage: sendMessageMock }
    }
  })

  it('initializes from chrome.storage.local and subscribes to changes', () => {
    getMock.mockImplementation((key, cb) => {
      cb({ clipboardClearTimeoutMs: 60_000 })
    })

    const { result } = renderHook(() => useClipboardClearPreferences(), {
      wrapper: ClipboardClearProvider
    })

    expect(getMock).toHaveBeenCalledWith(
      'clipboardClearTimeoutMs',
      expect.any(Function)
    )
    expect(addListenerMock).toHaveBeenCalled()
    expect(result.current.clipboardClearTimeoutMs).toBe(60_000)

    act(() => {
      onChangedListener({ clipboardClearTimeoutMs: { newValue: 300_000 } })
    })

    expect(result.current.clipboardClearTimeoutMs).toBe(300_000)
  })

  it('keeps default when storage has no clipboardClearTimeoutMs', () => {
    getMock.mockImplementation((key, cb) => cb({}))

    const { result } = renderHook(() => useClipboardClearPreferences(), {
      wrapper: ClipboardClearProvider
    })

    expect(result.current.clipboardClearTimeoutMs).toBe(60_000)
  })

  it('accepts null (Never) from storage.get', () => {
    getMock.mockImplementation((key, cb) =>
      cb({ clipboardClearTimeoutMs: null })
    )

    const { result } = renderHook(() => useClipboardClearPreferences(), {
      wrapper: ClipboardClearProvider
    })

    expect(result.current.clipboardClearTimeoutMs).toBeNull()
  })

  it('accepts null newValue from onChanged', () => {
    getMock.mockImplementation((key, cb) => cb({}))

    const { result } = renderHook(() => useClipboardClearPreferences(), {
      wrapper: ClipboardClearProvider
    })

    act(() => {
      onChangedListener({ clipboardClearTimeoutMs: { newValue: null } })
    })

    expect(result.current.clipboardClearTimeoutMs).toBeNull()
  })

  it('setClipboardClearTimeoutMs updates state optimistically and sends message', () => {
    getMock.mockImplementation((key, cb) => cb({}))

    const { result } = renderHook(() => useClipboardClearPreferences(), {
      wrapper: ClipboardClearProvider
    })

    act(() => {
      result.current.setClipboardClearTimeoutMs(300_000)
    })

    expect(result.current.clipboardClearTimeoutMs).toBe(300_000)
    expect(sendMessageMock).toHaveBeenCalledWith({
      type: MESSAGE_TYPES.SET_CLIPBOARD_CLEAR_TIMEOUT,
      clipboardClearTimeoutMs: 300_000
    })
  })

  it('setClipboardClearTimeoutMs sends null for Never', () => {
    getMock.mockImplementation((key, cb) => cb({}))

    const { result } = renderHook(() => useClipboardClearPreferences(), {
      wrapper: ClipboardClearProvider
    })

    act(() => {
      result.current.setClipboardClearTimeoutMs(null)
    })

    expect(result.current.clipboardClearTimeoutMs).toBeNull()
    expect(sendMessageMock).toHaveBeenCalledWith({
      type: MESSAGE_TYPES.SET_CLIPBOARD_CLEAR_TIMEOUT,
      clipboardClearTimeoutMs: null
    })
  })

  it('removes the onChanged listener on unmount', () => {
    getMock.mockImplementation((key, cb) => cb({}))

    const { unmount } = renderHook(() => useClipboardClearPreferences(), {
      wrapper: ClipboardClearProvider
    })

    unmount()

    expect(removeListenerMock).toHaveBeenCalled()
  })
})
