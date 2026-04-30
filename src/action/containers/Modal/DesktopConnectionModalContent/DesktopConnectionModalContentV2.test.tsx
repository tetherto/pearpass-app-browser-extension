import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { DesktopConnectionModalContentV2 } from './DesktopConnectionModalContentV2'

const mockCloseModal = jest.fn()

jest.mock('../../../../shared/context/ModalContext', () => ({
  useModal: () => ({ closeModal: mockCloseModal })
}))

jest.mock('../../../../shared/utils/logger', () => ({
  logger: { error: jest.fn() }
}))

jest.mock('@lingui/core/macro', () => ({ t: (str: string) => str }))
jest.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => ({
    theme: { colors: { colorTextSecondary: '#bdc3ac' } }
  }),
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  Button: ({
    children,
    onClick,
    disabled,
    isLoading,
    'data-testid': dataTestId
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    isLoading?: boolean
    'data-testid'?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      data-loading={isLoading ? 'true' : undefined}
    >
      {children}
    </button>
  ),
  Dialog: ({
    title,
    children,
    footer,
    onClose,
    closeOnOutsideClick,
    testID,
    closeButtonTestID
  }: {
    title: React.ReactNode
    children?: React.ReactNode
    footer?: React.ReactNode
    onClose?: () => void
    closeOnOutsideClick?: boolean
    testID?: string
    closeButtonTestID?: string
  }) => (
    <div
      data-testid={testID}
      data-close-on-outside-click={String(!!closeOnOutsideClick)}
    >
      <header>{title}</header>
      <button
        type="button"
        onClick={onClose}
        data-testid={closeButtonTestID}
        aria-label="close"
      />
      <div>{children}</div>
      <footer>{footer}</footer>
    </div>
  )
}))

describe('DesktopConnectionModalContentV2', () => {
  let closeSpy: jest.SpyInstance

  beforeEach(() => {
    mockCloseModal.mockClear()
    closeSpy = jest.spyOn(window, 'close').mockImplementation(() => {})
  })

  afterEach(() => {
    closeSpy.mockRestore()
  })

  it('renders dialog title and body copy', () => {
    render(<DesktopConnectionModalContentV2 />)
    expect(screen.getByText('Desktop app required')).toBeInTheDocument()
    expect(
      screen.getByText(
        /The browser extension needs the PearPass desktop app to be open and running/
      )
    ).toBeInTheDocument()
  })

  it('disables close-on-outside-click', () => {
    render(<DesktopConnectionModalContentV2 />)
    expect(screen.getByTestId('desktop-connection-modal')).toHaveAttribute(
      'data-close-on-outside-click',
      'false'
    )
  })

  it('uses provided onClose and still calls window.close on Discard', () => {
    const onClose = jest.fn()
    render(<DesktopConnectionModalContentV2 onClose={onClose} />)
    fireEvent.click(screen.getByTestId('desktop-connection-modal-discard'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(closeSpy).toHaveBeenCalledTimes(1)
    expect(mockCloseModal).not.toHaveBeenCalled()
  })

  it('falls back to closeModal when onClose prop is not provided', () => {
    render(<DesktopConnectionModalContentV2 />)
    fireEvent.click(screen.getByTestId('desktop-connection-modal-close'))
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
    expect(closeSpy).toHaveBeenCalledTimes(1)
  })

  it('invokes onRetry when retry button is clicked', async () => {
    const onRetry = jest.fn().mockResolvedValue({ success: true })
    render(<DesktopConnectionModalContentV2 onRetry={onRetry} />)
    fireEvent.click(screen.getByTestId('desktop-connection-modal-retry'))
    await waitFor(() => expect(onRetry).toHaveBeenCalledTimes(1))
    expect(closeSpy).not.toHaveBeenCalled()
  })

  it('closes when retry is clicked but no onRetry is provided', () => {
    render(<DesktopConnectionModalContentV2 />)
    fireEvent.click(screen.getByTestId('desktop-connection-modal-retry'))
    expect(closeSpy).toHaveBeenCalledTimes(1)
  })

  it('matches snapshot', () => {
    const { container } = render(
      <DesktopConnectionModalContentV2
        onRetry={jest.fn().mockResolvedValue({ success: true })}
        onClose={jest.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
