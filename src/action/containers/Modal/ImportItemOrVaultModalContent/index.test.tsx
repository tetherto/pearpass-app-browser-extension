import React from 'react'

import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  __esModule: true,
  Dialog: ({
    title,
    onClose,
    children,
    footer,
    testID,
    closeButtonTestID
  }: {
    title: React.ReactNode
    onClose?: () => void
    children?: React.ReactNode
    footer?: React.ReactNode
    testID?: string
    closeButtonTestID?: string
  }) => (
    <div data-testid={testID} role="dialog">
      <div>
        <h2>{title}</h2>
        <button data-testid={closeButtonTestID} onClick={onClose}>
          close
        </button>
      </div>
      <div>{children}</div>
      <div>{footer}</div>
    </div>
  ),
  InputField: ({
    label,
    value,
    onChange,
    placeholder,
    disabled,
    testID,
    rightSlot
  }: {
    label?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    disabled?: boolean
    testID?: string
    rightSlot?: React.ReactNode
  }) => (
    <label>
      <span>{label}</span>
      <input
        data-testid={testID}
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
      />
      {rightSlot}
    </label>
  ),
  ListItem: ({
    title,
    subtitle,
    icon,
    rightElement,
    onClick,
    testID
  }: {
    title?: string
    subtitle?: string
    icon?: React.ReactNode
    rightElement?: React.ReactNode
    onClick?: () => void
    testID?: string
  }) => (
    <div
      data-testid={testID}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {icon ? <span>{icon}</span> : null}
      <span>{title}</span>
      {subtitle ? <small>{subtitle}</small> : null}
      {rightElement ? <span>{rightElement}</span> : null}
    </div>
  ),
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    ...rest
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean
    iconBefore?: React.ReactNode
    variant?: string
    size?: string
  }) => {
    // strip non-DOM props so they don't become unknown HTML attrs
    const {
      isLoading: _isLoading,
      iconBefore,
      variant: _variant,
      size: _size,
      ...domProps
    } = rest
    return (
      <button {...domProps} onClick={onClick} disabled={disabled}>
        {iconBefore}
        {children}
      </button>
    )
  },
  useTheme: () => ({
    theme: {
      colors: {
        colorTextPrimary: '#fff',
        colorTextSecondary: '#aaa',
        colorPrimary: '#b0d944'
      }
    }
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  __esModule: true,
  ContentPaste: () => <span data-testid="icon-content-paste" />,
  ExpandMore: () => <span data-testid="icon-expand-more" />,
  LockOutlined: () => <span data-testid="icon-lock-outlined" />
}))

const mockPairActiveVault = jest.fn()
const mockCancelPairActiveVault = jest.fn()
const mockRefetch = jest.fn(async () => undefined)
const mockAddDevice = jest.fn(async () => undefined)
const mockUseGlobalLoading = jest.fn()
const mockSetShouldBypassAutoLock = jest.fn()
const mockNavigate = jest.fn()
const mockSetToast = jest.fn()

let mockVaultData: { id?: string; name?: string; role?: string } | undefined = {
  id: 'vault-1',
  name: 'Work',
  role: 'Editor'
}
let mockRecordsData: Array<{
  id: string
  type: string
  data?: { title?: string; username?: string; email?: string }
}> = []
let mockIsPairing = false

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  __esModule: true,
  useVault: () => ({
    data: mockVaultData,
    refetch: mockRefetch,
    addDevice: mockAddDevice
  }),
  usePair: () => ({
    pairActiveVault: mockPairActiveVault,
    cancelPairActiveVault: mockCancelPairActiveVault,
    isLoading: mockIsPairing
  }),
  useRecords: () => ({ data: mockRecordsData })
}))

jest.mock('../../../../hooks/useAutoLockPreferences', () => ({
  __esModule: true,
  useAutoLockPreferences: () => ({
    setShouldBypassAutoLock: mockSetShouldBypassAutoLock
  })
}))

