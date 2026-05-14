import { renderHook } from '@testing-library/react'

import { useRecordActionItems } from './useRecordActionItems'
import { useModal } from '../context/ModalContext'
import { useRouter } from '../context/RouterContext'
import { useToast } from '../context/ToastContext'

const mockDeleteRecord = jest.fn()
const mockUpdateFavoriteState = jest.fn()
const mockUpdateRecords = jest.fn()
const mockSetToast = jest.fn()

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('../context/RouterContext', () => ({
  useRouter: jest.fn()
}))

const mockIsV2 = jest.fn(() => false)

jest.mock('../utils/designVersion', () => ({
  isV2: () => mockIsV2()
}))

jest.mock('../containers/MoveFolderModalContent', () => ({
  __esModule: true,
  MoveFolderModalContent: 'MoveFolderModalContent'
}))

jest.mock('../containers/MoveFolderModalContentV2', () => ({
  __esModule: true,
  MoveFolderModalContentV2: 'MoveFolderModalContentV2'
}))

jest.mock('../containers/ConfirmationModalContent', () => ({
  __esModule: true,
  ConfirmationModalContent: 'ConfirmationModalContent'
}))

jest.mock('../containers/DeleteRecordsModalContentV2', () => ({
  __esModule: true,
  DeleteRecordsModalContentV2: 'DeleteRecordsModalContentV2'
}))

const mockHandleCreateOrEditRecord = jest.fn()

jest.mock('../../action/hooks/useCreateOrEditRecord', () => ({
  useCreateOrEditRecord: () => ({
    handleCreateOrEditRecord: mockHandleCreateOrEditRecord
  })
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useRecords: () => ({
    deleteRecords: mockDeleteRecord,
    updateFavoriteState: mockUpdateFavoriteState,
    updateRecords: mockUpdateRecords
  }),
  RECORD_TYPES: {
    LOGIN: 'login'
  }
}))

jest.mock('../context/ToastContext', () => ({
  useToast: jest.fn()
}))

jest.mock('@lingui/core/macro', () => ({
  t: () => jest.fn((text) => text)
}))

