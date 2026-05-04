import React, { isValidElement } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { VaultSelector } from './VaultSelector'
import { CreateOrEditVaultModalContentV2 } from '../CreateOrEditVaultModalContentV2'
import { ShareVaultModalContentV2 } from '../ShareVaultModalContentV2'

const mockSetIsLoading = jest.fn()
const mockSetModal = jest.fn()
const mockCloseModal = jest.fn()
const mockSwitchVault = jest.fn()
const mockCreateInvite = jest.fn()

jest.mock('./VaultSelector.styles', () => ({
  VAULT_ACTIONS_MENU_WIDTH: 180,
  createStyles: () => ({
    wrapper: {},
    titleRow: {},
    titleLabel: {},
    list: {},
    vaultRow: {},
    rowActions: {},
    menuGroup: {},
    iconActionButton: {}
  })
}))

jest.mock('../../context/LoadingContext', () => ({
  useLoadingContext: () => ({ setIsLoading: mockSetIsLoading })
}))

jest.mock('../../context/ModalContext', () => ({
  useModal: () => ({
    setModal: mockSetModal,
    closeModal: mockCloseModal
  })
}))

jest.mock('../../hooks/useVaultSwitch', () => ({
  useVaultSwitch: () => ({ switchVault: mockSwitchVault })
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useVaults: jest.fn(),
  useVault: jest.fn(),
  useInvite: jest.fn()
}))

jest.mock('../CreateOrEditVaultModalContentV2', () => {
  const R = require('react')
  return {
    CreateOrEditVaultModalContentV2: (props: Record<string, unknown>) =>
      R.createElement('div', {
        'data-testid': 'create-or-edit-vault-modal',
        ...props
      })
  }
})

jest.mock('../ShareVaultModalContentV2', () => {
  const R = require('react')
  return {
    ShareVaultModalContentV2: () =>
      R.createElement('div', { 'data-testid': 'share-vault-modal' })
  }
})

jest.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray | string) =>
    typeof strings === 'string' ? strings : strings[0]
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Add: () => <span data-testid="icon-add" />,
  EditOutlined: () => <span data-testid="icon-edit" />,
  LockFilled: () => <span data-testid="icon-lock" />,
  MoreVert: () => <span data-testid="icon-more" />,
  PersonAddAlt: () => <span data-testid="icon-person-add" />
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        colorTextPrimary: '#111111',
        colorTextSecondary: '#222222'
      }
    }
  }),
  Button: ({
    children,
    onClick,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    iconBefore
  }: {
    children?: React.ReactNode
    onClick?: () => void
    'data-testid'?: string
    'aria-label'?: string
    iconBefore?: React.ReactNode
  }) => (
    <button
      type="button"
      data-testid={dataTestId}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {iconBefore}
      {children}
    </button>
  ),
  ContextMenu: ({
    trigger,
    children
  }: {
    trigger: React.ReactNode
    children: React.ReactNode
  }) => (
    <div data-testid="context-menu">
      <div data-testid="context-menu-trigger">{trigger}</div>
      <div data-testid="context-menu-panel">{children}</div>
    </div>
  ),
  ListItem: ({
    title,
    onClick,
    testID,
    rightElement
  }: {
    title: string
    onClick?: () => void
    testID?: string
    rightElement?: React.ReactNode
  }) => (
    <div data-testid={testID} role="presentation" onClick={onClick}>
      <span>{title}</span>
      {rightElement}
    </div>
  ),
  NavbarListItem: ({
    label,
    onClick,
    testID
  }: {
    label: string
    onClick?: () => void
    testID?: string
  }) => (
    <button type="button" data-testid={testID} onClick={onClick}>
      {label}
    </button>
  ),
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>
}))

import { useInvite, useVault, useVaults } from '@tetherto/pearpass-lib-vault'

const mockUseVaults = useVaults as jest.Mock
const mockUseVault = useVault as jest.Mock
const mockUseInvite = useInvite as jest.Mock

