import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'
import { colors } from 'pearpass-lib-ui-theme-provider'

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

    const { container } = render(
      <ThemeProvider>
        <Toasts toasts={toasts} />
      </ThemeProvider>
    )

    expect(mockIcon).toHaveBeenCalledWith(
      { color: colors.black.mode1 },
      undefined
    )
    expect(container).toMatchSnapshot()
  })

  test('renders correctly without toasts', () => {
    const { container } = render(
      <ThemeProvider>
        <Toasts toasts={[]} />
      </ThemeProvider>
    )

    expect(container.firstChild).toBeNull()
  })

  test('renders multiple toasts with icons', () => {
    const toasts = [
      { message: 'Toast 1', icon: mockIcon },
      { message: 'Toast 2', icon: mockIcon }
    ]

    const { getAllByTestId } = render(
      <ThemeProvider>
        <Toasts toasts={toasts} />
      </ThemeProvider>
    )

    expect(mockIcon).toHaveBeenCalledTimes(2)
    expect(getAllByTestId('mock-icon')).toHaveLength(2)
  })

  test('renders toasts without icons', () => {
    const toasts = [
      { message: 'Toast 1', icon: null },
      { message: 'Toast 2', icon: null }
    ]

    const { queryAllByTestId } = render(
      <ThemeProvider>
        <Toasts toasts={toasts} />
      </ThemeProvider>
    )

    expect(queryAllByTestId('mock-icon')).toHaveLength(0)
  })

  test('renders toasts with mixed icons and no icons', () => {
    const toasts = [
      { message: 'Toast with icon', icon: mockIcon },
      { message: 'Toast without icon', icon: null }
    ]

    const { getByText, queryByTestId } = render(
      <ThemeProvider>
        <Toasts toasts={toasts} />
      </ThemeProvider>
    )

    expect(mockIcon).toHaveBeenCalledTimes(1)
    expect(queryByTestId('mock-icon')).toBeInTheDocument()
    expect(getByText('Toast without icon')).toBeInTheDocument()
  })
})
