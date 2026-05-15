import { act, renderHook } from '@testing-library/react'
import {
  useCreateVault,
  useVault,
  useVaults
} from '@tetherto/pearpass-lib-vault'
import { pearpassVaultClient } from '@tetherto/pearpass-lib-vault/src/instances'

import { useVaultAccessRevoked } from './useVaultAccessRevoked'
import { useVaultSwitch } from './useVaultSwitch'
import { useModal } from '../context/ModalContext'
import { useRouter } from '../context/RouterContext'
import { useToast } from '../context/ToastContext'

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useCreateVault: jest.fn(),
  useVault: jest.fn(),
  useVaults: jest.fn()
}))

jest.mock('@tetherto/pearpass-lib-vault/src/instances', () => ({
  pearpassVaultClient: {
    on: jest.fn(),
    off: jest.fn()
  }
}))

jest.mock('./useVaultSwitch', () => ({
  useVaultSwitch: jest.fn()
}))

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('../context/RouterContext', () => ({
  useRouter: jest.fn()
}))

jest.mock('../context/ToastContext', () => ({
  useToast: jest.fn()
}))

jest.mock('../containers/AccessRemovedModalContent', () => ({
  AccessRemovedModalContent: jest.fn(() => null)
}))

jest.mock('../utils/logger', () => ({
  logger: { error: jest.fn() }
}))

const mockUseVault = useVault as jest.Mock
const mockUseVaults = useVaults as jest.Mock
const mockUseCreateVault = useCreateVault as jest.Mock
const mockUseVaultSwitch = useVaultSwitch as jest.Mock
const mockUseModal = useModal as jest.Mock
const mockUseRouter = useRouter as jest.Mock
const mockUseToast = useToast as jest.Mock
const mockClient = pearpassVaultClient as unknown as {
  on: jest.Mock
  off: jest.Mock
}

describe('useVaultAccessRevoked', () => {
  const setModal = jest.fn()
  const setToast = jest.fn()
  const navigate = jest.fn()
  const deleteVaultLocal = jest.fn()
  const switchVault = jest.fn()
  const createVault = jest.fn()
  const addDevice = jest.fn()

  const activeVault = { id: 'v-active', name: 'Active', devices: [] }
  const otherVault = { id: 'v-other', name: 'Other' }

  let revokedHandler: (payload: unknown) => void = () => {}

  beforeEach(() => {
    jest.clearAllMocks()

    mockClient.on.mockImplementation((event, handler) => {
      if (event === 'vault-access-revoked') revokedHandler = handler
    })

    mockUseModal.mockReturnValue({ setModal })
    mockUseToast.mockReturnValue({ setToast })
    mockUseRouter.mockReturnValue({ navigate })
    mockUseVaultSwitch.mockReturnValue({ switchVault })
    mockUseCreateVault.mockReturnValue({ createVault })

    mockUseVaults.mockReturnValue({ data: [activeVault, otherVault] })
    mockUseVault.mockReturnValue({
      data: activeVault,
      deleteVaultLocal,
      addDevice
    })

    deleteVaultLocal.mockResolvedValue(undefined)
    switchVault.mockResolvedValue(undefined)
    createVault.mockResolvedValue(undefined)
    addDevice.mockResolvedValue(undefined)
  })

  it('subscribes to vault-access-revoked on mount and unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useVaultAccessRevoked())
    expect(mockClient.on).toHaveBeenCalledWith(
      'vault-access-revoked',
      expect.any(Function)
    )
    unmount()
    expect(mockClient.off).toHaveBeenCalledWith(
      'vault-access-revoked',
      expect.any(Function)
    )
  })

  it('ignores payloads with no vaultId', async () => {
    renderHook(() => useVaultAccessRevoked())
    await act(async () => revokedHandler({}))
    expect(deleteVaultLocal).not.toHaveBeenCalled()
    expect(setModal).not.toHaveBeenCalled()
  })

  it('ignores payloads for an unknown vault (duplicate / self delivery)', async () => {
    renderHook(() => useVaultAccessRevoked())
    await act(async () => revokedHandler({ vaultId: 'v-unknown' }))
    expect(deleteVaultLocal).not.toHaveBeenCalled()
    expect(setModal).not.toHaveBeenCalled()
  })

  it('wipes the active vault and switches to the next when one exists', async () => {
    renderHook(() => useVaultAccessRevoked())
    await act(async () => revokedHandler({ vaultId: 'v-active' }))

    expect(deleteVaultLocal).toHaveBeenCalledWith('v-active')
    expect(switchVault).toHaveBeenCalledWith(otherVault)
    expect(createVault).not.toHaveBeenCalled()
    expect(setModal).toHaveBeenCalledTimes(1)
  })

  it('creates a fallback Personal vault when no other vault remains', async () => {
    mockUseVaults.mockReturnValue({ data: [activeVault] })

    renderHook(() => useVaultAccessRevoked())
    await act(async () => revokedHandler({ vaultId: 'v-active' }))

    expect(deleteVaultLocal).toHaveBeenCalledWith('v-active')
    expect(createVault).toHaveBeenCalled()
    expect(addDevice).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith('vault', {
      state: { recordType: 'all' }
    })
    expect(setToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/Personal/)
      })
    )
  })

  it('toasts a recovery error when fallback Personal creation fails', async () => {
    mockUseVaults.mockReturnValue({ data: [activeVault] })
    createVault.mockRejectedValue(new Error('boom'))

    renderHook(() => useVaultAccessRevoked())
    await act(async () => revokedHandler({ vaultId: 'v-active' }))

    expect(setToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/Couldn't create a starter vault/)
      })
    )
  })

  it('still shows the access-removed modal when delete fails locally', async () => {
    deleteVaultLocal.mockRejectedValue(new Error('disk-full'))

    renderHook(() => useVaultAccessRevoked())
    await act(async () => revokedHandler({ vaultId: 'v-active' }))

    expect(setModal).toHaveBeenCalledTimes(1)
    expect(switchVault).not.toHaveBeenCalled()
    expect(createVault).not.toHaveBeenCalled()
  })
})
