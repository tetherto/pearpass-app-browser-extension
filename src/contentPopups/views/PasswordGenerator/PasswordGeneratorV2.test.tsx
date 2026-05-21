import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { PasswordGenerator } from './index'

type MockTextOrTitleProps = {
  children?: React.ReactNode
  as?: React.ElementType
} & Record<string, unknown>

type MockButtonProps = {
  children?: React.ReactNode
  onClick?: () => void
  'data-testid'?: string
  type?: string
}

type MockPasswordIndicatorProps = {
  variant: string
}

jest.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

jest.mock('@tetherto/pearpass-utils-password-generator', () => ({
  generatePassword: () => 'MockedPwd1!aa',
  generatePassphrase: () => ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
}))

jest.mock('@tetherto/pearpass-utils-password-check', () => ({
  checkPasswordStrength: () => ({ type: 'weak' }),
  checkPassphraseStrength: () => ({ type: 'vulnerable' })
}))

const mockRefetchVault = jest.fn()
jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useVault: () => ({ refetch: mockRefetchVault }),
  useRecords: () => ({ data: [] })
}))

jest.mock('../../../shared/context/RouterContext', () => ({
  useRouter: () => ({
    state: {
      recordType: 'all',
      iframeId: 'iframe-test-1',
      iframeType: 'content-test'
    }
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const R = require('react')
  return {
    useTheme: () => ({
      theme: {
        colors: {
          colorTextPrimary: '#000',
          colorTextSecondary: '#666',
          colorPrimary: '#0066cc',
          colorBorderPrimary: '#ddd'
        }
      }
    }),
    Text: (props: MockTextOrTitleProps) => {
      const { children, as: Comp = 'span', ...rest } = props
      return R.createElement(Comp, rest, children)
    },
    Title: (props: MockTextOrTitleProps) => {
      const { children, as: Comp = 'h3', ...rest } = props
      return R.createElement(Comp, rest, children)
    },
    Button: (props: MockButtonProps) => {
      const {
        children,
        onClick,
        'data-testid': dataTestId,
        type = 'button'
      } = props
      return R.createElement(
        'button',
        {
          'data-testid': dataTestId,
          type,
          onClick
        },
        children
      )
    },
    PasswordIndicator: (props: MockPasswordIndicatorProps) => {
      const { variant } = props
      return R.createElement('div', {
        'data-testid': 'password-indicator-stub',
        'data-variant': variant
      })
    },
    Radio: () => R.createElement('div', { 'data-testid': 'radio-stub' }),
    Slider: () => R.createElement('div', { 'data-testid': 'slider-stub' }),
    ListItem: () => R.createElement('div', { 'data-testid': 'listitem-stub' }),
    ToggleSwitch: () => R.createElement('div', { 'data-testid': 'toggle-stub' })
  }
})

describe('PasswordGenerator', () => {
  let postMessageSpy: jest.SpyInstance

  beforeEach(() => {
    postMessageSpy = jest.spyOn(window.parent, 'postMessage')
    postMessageSpy.mockImplementation(() => {})
  })

  afterEach(() => {
    postMessageSpy.mockRestore()
  })

  it('sends setStyles, maps strength to PasswordIndicator, and insertPassword on Use Password', () => {
    render(<PasswordGenerator />)

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
    expect(lastSetStyles.data.iframeId).toBe('iframe-test-1')
    expect(lastSetStyles.data.iframeType).toBe('content-test')
    expect(lastSetStyles.data.style.borderRadius).toBe('12px')
    expect(lastSetStyles.data.style.width).toMatch(/\d+px$/)
    expect(lastSetStyles.data.style.height).toMatch(/\d+px$/)

    const indicator = screen.getByTestId('password-indicator-stub')
    expect(indicator).toHaveAttribute('data-variant', 'decent')

    const useButton = screen.getByTestId('generatepassword-button-primary-v2')
    fireEvent.click(useButton)

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
    expect(insertCall.data.iframeId).toBe('iframe-test-1')
    expect(insertCall.data.iframeType).toBe('content-test')
    expect(insertCall.data.password).toBe('MockedPwd1!aa')
  })
})
