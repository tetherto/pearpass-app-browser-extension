import { renderHook } from '@testing-library/react'
import { useRecords } from '@tetherto/pearpass-lib-vault'

import { useFilteredRecords } from './useFilteredRecords'
import { useRouter } from '../../shared/context/RouterContext'

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useRecords: jest.fn()
}))

jest.mock('../../shared/context/RouterContext', () => ({
  useRouter: jest.fn()
}))

describe('useFilteredRecords', () => {
  it('should return filtered records based on router state', () => {
    const mockRouterState = {
      recordType: 'login',
      url: 'https://example.com'
    }

    const mockRecordsData = [
      {
        data: {
          websites: ['https://example.com', 'https://another.com']
        }
      },
      {
        data: {
          websites: ['https://notexample.com']
        }
      }
    ]

    useRouter.mockReturnValue({ state: mockRouterState })
    useRecords.mockReturnValue({
      data: mockRecordsData,
      isInitialized: true,
      isLoading: false
    })

    const { result } = renderHook(() => useFilteredRecords())

    expect(result.current.filteredRecords).toEqual([mockRecordsData[0]])
    expect(result.current.isInitialized).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('should return all records if no URL is provided in router state', () => {
    const mockRouterState = {
      recordType: 'login',
      url: null
    }

    const mockRecordsData = [
      {
        data: {
          websites: ['https://example.com', 'https://another.com']
        }
      },
      {
        data: {
          websites: ['https://notexample.com']
        }
      }
    ]

    useRouter.mockReturnValue({ state: mockRouterState })
    useRecords.mockReturnValue({
      data: mockRecordsData,
      isInitialized: true,
      isLoading: false
    })

    const { result } = renderHook(() => useFilteredRecords())

    expect(result.current.filteredRecords).toEqual(mockRecordsData)
    expect(result.current.isInitialized).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle loading state correctly', () => {
    useRouter.mockReturnValue({ state: { recordType: 'login', url: null } })
    useRecords.mockReturnValue({
      data: null,
      isInitialized: false,
      isLoading: true
    })

    const { result } = renderHook(() => useFilteredRecords())

    expect(result.current.filteredRecords).toBe(null)
    expect(result.current.isInitialized).toBe(false)
    expect(result.current.isLoading).toBe(true)
  })
})
