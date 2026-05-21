import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import { WelcomeCardHeader } from './index'
import '@testing-library/jest-dom'

jest.mock('../../../../../shared/components/ButtonRoundIcon', () => ({
  ButtonRoundIcon: jest.fn(({ onClick }) => (
    <button data-testid="back-button" onClick={onClick}>
      Mock Button
    </button>
  ))
}))

jest.mock('../../../../../shared/icons/BackIcon', () => ({
  BackIcon: () => <span data-testid="mock-icon">Mock Icon</span>
}))

describe('WelcomeCardHeader', () => {
  it('renders correctly with title and back button', () => {
    const mockOnBack = jest.fn()
    const { asFragment } = render(
      <WelcomeCardHeader title="Test Title" onBack={mockOnBack} />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly without back button', () => {
    const { asFragment } = render(<WelcomeCardHeader title="Test Title" />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })

  it('calls onBack when back button is clicked', () => {
    const mockOnBack = jest.fn()
    render(<WelcomeCardHeader title="Test Title" onBack={mockOnBack} />)

    const backButton = screen.getByTestId('back-button')
    fireEvent.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })
})
