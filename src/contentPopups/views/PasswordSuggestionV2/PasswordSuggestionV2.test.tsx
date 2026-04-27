import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { PasswordSuggestionV2 } from './index'

jest.mock('@lingui/react', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLingui: () => ({
    i18n: {
      _: (msg: string | { message?: string }) =>
        typeof msg === 'string'
          ? msg
          : (msg?.message ?? 'Open password generator')
    }
  })
}))

jest.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

jest.mock('@tetherto/pearpass-utils-password-generator', () => ({
  generatePassword: () => 'SUGGESTED_PASSWORD_24___'
}))

const mockRefetchVault = jest.fn()
jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useVault: () => ({ refetch: mockRefetchVault })
}))

const mockNavigate = jest.fn()
jest.mock('../../../shared/context/RouterContext', () => ({
  useRouter: () => ({
    navigate: mockNavigate,
    state: {
      recordType: 'all',
      iframeId: 'iframe-sug-1',
      iframeType: 'suggestion-iframe',
      other: 'x'
    }
  })
}))

jest.mock('../../hooks/useFilteredRecords', () => ({
  useFilteredRecords: () => ({
    filteredRecords: [],
    isInitialized: true,
    isLoading: false
  })
}))

jest.mock('../../iframeApi/closeIframe', () => ({
  closeIframe: jest.fn()
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        colorTextPrimary: '#000',
        colorTextSecondary: '#666'
      }
    }
  }),
  Text: ({ children, ...rest }: { children?: React.ReactNode }) => (
    <span {...rest}>{children}</span>
  )
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Key: () => <span data-testid="key-icon" />,
  SyncLock: () => <span data-testid="sync-icon" />
}))

describe('PasswordSuggestionV2', () => {
  let postMessageSpy: jest.SpyInstance

  beforeEach(() => {
    postMessageSpy = jest.spyOn(window.parent, 'postMessage')
    postMessageSpy.mockImplementation(() => {})
    mockRefetchVault.mockClear()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    postMessageSpy.mockRestore()
  })

  it('sends setStyles and refetch on mount, and insertPassword with router ids on fill click', () => {
    render(<PasswordSuggestionV2 />)

    const setStylesMessages = postMessageSpy.mock.calls
      .map((c) => c[0] as { type: string; data: unknown })
      .filter((m) => m.type === 'setStyles')
    expect(setStylesMessages.length).toBeGreaterThan(0)
    const lastSetStyles = setStylesMessages[setStylesMessages.length - 1] as {
      type: 'setStyles'
      data: {
        iframeId: string
        iframeType: string
        style: { width: string; height: string; borderRadius: string }
      }
    }
    expect(lastSetStyles.data.iframeId).toBe('iframe-sug-1')
    expect(lastSetStyles.data.iframeType).toBe('suggestion-iframe')
    expect(lastSetStyles.data.style.borderRadius).toBe('12px')
    expect(lastSetStyles.data.style.width).toMatch(/\d+px$/)
    expect(lastSetStyles.data.style.height).toMatch(/\d+px$/)

    expect(mockRefetchVault).toHaveBeenCalled()

    const fill = screen.getByTestId('passwordsuggestionv2-fill')
    fireEvent.click(fill)

    const insertCall = postMessageSpy.mock.calls
      .map((c) => c[0] as { type: string; data: unknown })
      .find((m) => m.type === 'insertPassword') as {
      type: 'insertPassword'
      data: {
        iframeId: string
        iframeType: string
        password: string
      }
    }
    expect(insertCall).toBeDefined()
    expect(insertCall.data.iframeId).toBe('iframe-sug-1')
    expect(insertCall.data.iframeType).toBe('suggestion-iframe')
    expect(insertCall.data.password).toBe('SUGGESTED_PASSWORD_24___')
  })
})
