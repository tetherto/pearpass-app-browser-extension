import { renderHook, act } from '@testing-library/react'

import { useAllowHttpEnabled } from './useAllowHttpEnabled'
import {
  getAllowHttpFromStorage,
  setAllowHttpInStorage,
  subscribeToAllowHttpStorage
} from '../utils/allowHttpStorage'

jest.mock('../utils/allowHttpStorage', () => ({
  getAllowHttpFromStorage: jest.fn(),
  setAllowHttpInStorage: jest.fn(),
  subscribeToAllowHttpStorage: jest.fn()
}))

describe('useAllowHttpEnabled', () => {
  let storageCallback
  const unsubscribeMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    subscribeToAllowHttpStorage.mockImplementation((cb) => {
      storageCallback = cb
      return unsubscribeMock
    })
  })

  it('should initialize with value from storage', async () => {
    getAllowHttpFromStorage.mockResolvedValue(true)

    let result
    await act(async () => {
      const rendered = renderHook(() => useAllowHttpEnabled())
      result = rendered.result
    })

    expect(getAllowHttpFromStorage).toHaveBeenCalled()
    expect(result.current[0]).toBe(true)
  })

  it('should update state when storage changes externally', async () => {
    getAllowHttpFromStorage.mockResolvedValue(false)

    let result
    await act(async () => {
      const rendered = renderHook(() => useAllowHttpEnabled())
      result = rendered.result
    })

    expect(result.current[0]).toBe(false)

    // Simulate external storage change
    await act(async () => {
      storageCallback(true)
    })

    expect(result.current[0]).toBe(true)
  })

  it('should update storage and state when setter is called', async () => {
    getAllowHttpFromStorage.mockResolvedValue(false)
    setAllowHttpInStorage.mockResolvedValue()

    let result
    await act(async () => {
      const rendered = renderHook(() => useAllowHttpEnabled())
      result = rendered.result
    })

    const [, setEnabled] = result.current

    await act(async () => {
      setEnabled(true)
    })

    expect(result.current[0]).toBe(true)
    expect(setAllowHttpInStorage).toHaveBeenCalledWith(true)
  })

  it('should unsubscribe on unmount', async () => {
    getAllowHttpFromStorage.mockResolvedValue(false)

    const { unmount } = renderHook(() => useAllowHttpEnabled())

    unmount()

    expect(unsubscribeMock).toHaveBeenCalled()
  })
})
