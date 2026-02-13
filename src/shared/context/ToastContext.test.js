import React from 'react'

import { render, act } from '@testing-library/react'

import { ToastProvider, useToast } from './ToastContext'
import { Toasts } from '../components/Toasts'

jest.mock('../components/Toasts', () => ({
  Toasts: jest.fn(() => null)
}))

jest.useFakeTimers()

const TestComponent = ({ onToast }) => {
  const { setToast } = useToast()
  React.useEffect(() => {
    if (onToast) {
      onToast(setToast)
    }
  }, [onToast])
  return null
}

describe('ToastContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should provide toast context', () => {
    const mockSetToast = jest.fn()

    render(
      <ToastProvider>
        <TestComponent onToast={mockSetToast} />
      </ToastProvider>
    )

    expect(mockSetToast).toHaveBeenCalled()
    expect(typeof mockSetToast.mock.calls[0][0]).toBe('function')
  })

  it('should add toast to stack when setToast is called', () => {
    let setToastFn
    const toastData = { message: 'Test toast', icon: 'test-icon' }

    render(
      <ToastProvider>
        <TestComponent
          onToast={(fn) => {
            setToastFn = fn
          }}
        />
      </ToastProvider>
    )

    act(() => {
      setToastFn(toastData)
    })

    expect(Toasts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        toasts: [toastData]
      }),
      undefined
    )
  })

  it('should remove toast after timeout', () => {
    let setToastFn
    const toastData = { message: 'Test toast', icon: 'test-icon' }

    render(
      <ToastProvider>
        <TestComponent
          onToast={(fn) => {
            setToastFn = fn
          }}
        />
      </ToastProvider>
    )

    act(() => {
      setToastFn(toastData)
    })

    expect(Toasts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        toasts: [toastData]
      }),
      undefined
    )

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(Toasts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        toasts: []
      }),
      undefined
    )
  })

  it('should handle multiple toasts', () => {
    let setToastFn
    const toast1 = { message: 'Test toast 1', icon: 'icon-1' }
    const toast2 = { message: 'Test toast 2', icon: 'icon-2' }

    render(
      <ToastProvider>
        <TestComponent
          onToast={(fn) => {
            setToastFn = fn
          }}
        />
      </ToastProvider>
    )

    act(() => {
      setToastFn(toast1)
      setToastFn(toast2)
    })

    expect(Toasts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        toasts: [toast1, toast2]
      }),
      undefined
    )
  })
})
