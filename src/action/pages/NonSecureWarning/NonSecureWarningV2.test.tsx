import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { NonSecureWarningV2 } from './NonSecureWarningV2'

const mockSetAllowHttpEnabled = jest.fn()

jest.mock('../../../shared/hooks/useAllowHttpEnabled', () => ({
  useAllowHttpEnabled: () => [false, mockSetAllowHttpEnabled]
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
    'data-testid': dataTestId
  }: {
    children: React.ReactNode
    onClick?: () => void
    'data-testid'?: string
  }) => (
    <button onClick={onClick} data-testid={dataTestId}>
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

describe('NonSecureWarningV2', () => {
  let closeSpy: jest.SpyInstance

  beforeEach(() => {
    mockSetAllowHttpEnabled.mockClear()
    closeSpy = jest.spyOn(window, 'close').mockImplementation(() => {})
  })

  afterEach(() => {
    closeSpy.mockRestore()
  })

  it('renders dialog with title and body copy', () => {
    render(<NonSecureWarningV2 />)
    expect(
      screen.getByText('Extension disabled on this site')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /For your security, the extension is disabled on non-secure \(HTTP\) websites/
      )
    ).toBeInTheDocument()
  })

  it('disables close-on-outside-click', () => {
    render(<NonSecureWarningV2 />)
    expect(screen.getByTestId('non-secure-warning')).toHaveAttribute(
      'data-close-on-outside-click',
      'false'
    )
  })

  it('calls window.close when Discard is clicked', () => {
    render(<NonSecureWarningV2 />)
    fireEvent.click(screen.getByTestId('non-secure-warning-discard'))
    expect(closeSpy).toHaveBeenCalledTimes(1)
    expect(mockSetAllowHttpEnabled).not.toHaveBeenCalled()
  })

  it('calls window.close when X close-button is clicked', () => {
    render(<NonSecureWarningV2 />)
    fireEvent.click(screen.getByTestId('non-secure-warning-close'))
    expect(closeSpy).toHaveBeenCalledTimes(1)
  })

  it('enables HTTP allowance and does not close popup when Enable is clicked', () => {
    render(<NonSecureWarningV2 />)
    fireEvent.click(screen.getByTestId('non-secure-warning-enable'))
    expect(mockSetAllowHttpEnabled).toHaveBeenCalledWith(true)
    expect(closeSpy).not.toHaveBeenCalled()
  })

  it('matches snapshot', () => {
    const { container } = render(<NonSecureWarningV2 />)
    expect(container).toMatchSnapshot()
  })
})
