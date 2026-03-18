import React from 'react'

import { render } from '@testing-library/react'

import { Vault } from './index'
import '@testing-library/jest-dom'

jest.mock('@tetherto/pear-apps-utils-date', () => ({
  formatDate: jest.fn(() => '06/05/2025')
}))

describe('Vault Component', () => {
  const mockVault = { name: 'Test Vault', createdAt: '2025-05-06' }
  const mockOnClick = jest.fn()
  const mockOnShareClick = jest.fn()
  const mockOnEditClick = jest.fn()
  const mockOnDeleteClick = jest.fn()

  it('renders correctly with all props', () => {
    const { container } = render(
      <Vault
        vault={mockVault}
        onClick={mockOnClick}
        onShareClick={mockOnShareClick}
        onEditClick={mockOnEditClick}
        onDeleteClick={mockOnDeleteClick}
      />
    )

    expect(container).toMatchSnapshot()
  })

  it('renders correctly without optional props', () => {
    const { container } = render(
      <Vault vault={mockVault} onClick={mockOnClick} />
    )

    expect(container).toMatchSnapshot()
  })
})