jest.mock('../../../../shared/context/LoadingContext', () => ({
  __esModule: true,
  useGlobalLoading: (v: { isLoading: boolean }) => mockUseGlobalLoading(v)
}))

jest.mock('../../../../shared/context/RouterContext', () => ({
  __esModule: true,
  useRouter: () => ({ navigate: mockNavigate })
}))

jest.mock('../../../../shared/context/ToastContext', () => ({
  __esModule: true,
  useToast: () => ({ setToast: mockSetToast })
}))

jest.mock('../../../../shared/utils/logger', () => ({
  __esModule: true,
  logger: { error: jest.fn() }
}))

import { ImportItemOrVaultModalContent } from './index'

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

const setupChromeSendMessage = () => {
  const sendMessage = jest.fn(
    (
      _msg: { type: string },
      cb?: (p: { os: string; arch: string }) => void
    ) => {
      cb?.({ os: 'mac', arch: 'arm64' })
    }
  )
  ;(global as unknown as { chrome: unknown }).chrome = {
    runtime: { sendMessage }
  }
  return sendMessage
}

describe('ImportItemOrVaultModalContent', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    onClose.mockClear()
    mockPairActiveVault.mockReset()
    mockCancelPairActiveVault.mockClear()
    mockRefetch.mockClear()
    mockAddDevice.mockClear()
    mockUseGlobalLoading.mockClear()
    mockSetShouldBypassAutoLock.mockClear()
    mockNavigate.mockClear()
    mockSetToast.mockClear()

    mockVaultData = { id: 'vault-1', name: 'Work', role: 'Editor' }
    mockRecordsData = []
    mockIsPairing = false

    setupChromeSendMessage()

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { readText: jest.fn() }
    })
  })

  it('renders the share-link entry step by default', () => {
    render(<ImportItemOrVaultModalContent onClose={onClose} />)

    expect(screen.getByTestId('import-vault-dialog')).toBeInTheDocument()
    expect(screen.getByText('Import Item or Vault')).toBeInTheDocument()
    expect(screen.getByText('Share Link')).toBeInTheDocument()
    expect(screen.getByTestId('import-share-link-input')).toBeInTheDocument()
    expect(screen.getByTestId('import-share-link-paste')).toBeInTheDocument()
    expect(screen.getByTestId('import-modal-discard')).toBeInTheDocument()
    expect(screen.getByTestId('import-modal-continue')).toBeInTheDocument()
  })

  it('disables Continue until the share link has a non-empty value', () => {
    render(<ImportItemOrVaultModalContent onClose={onClose} />)

    const continueBtn = screen.getByTestId(
      'import-modal-continue'
    ) as HTMLButtonElement
    expect(continueBtn).toBeDisabled()

    fireEvent.change(screen.getByTestId('import-share-link-input'), {
      target: { value: 'share-code-xyz' }
    })

    expect(continueBtn).not.toBeDisabled()
  })

  it('runs the pair pipeline on Continue and advances to the preview step', async () => {
    mockPairActiveVault.mockResolvedValue('vault-id-1')
    render(<ImportItemOrVaultModalContent onClose={onClose} />)

    fireEvent.change(screen.getByTestId('import-share-link-input'), {
      target: { value: '  share-code-xyz  ' }
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('import-modal-continue'))
      await flushPromises()
    })

    expect(mockPairActiveVault).toHaveBeenCalledWith('share-code-xyz')
    expect(mockRefetch).toHaveBeenCalledWith('vault-id-1')
    expect(mockAddDevice).toHaveBeenCalledWith('mac arm64')

    expect(screen.getByText('Import Vault')).toBeInTheDocument()
    expect(screen.getByText('Vault Found')).toBeInTheDocument()
    expect(
      screen.getByTestId('import-vault-preview-toggle')
    ).toBeInTheDocument()
    expect(screen.getByTestId('import-vault-preview-save')).toBeInTheDocument()
  })

  it('shows a toast on pair failure and stays on the entry step', async () => {
    mockPairActiveVault.mockResolvedValue(null)
    render(<ImportItemOrVaultModalContent onClose={onClose} />)

    fireEvent.change(screen.getByTestId('import-share-link-input'), {
      target: { value: 'bad-code' }
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('import-modal-continue'))
      await flushPromises()
    })

    expect(mockSetToast).toHaveBeenCalledTimes(1)
    expect(mockSetToast.mock.calls[0][0].message).toMatch(/invite code/)
    expect(screen.getByText('Import Item or Vault')).toBeInTheDocument()
    expect(
      (screen.getByTestId('import-share-link-input') as HTMLInputElement).value
    ).toBe('bad-code')
  })

  it('reads clipboard on Paste and pairs', async () => {
    ;(navigator.clipboard.readText as jest.Mock).mockResolvedValue('pasted-key')
    mockPairActiveVault.mockResolvedValue('vault-id-1')

    render(<ImportItemOrVaultModalContent onClose={onClose} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('import-share-link-paste'))
      await flushPromises()
    })

    expect(navigator.clipboard.readText).toHaveBeenCalled()
    expect(mockPairActiveVault).toHaveBeenCalledWith('pasted-key')
    expect(
      screen.getByTestId('import-vault-preview-toggle')
    ).toBeInTheDocument()
  })

  it('toasts when clipboard read fails', async () => {
    ;(navigator.clipboard.readText as jest.Mock).mockRejectedValue(
      new Error('denied')
    )

    render(<ImportItemOrVaultModalContent onClose={onClose} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('import-share-link-paste'))
      await flushPromises()
    })

    expect(mockSetToast).toHaveBeenCalledTimes(1)
    expect(mockSetToast.mock.calls[0][0].message).toMatch(/clipboard/)
    expect(mockPairActiveVault).not.toHaveBeenCalled()
  })

  it('on the preview step, Save Shared Vault navigates to the vault and closes', async () => {
    mockPairActiveVault.mockResolvedValue('vault-id-1')
    mockRecordsData = [
      { id: 'r1', type: 'login', data: { title: 'Lyft', username: 'a@b.c' } }
    ]

    render(<ImportItemOrVaultModalContent onClose={onClose} />)

    fireEvent.change(screen.getByTestId('import-share-link-input'), {
      target: { value: 'share-code' }
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('import-modal-continue'))
      await flushPromises()
    })

    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(
      screen.getByTestId('import-vault-preview-record-r1')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('import-vault-preview-save'))

    expect(mockNavigate).toHaveBeenCalledWith('vault', {
      params: {},
      state: { recordType: 'all' }
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Discard calls onClose and cancels an in-flight pair', () => {
    mockIsPairing = true

    render(<ImportItemOrVaultModalContent onClose={onClose} />)

    fireEvent.click(screen.getByTestId('import-modal-discard'))

    expect(mockCancelPairActiveVault).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('requests auto-lock bypass on mount and releases on unmount', () => {
    const { unmount } = render(
      <ImportItemOrVaultModalContent onClose={onClose} />
    )
    expect(mockSetShouldBypassAutoLock).toHaveBeenCalledWith(true)

    unmount()
    expect(mockSetShouldBypassAutoLock).toHaveBeenLastCalledWith(false)
  })

  it('omits the record list when the preview has no records', async () => {
    mockPairActiveVault.mockResolvedValue('vault-id-empty')
    mockRecordsData = []

    render(<ImportItemOrVaultModalContent onClose={onClose} />)

    fireEvent.change(screen.getByTestId('import-share-link-input'), {
      target: { value: 'share-code' }
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('import-modal-continue'))
      await flushPromises()
    })

    expect(
      screen.queryByTestId(/^import-vault-preview-record-/)
    ).not.toBeInTheDocument()
  })
})
