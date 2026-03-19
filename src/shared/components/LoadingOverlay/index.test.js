import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from '@tetherto/pearpass-lib-ui-theme-provider'

import { LoadingOverlay } from './index'
import '@testing-library/jest-dom'

describe('LoadingOverlay', () => {
  test('renders correctly', () => {
    const { container } = render(
      <ThemeProvider>
        <LoadingOverlay data-testid="loading-overlay" />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })

  test('passes props correctly', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <LoadingOverlay className="test-class" data-testid="loading-overlay" />
      </ThemeProvider>
    )

    const overlay = getByTestId('loading-overlay')
    expect(overlay).toHaveClass('test-class')
  })
})
