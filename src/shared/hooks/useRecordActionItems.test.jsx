import { renderHook } from '@testing-library/react'

import { useRecordActionItems } from './useRecordActionItems'
import { useModal } from '../context/ModalContext'
import { useRouter } from '../context/RouterContext'

const mockDeleteRecord = jest.fn()
const mockUpdateFavoriteState = jest.fn()

jest.mock('../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('../context/RouterContext', () => ({
  useRouter: jest.fn()
}))

jest.mock('../containers/MoveFolderModalContent', () => ({
  __esModule: true,
  MoveFolderModalContent: 'MoveFolderModalContent'
}))

jest.mock('../containers/DeleteRecordsModalContent', () => ({
  __esModule: true,
  DeleteRecordsModalContent: 'DeleteRecordsModalContent'
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
    updateFavoriteState: mockUpdateFavoriteState
  }),
  RECORD_TYPES: {
    LOGIN: 'login'
  }
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

    useModal.mockReturnValue({
      setModal: mockSetModal,
      closeModal: mockCloseModal
    })

    useRouter.mockReturnValue({
      data: {},
      navigate: mockNavigate,
      currentPage: 'somePage'
    })
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
    expect(element.type).toBe('DeleteRecordsModalContent')
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

  test('move action opens MoveFolderModalContent', () => {
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

  describe('delete with OTP login record', () => {
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

    test('delete on authenticator page with OTP login opens standard delete modal', () => {
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
      expect(element.type).toBe('DeleteRecordsModalContent')
      expect(element.props.records).toEqual([otpLoginRecord])
      expect(element.props.onConfirm).toBeUndefined()
      expect(element.props.title).toBeUndefined()
      expect(mockOnClose).toHaveBeenCalled()
    })

    test('delete from record details with source=authenticator opens standard delete modal', () => {
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
      expect(element.type).toBe('DeleteRecordsModalContent')
      expect(element.props.onConfirm).toBeUndefined()
    })

    test('delete on non-authenticator page with OTP login opens standard delete modal', () => {
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
      expect(element.type).toBe('DeleteRecordsModalContent')
      expect(element.props.onConfirm).toBeUndefined()
      expect(element.props.title).toBeUndefined()
    })

    test('delete on authenticator page with login record without OTP opens standard delete modal', () => {
      useRouter.mockReturnValue({
        params: {},
        navigate: mockNavigate,
        currentPage: 'authenticator'
      })

      const { result } = renderHook(() =>
        useRecordActionItems({
          record: mockRecord,
          onClose: mockOnClose
        })
      )

      result.current.actions[4].click()

      const [element] = mockSetModal.mock.calls[0]
      expect(element.type).toBe('DeleteRecordsModalContent')
      expect(element.props.onConfirm).toBeUndefined()
    })
  })
})
