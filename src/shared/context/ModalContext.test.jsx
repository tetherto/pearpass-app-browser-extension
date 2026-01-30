import React from 'react'

import { render, fireEvent, screen } from '@testing-library/react'

import { ModalProvider, useModal } from './ModalContext'
import { BASE_TRANSITION_DURATION } from '../constants/transitions'
import '@testing-library/jest-dom'

jest.mock('../containers/Overlay', () => ({
  Overlay: ({ children, onClick }) => (
    <div role="dialog" aria-label="overlay" onClick={onClick}>
      {children}
    </div>
  )
}))
jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn(() => 'unique-id')
}))
jest.mock('./LoadingContext', () => ({
  useLoadingContext: jest.fn(() => ({
    setIsLoading: jest.fn()
  }))
}))

jest.useFakeTimers()

const TestComponent = () => {
  const { setModal, closeModal } = useModal()

  return (
    <div>
      <button onClick={() => setModal(<div>Modal Content</div>, {})}>
        Open Modal
      </button>
      <button onClick={closeModal}>Close Modal</button>
    </div>
  )
}

describe('ModalContext', () => {
  const renderWithProvider = (ui) => render(<ModalProvider>{ui}</ModalProvider>)

  it('should open a modal when setModal is called', () => {
    renderWithProvider(<TestComponent />)

    fireEvent.click(screen.getByText('Open Modal'))

    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('should close the modal when closeModal is called', () => {
    renderWithProvider(<TestComponent />)

    fireEvent.click(screen.getByText('Open Modal'))
    fireEvent.click(screen.getByText('Close Modal'))

    jest.advanceTimersByTime(BASE_TRANSITION_DURATION)

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('should close the modal when Escape key is pressed', () => {
    renderWithProvider(<TestComponent />)

    fireEvent.click(screen.getByText('Open Modal'))
    fireEvent.keyDown(window, { key: 'Escape' })

    jest.advanceTimersByTime(BASE_TRANSITION_DURATION)

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal is open')).not.toBeInTheDocument()
  })

  it('should render an overlay if hasOverlay is true', () => {
    renderWithProvider(<TestComponent />)

    fireEvent.click(screen.getByText('Open Modal'))

    expect(screen.getByRole('dialog', { name: /overlay/i })).toBeInTheDocument()
  })

  it('should not render an overlay if hasOverlay is false', () => {
    const TestComponentWithoutOverlay = () => {
      const { setModal } = useModal()

      return (
        <button
          onClick={() =>
            setModal(<div>Modal Content</div>, { hasOverlay: false })
          }
        >
          Open Modal Without Overlay
        </button>
      )
    }

    renderWithProvider(<TestComponentWithoutOverlay />)

    fireEvent.click(screen.getByText('Open Modal Without Overlay'))

    expect(
      screen.queryByRole('dialog', { name: /overlay/i })
    ).not.toBeInTheDocument()
  })
})
