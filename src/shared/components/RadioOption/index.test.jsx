import React from 'react'
import '@testing-library/jest-dom'

import { fireEvent, render, screen } from '@testing-library/react'

import { RadioOption } from './index'

describe('RadioOption', () => {
  const defaultProps = {
    label: 'Test Option',
    value: 'test-value',
    name: 'test-group',
    isSelected: false,
    onChange: jest.fn()
  }

  it('renders correctly', () => {
    const { container } = render(<RadioOption {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('displays label and description', () => {
    render(<RadioOption {...defaultProps} description="Test Description" />)
    expect(screen.getByText('Test Option')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('calls onChange with correct value when clicked', () => {
    const handleChange = jest.fn()
    render(<RadioOption {...defaultProps} onChange={handleChange} />)

    fireEvent.click(screen.getByLabelText('Test Option'))
    expect(handleChange).toHaveBeenCalledWith('test-value')
  })

  it('renders checked state correctly', () => {
    const { container } = render(
      <RadioOption {...defaultProps} isSelected={true} />
    )
    expect(container.firstChild).toMatchSnapshot()
    expect(screen.getByRole('radio')).toBeChecked()
  })
})
