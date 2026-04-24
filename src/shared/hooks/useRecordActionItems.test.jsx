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
  MoveFolderModalContentV2: 'MoveFolderModalContentV2',
  MOVE_FOLDER_MODAL_V2_PARAMS: { hasOverlay: false }
}))

jest.mock('../containers/ConfirmationModalContent', () => ({
  __esModule: true,
  ConfirmationModalContent: 'ConfirmationModalContent'
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
  })

  test('returns correct actions when no excludeTypes provided', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    expect(result.current.actions).toHaveLength(5)
    expect(result.current.actions[0].type).toBe('select')
    expect(result.current.actions[1].type).toBe('favorite')
    expect(result.current.actions[2].type).toBe('move')
    expect(result.current.actions[3].type).toBe('delete')
    expect(result.current.actions[4].type).toBe('autofill')
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

    expect(result.current.actions).toHaveLength(3)
    expect(result.current.actions[0].type).toBe('select')
    expect(result.current.actions[1].type).toBe('favorite')
    expect(result.current.actions[2].type).toBe('autofill')
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

  test('handles delete action', () => {
    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[3].click()
    expect(mockSetModal).toHaveBeenCalled()
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

    result.current.actions[3].click()

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

    result.current.actions[2].click()

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const [element, params] = mockSetModal.mock.calls[0]
    expect(element.type).toBe('MoveFolderModalContent')
    expect(params).toBeUndefined()
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('move action opens the V2 modal with hasOverlay:false when isV2() is true', () => {
    mockIsV2.mockReturnValue(true)

    const { result } = renderHook(() =>
      useRecordActionItems({
        record: mockRecord,
        onSelect: mockOnSelect,
        onClose: mockOnClose
      })
    )

    result.current.actions[2].click()

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const [element, params] = mockSetModal.mock.calls[0]
    expect(element.type).toBe('MoveFolderModalContentV2')
    expect(params).toEqual({ hasOverlay: false })
    expect(mockOnClose).toHaveBeenCalled()
  })
})
