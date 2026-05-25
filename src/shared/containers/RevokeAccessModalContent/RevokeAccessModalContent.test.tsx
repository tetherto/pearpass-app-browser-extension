import { act, fireEvent, render, screen } from '@testing-library/react'
import { kickDevice, useVault } from '@tetherto/pearpass-lib-vault'

import { RevokeAccessModalContent } from './index'
import { useModal } from '../../context/ModalContext'
import { useToast } from '../../context/ToastContext'

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  kickDevice: jest.fn(),
  useVault: jest.fn()
}))

jest.mock('../../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('../../context/ToastContext', () => ({
  useToast: jest.fn()
}))

jest.mock('../../utils/logger', () => ({
  logger: { error: jest.fn() }
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const liftTestID = ({ testID, ...rest }: any) =>
    testID ? { ...rest, 'data-testid': testID } : rest
  return {
    Button: ({ children, onClick, disabled, isLoading, ...rest }: any) => (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        {...liftTestID(rest)}
      >
        {children}
      </button>
    ),
    Dialog: ({ children, footer }: any) => (
      <div>
        {children}
        {footer}
      </div>
    ),
    Text: ({ children }: any) => <span>{children}</span>
  }
})

const mockedKickDevice = jest.mocked(kickDevice)
const mockedUseVault = jest.mocked(useVault)
const mockedUseModal = jest.mocked(useModal)
const mockedUseToast = jest.mocked(useToast)

describe('RevokeAccessModalContent', () => {
  const refetchVault = jest.fn()
  const closeModal = jest.fn()
  const setToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    refetchVault.mockResolvedValue(undefined)
    mockedUseVault.mockReturnValue({
      refetch: refetchVault
    } as unknown as ReturnType<typeof useVault>)
    mockedUseModal.mockReturnValue({
      closeModal
    } as unknown as ReturnType<typeof useModal>)
    mockedUseToast.mockReturnValue({ setToast } as unknown as ReturnType<
      typeof useToast
    >)
  })

  const renderModal = () =>
    render(
      <RevokeAccessModalContent
        vaultId="v1"
        targetDeviceId="d2"
        deviceName="iPhone"
      />
    )

  const submit = async () => {
    await act(async () => {
      fireEvent.click(screen.getByTestId('revoke-access-submit'))
    })
  }

  it('on success: closes the modal and shows the success toast', async () => {
    mockedKickDevice.mockResolvedValue({ results: [], failures: [] } as any)

    renderModal()
    await submit()

    expect(mockedKickDevice).toHaveBeenCalledWith({
      vaultId: 'v1',
      targetDeviceId: 'd2'
    })
    expect(refetchVault).toHaveBeenCalledWith('v1')
    expect(closeModal).toHaveBeenCalled()
    expect(setToast).toHaveBeenCalledWith({
      message: expect.stringMatching(/no longer has access/)
    })
  })

  it('on partial failure: closes the modal and shows the unreachable-device toast', async () => {
    mockedKickDevice.mockResolvedValue({
      results: [],
      failures: [{ targetDeviceId: 'd2', error: new Error('offline') }]
    } as any)

    renderModal()
    await submit()

    expect(closeModal).toHaveBeenCalled()
    expect(setToast).toHaveBeenCalledWith({
      message: expect.stringMatching(/lose access next time it comes online/)
    })
  })

  it('on kickDevice throw: shows the generic error toast, keeps the modal open with submit re-enabled', async () => {
    mockedKickDevice.mockRejectedValue(new Error('boom'))

    renderModal()
    await submit()

    expect(closeModal).not.toHaveBeenCalled()
    expect(setToast).toHaveBeenCalledWith({
      message: expect.stringMatching(/Couldn't revoke access/)
    })
    expect(
      (screen.getByTestId('revoke-access-submit') as HTMLButtonElement).disabled
    ).toBe(false)
  })
})