describe('VaultSelector', () => {
  const vaultAlpha = { id: 'vault-alpha', name: 'Alpha' }
  const vaultBeta = { id: 'vault-beta', name: 'Beta' }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSwitchVault.mockResolvedValue(undefined)
    mockCreateInvite.mockResolvedValue(undefined)

    mockUseVaults.mockReturnValue({
      data: [vaultBeta, vaultAlpha]
    })
    mockUseVault.mockReturnValue({
      data: vaultBeta
    })
    mockUseInvite.mockReturnValue({
      data: { vaultId: vaultBeta.id },
      createInvite: mockCreateInvite
    })
  })

  it('renders the vault list sorted by name', () => {
    render(<VaultSelector />)

    const titles = screen.getAllByText(/Alpha|Beta/)
    expect(titles.map((n) => n.textContent)).toEqual(['Alpha', 'Beta'])
  })

  it('calls switchVault when selecting a vault that is not active', () => {
    render(<VaultSelector />)

    fireEvent.click(screen.getByTestId(`vault-row-${vaultAlpha.id}`))

    expect(mockSwitchVault).toHaveBeenCalledTimes(1)
    expect(mockSwitchVault).toHaveBeenCalledWith(vaultAlpha)
  })

  it('does not call switchVault when clicking the active vault', () => {
    render(<VaultSelector />)

    fireEvent.click(screen.getByTestId(`vault-row-${vaultBeta.id}`))

    expect(mockSwitchVault).not.toHaveBeenCalled()
  })

  it('calls onClose when selecting any vault', () => {
    const onClose = jest.fn()
    render(<VaultSelector onClose={onClose} />)

    fireEvent.click(screen.getByTestId(`vault-row-${vaultAlpha.id}`))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId(`vault-row-${vaultBeta.id}`))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('opens create vault modal when create is clicked', () => {
    render(<VaultSelector />)

    fireEvent.click(screen.getByTestId('vault-selector-create'))

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const modal = mockSetModal.mock.calls[0][0] as React.ReactElement<{
      onClose: () => void
      onSuccess: () => void
    }>
    expect(modal.type).toBe(CreateOrEditVaultModalContentV2)
    expect(modal.props).toMatchObject({
      onClose: mockCloseModal
    })
    expect(typeof modal.props.onSuccess).toBe('function')
  })

  it('closes the modal and calls onClose when create vault succeeds', () => {
    const onClose = jest.fn()
    render(<VaultSelector onClose={onClose} />)

    fireEvent.click(screen.getByTestId('vault-selector-create'))

    const modal = mockSetModal.mock.calls[0][0] as React.ReactElement<{
      onSuccess: () => void
    }>
    modal.props.onSuccess()

    expect(mockCloseModal).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('opens rename modal with the selected vault', () => {
    render(<VaultSelector />)

    fireEvent.click(screen.getByTestId(`vault-row-rename-${vaultBeta.id}`))

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const modal = mockSetModal.mock.calls[0][0] as React.ReactElement
    expect(modal.type).toBe(CreateOrEditVaultModalContentV2)
    expect(modal.props).toMatchObject({
      vault: vaultBeta,
      onClose: mockCloseModal,
      onSuccess: mockCloseModal
    })
  })

  it('skips createInvite when invite target already matches inviteData.vaultId, then opens share modal', async () => {
    render(<VaultSelector />)

    fireEvent.click(screen.getByTestId(`vault-row-invite-${vaultBeta.id}`))

    await waitFor(() => {
      expect(mockSetModal).toHaveBeenCalledTimes(1)
    })

    expect(mockCreateInvite).not.toHaveBeenCalled()
    expect(mockSetIsLoading).not.toHaveBeenCalled()
    const shareNode = mockSetModal.mock.calls[0][0] as React.ReactElement
    expect(isValidElement(shareNode)).toBe(true)
    expect(shareNode.type).toBe(ShareVaultModalContentV2)
  })

  it('runs createInvite with loading when inviteData vault differs, then opens share modal', async () => {
    mockUseInvite.mockReturnValue({
      data: { vaultId: vaultAlpha.id },
      createInvite: mockCreateInvite
    })

    render(<VaultSelector />)

    fireEvent.click(screen.getByTestId(`vault-row-invite-${vaultBeta.id}`))

    await waitFor(() => {
      expect(mockCreateInvite).toHaveBeenCalledTimes(1)
    })

    expect(mockSetIsLoading).toHaveBeenCalledWith(true)
    expect(mockSetIsLoading).toHaveBeenLastCalledWith(false)
    await waitFor(() => {
      expect(mockSetModal).toHaveBeenCalledTimes(1)
    })
    const shareNode = mockSetModal.mock.calls[0][0] as React.ReactElement
    expect(isValidElement(shareNode)).toBe(true)
    expect(shareNode.type).toBe(ShareVaultModalContentV2)
  })
})
