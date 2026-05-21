import React from 'react'

import { render } from '@testing-library/react'

import { LoadingOverlay } from './index'
import '@testing-library/jest-dom'

describe('LoadingOverlay', () => {
  test('renders correctly', () => {
    const { container } = render(
      <LoadingOverlay data-testid="loading-overlay" />
    )

    expect(container).toMatchSnapshot()
  })

  test('passes props correctly', () => {
    const { getByTestId } = render(
      <LoadingOverlay className="test-class" data-testid="loading-overlay" />
    )

    const overlay = getByTestId('loading-overlay')
    expect(overlay).toHaveClass('test-class')
  })
})
