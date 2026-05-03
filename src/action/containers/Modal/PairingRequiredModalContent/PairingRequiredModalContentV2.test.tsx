import React from 'react'

import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import { PairingRequiredModalContentV2 } from './PairingRequiredModalContentV2'

jest.mock('../../../../hooks/useDesktopPairing', () => ({
  useDesktopPairing: () => ({
    pairingToken: 'mock-token',
    setPairingToken: jest.fn(),
    identity: { name: 'MockUser' },
    loading: false,
    fetchIdentity: jest.fn(),
    completePairing: jest.fn()
  })
}))

jest.mock('@lingui/core/macro', () => ({ t: (str: string) => str }))
jest.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => children
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => ({
    theme: { colors: { colorTextSecondary: '#888888' } }
  }),
  Title: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  Button: ({
    children,
    onClick,
    disabled
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  PasswordField: ({
    label,
    value,
    onChangeText,
    testID
  }: {
    label?: string
    value?: string
    onChangeText?: (v: string) => void
    testID?: string
  }) => (
    <input
      aria-label={label}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChangeText?.(e.target.value)
      }
      data-testid={testID}
    />
  )
}))

const mockLocalStorage = (tokenValue: string | null) => {
  jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(tokenValue)
}

const renderComponent = (onPairSuccess: () => void = jest.fn()) =>
  render(<PairingRequiredModalContentV2 onPairSuccess={onPairSuccess} />)

describe('PairingRequiredModalContentV2 - snapshot', () => {
  beforeEach(() => {
    mockLocalStorage('mock-token')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders master password form when token is present', () => {
    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })
})
