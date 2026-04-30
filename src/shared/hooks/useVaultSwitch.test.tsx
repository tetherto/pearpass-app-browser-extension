import { isValidElement } from 'react'

import { act, renderHook } from '@testing-library/react'
import { useVault, type Vault } from '@tetherto/pearpass-lib-vault'

import { VaultPasswordFormModalContent } from '../containers/VaultPasswordFormModalContent'
import { useLoadingContext } from '../context/LoadingContext'
import { useModal } from '../context/ModalContext'
import { useToast } from '../context/ToastContext'
import { logger } from '../utils/logger'

import { useVaultSwitch } from './useVaultSwitch'

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useVault: jest.fn()
}))

jest.mock('../context/LoadingContext', () => ({
  useLoadingContext: jest.fn()
}))

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('../context/ToastContext', () => ({
  useToast: jest.fn()
}))

jest.mock('../containers/VaultPasswordFormModalContent', () => ({
  VaultPasswordFormModalContent: jest.fn(() => null)
}))

jest.mock('../utils/logger', () => ({
  logger: { error: jest.fn() }
}))

const mockUseVault = useVault as jest.Mock
const mockUseLoadingContext = useLoadingContext as jest.Mock
const mockUseModal = useModal as jest.Mock
const mockUseToast = useToast as jest.Mock

describe('useVaultSwitch', () => {
  const mockSetIsLoading = jest.fn()
  const mockSetModal = jest.fn()
  const mockCloseModal = jest.fn()
  const mockRefetchVault = jest.fn()
  const mockIsVaultProtected = jest.fn()
  const mockSetToast = jest.fn()

  const activeVault: Vault = { id: 'v-active', name: 'Active' }
  const otherVault: Vault = { id: 'v-other', name: 'Other' }

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseLoadingContext.mockReturnValue({ setIsLoading: mockSetIsLoading })
    mockUseModal.mockReturnValue({
      setModal: mockSetModal,
      closeModal: mockCloseModal
    })
    mockUseToast.mockReturnValue({ setToast: mockSetToast })

    mockUseVault.mockReturnValue({
      data: activeVault,
      isVaultProtected: mockIsVaultProtected,
      refetch: mockRefetchVault
    })
  })

  it('runs onSuccess and skips refetch when switching to the already active vault', async () => {
    const onSuccess = jest.fn()

    const { result } = renderHook(() => useVaultSwitch())

    await act(async () => {
      await result.current.switchVault(activeVault, onSuccess)
    })

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(mockIsVaultProtected).not.toHaveBeenCalled()
    expect(mockRefetchVault).not.toHaveBeenCalled()
    expect(mockSetModal).not.toHaveBeenCalled()
    expect(mockSetIsLoading).toHaveBeenCalledWith(true)
    expect(mockSetIsLoading).toHaveBeenLastCalledWith(false)
  })

  it('refetches unprotected vault then runs onSuccess', async () => {
    mockIsVaultProtected.mockResolvedValue(false)
    mockRefetchVault.mockResolvedValue(undefined)
    const onSuccess = jest.fn()

    const { result } = renderHook(() => useVaultSwitch())

    await act(async () => {
      await result.current.switchVault(otherVault, onSuccess)
    })

    expect(mockIsVaultProtected).toHaveBeenCalledWith(otherVault.id)
    expect(mockRefetchVault).toHaveBeenCalledWith(otherVault.id)
    expect(mockRefetchVault).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(mockSetModal).not.toHaveBeenCalled()
    expect(mockSetIsLoading).toHaveBeenLastCalledWith(false)
  })

  it('opens password modal when target vault is protected (no refetch until submit)', async () => {
    mockIsVaultProtected.mockResolvedValue(true)

    const { result } = renderHook(() => useVaultSwitch())

    await act(async () => {
      await result.current.switchVault(otherVault)
    })

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    expect(mockRefetchVault).not.toHaveBeenCalled()
    const modalElement = mockSetModal.mock.calls[0][0]
    expect(isValidElement(modalElement)).toBe(true)
    expect(modalElement.type).toBe(VaultPasswordFormModalContent)
    expect(modalElement.props).toMatchObject({
      vault: otherVault,
      onSubmit: expect.any(Function)
    })
  })

  it('refetches with password, closes modal, and runs onSuccess from modal onSubmit', async () => {
    mockIsVaultProtected.mockResolvedValue(true)
    mockRefetchVault.mockResolvedValue(undefined)
    const onSuccess = jest.fn()

    const { result } = renderHook(() => useVaultSwitch())

    await act(async () => {
      await result.current.switchVault(otherVault, onSuccess)
    })

    const modalElement = mockSetModal.mock.calls[0][0]
    expect(isValidElement(modalElement)).toBe(true)
    const { onSubmit } = modalElement.props as {
      onSubmit: (password: string) => Promise<void>
    }

    await act(async () => {
      await onSubmit('secret')
    })

    expect(mockRefetchVault).toHaveBeenCalledWith(otherVault.id, {
      password: 'secret'
    })
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('logs and shows a toast when refetch fails', async () => {
    mockIsVaultProtected.mockResolvedValue(false)
    const err = new Error('refetch failed')
    mockRefetchVault.mockRejectedValue(err)
    const onSuccess = jest.fn()

    const { result } = renderHook(() => useVaultSwitch())

    await act(async () => {
      await result.current.switchVault(otherVault, onSuccess)
    })

    expect(logger.error).toHaveBeenCalledWith(
      'useVaultSwitch',
      'Error switching to vault:',
      err
    )
    expect(mockSetToast).toHaveBeenCalledWith({
      message: expect.any(String)
    })
    expect(onSuccess).not.toHaveBeenCalled()
    expect(mockSetIsLoading).toHaveBeenLastCalledWith(false)
  })

  it('throws when protected vault refetch fails after password submit', async () => {
    mockIsVaultProtected.mockResolvedValue(true)
    const err = new Error('protected refetch failed')
    mockRefetchVault.mockRejectedValue(err)
    const onSuccess = jest.fn()

    const { result } = renderHook(() => useVaultSwitch())

    await act(async () => {
      await result.current.switchVault(otherVault, onSuccess)
    })

    const modalElement = mockSetModal.mock.calls[0][0]
    const { onSubmit } = modalElement.props as {
      onSubmit: (password: string) => Promise<void>
    }

    let caught: unknown
    await act(async () => {
      try {
        await onSubmit('wrong')
      } catch (e) {
        caught = e
      }
    })
    expect(caught).toBe(err)
  })
})