describe('useRecordActionItems', () => {
  const mockRecord = { id: '123', isFavorite: false, type: 'login' }
  const mockOnSelect = jest.fn()
  const mockOnClose = jest.fn()

  const mockSetModal = jest.fn()
  const mockCloseModal = jest.fn()
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockIsV2.mockReturnValue(false)

    useModal.mockReturnValue({
      setModal: mockSetModal,
      closeModal: mockCloseModal
    })

    useRouter.mockReturnValue({
      data: {},
      navigate: mockNavigate,
      currentPage: 'somePage'
    })

    useToast.mockReturnValue({ setToast: mockSetToast })
  })

  test('returns correct actions when no excludeTypes provided', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    expect(result.current.actions).toHaveLength(6)
    expect(result.current.actions[0].type).toBe('select')
    expect(result.current.actions[1].type).toBe('favorite')
    expect(result.current.actions[2].type).toBe('edit')
    expect(result.current.actions[3].type).toBe('move')
    expect(result.current.actions[4].type).toBe('delete')
    expect(result.current.actions[5].type).toBe('autofill')
  })

  test('filters actions based on excludeTypes', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        excludeTypes: ['delete', 'move'],
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    expect(result.current.actions).toHaveLength(4)
    expect(result.current.actions[0].type).toBe('select')
    expect(result.current.actions[1].type).toBe('favorite')
    expect(result.current.actions[2].type).toBe('edit')
    expect(result.current.actions[3].type).toBe('autofill')
  })

  test('handles select action', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[0].click()
    expect(mockOnSelect).toHaveBeenCalledWith(mockRecord)
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles favorite toggle action', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[1].click()
    expect(mockUpdateFavoriteState).toHaveBeenCalledWith([mockRecord.id], true)
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles edit action', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[2].click()
    expect(mockHandleCreateOrEditRecord).toHaveBeenCalledWith({
      recordType: mockRecord.type,
      initialRecord: mockRecord,
      source: undefined
    })
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles delete action', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[4].click()
    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const [element] = mockSetModal.mock.calls[0]
    expect(element.type).toBe('ConfirmationModalContent')
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('delete action opens the V2 modal when isV2() is true', () => {
    mockIsV2.mockReturnValue(true)

    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[4].click()

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const [element] = mockSetModal.mock.calls[0]
    expect(element.type).toBe('DeleteRecordsModalContentV2')
    expect(element.props.records).toEqual([mockRecord])
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('handles delete confirmation', () => {
    useRouter.mockReturnValue({
      data: { recordId: '123' },
      navigate: mockNavigate,
      currentPage: 'somePage'
    })

    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[4].click()

    expect(mockSetModal).toHaveBeenCalled()
  })

  test('move action opens the V1 modal without modal params when isV2() is false', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[3].click()

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const [element, params] = mockSetModal.mock.calls[0]
    expect(element.type).toBe('MoveFolderModalContent')
    expect(params).toBeUndefined()
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('move action opens the V2 modal when isV2() is true (no params passed — ModalContext handles overlay default)', () => {
    mockIsV2.mockReturnValue(true)

    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[3].click()

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const [element, params] = mockSetModal.mock.calls[0]
    expect(element.type).toBe('MoveFolderModalContentV2')
    expect(params).toBeUndefined()
    expect(mockOnClose).toHaveBeenCalled()
  })

  describe('OTP strip logic (authenticator context)', () => {
    const otpLoginRecord = {
      id: '456',
      type: 'login',
      isFavorite: false,
      otpPublic: { currentCode: '123456', timeRemaining: 20 },
      data: {
        title: 'My Account',
        username: 'user@test.com',
        otpInput: 'secretseed',
        otp: 'otpvalue'
      }
    }

    beforeEach(() => {
      mockIsV2.mockReturnValue(true)
    })

    test('delete on authenticator page with OTP login opens strip-OTP modal with custom props', () => {
      useRouter.mockReturnValue({
        params: {},
        navigate: mockNavigate,
        currentPage: 'authenticator'
      })

      const { result } = renderHook(() =>
        useRecordActionItems({
          record: otpLoginRecord,
          onClose: mockOnClose
        })
      )

      result.current.actions[4].click()

      expect(mockSetModal).toHaveBeenCalledTimes(1)
      const [element] = mockSetModal.mock.calls[0]
      expect(element.type).toBe('DeleteRecordsModalContentV2')
      expect(element.props.records).toEqual([otpLoginRecord])
      expect(element.props.title).toBeDefined()
      expect(element.props.confirmText).toBeDefined()
      expect(element.props.submitLabel).toBeDefined()
      expect(element.props.onConfirm).toBeDefined()
      expect(mockOnClose).toHaveBeenCalled()
    })

    test('delete from record details with source=authenticator opens strip-OTP modal', () => {
      useRouter.mockReturnValue({
        params: { source: 'authenticator' },
        navigate: mockNavigate,
        currentPage: 'recordDetails'
      })

      const { result } = renderHook(() =>
        useRecordActionItems({
          record: otpLoginRecord,
          onClose: mockOnClose
        })
      )

      result.current.actions[4].click()

      const [element] = mockSetModal.mock.calls[0]
      expect(element.type).toBe('DeleteRecordsModalContentV2')
      expect(element.props.onConfirm).toBeDefined()
    })

    test('delete on non-authenticator page with OTP login uses normal delete (no onConfirm)', () => {
      useRouter.mockReturnValue({
        params: {},
        navigate: mockNavigate,
        currentPage: 'vault'
      })

      const { result } = renderHook(() =>
        useRecordActionItems({
          record: otpLoginRecord,
          onClose: mockOnClose
        })
      )

      result.current.actions[4].click()

      const [element] = mockSetModal.mock.calls[0]
      expect(element.type).toBe('DeleteRecordsModalContentV2')
      expect(element.props.onConfirm).toBeUndefined()
      expect(element.props.title).toBeUndefined()
    })

    test('delete on authenticator page with login record without OTP uses normal delete', () => {
      useRouter.mockReturnValue({
        params: {},
        navigate: mockNavigate,
        currentPage: 'authenticator'
      })

      const { result } = renderHook(() =>
        useRecordActionItems({
          record: mockRecord, // no otpPublic
          onClose: mockOnClose
        })
      )

      result.current.actions[4].click()

      const [element] = mockSetModal.mock.calls[0]
      expect(element.type).toBe('DeleteRecordsModalContentV2')
      expect(element.props.onConfirm).toBeUndefined()
    })

    test('onConfirm strips otpInput, otp, otpPublic and calls updateRecords', async () => {
      useRouter.mockReturnValue({
        params: {},
        navigate: mockNavigate,
        currentPage: 'authenticator'
      })
      mockUpdateRecords.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useRecordActionItems({
          record: otpLoginRecord,
          onClose: mockOnClose
        })
      )

      result.current.actions[4].click()
      const [element] = mockSetModal.mock.calls[0]
      await element.props.onConfirm()

      expect(mockUpdateRecords).toHaveBeenCalledTimes(1)
      const [updatedRecords] = mockUpdateRecords.mock.calls[0]
      const updated = updatedRecords[0]
      expect(updated.id).toBe('456')
      expect(updated.otpPublic).toBeUndefined()
      expect(updated.data.otpInput).toBeUndefined()
      expect(updated.data.otp).toBeUndefined()
      expect(updated.data.username).toBe('user@test.com')
      expect(updated.data.title).toBe('My Account')
    })

    test('onConfirm calls setToast and resolves when updateRecords fails', async () => {
      useRouter.mockReturnValue({
        params: {},
        navigate: mockNavigate,
        currentPage: 'authenticator'
      })
      const error = new Error('network error')
      mockUpdateRecords.mockRejectedValueOnce(error)

      const { result } = renderHook(() =>
        useRecordActionItems({
          record: otpLoginRecord,
          onClose: mockOnClose
        })
      )

      result.current.actions[4].click()
      const [element] = mockSetModal.mock.calls[0]
      await expect(element.props.onConfirm()).resolves.toBeUndefined()
      expect(mockSetToast).toHaveBeenCalledWith({ message: 'network error' })
    })
  })
})
