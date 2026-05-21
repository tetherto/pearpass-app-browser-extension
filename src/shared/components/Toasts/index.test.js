import React from 'react'

import { render } from '@testing-library/react'

import { Toasts } from './index'
import '@testing-library/jest-dom'

describe('Toasts Component', () => {
  const mockIcon = jest.fn(() => <div data-testid="mock-icon">Icon</div>)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with toasts', () => {
    const toasts = [
      { message: 'Success message', icon: mockIcon },
      { message: 'Error message', icon: null }
    ]

    const { container } = render(<Toasts toasts={toasts} />)

    expect(mockIcon).toHaveBeenCalledWith({ color: '#08090C' }, undefined)
    expect(container).toMatchSnapshot()
  })

  test('renders correctly without toasts', () => {
    const { container } = render(<Toasts toasts={[]} />)

    expect(container.firstChild).toBeNull()
  })

  test('renders multiple toasts with icons', () => {
    const toasts = [
      { message: 'Toast 1', icon: mockIcon },
      { message: 'Toast 2', icon: mockIcon }
    ]

    const { getAllByTestId } = render(<Toasts toasts={toasts} />)

    expect(mockIcon).toHaveBeenCalledTimes(2)
    expect(getAllByTestId('mock-icon')).toHaveLength(2)
  })

  test('renders toasts without icons', () => {
    const toasts = [
      { message: 'Toast 1', icon: null },
      { message: 'Toast 2', icon: null }
    ]

    const { queryAllByTestId } = render(<Toasts toasts={toasts} />)

    expect(queryAllByTestId('mock-icon')).toHaveLength(0)
  })

  test('renders toasts with mixed icons and no icons', () => {
    const toasts = [
      { message: 'Toast with icon', icon: mockIcon },
      { message: 'Toast without icon', icon: null }
    ]

    const { getByText, queryByTestId } = render(<Toasts toasts={toasts} />)

    expect(mockIcon).toHaveBeenCalledTimes(1)
    expect(queryByTestId('mock-icon')).toBeInTheDocument()
    expect(getByText('Toast without icon')).toBeInTheDocument()
  })
})
