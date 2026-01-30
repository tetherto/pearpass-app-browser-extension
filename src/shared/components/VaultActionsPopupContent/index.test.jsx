import React from 'react'

import { render, fireEvent } from '@testing-library/react'

import { Menu } from '../Menu'
import { VaultActionsPopupContent } from './index'
import '@testing-library/jest-dom'

jest.mock('../../../shared/icons/BrushIcon', () => ({
  BrushIcon: () => <div data-testid="brush-icon" />
}))
jest.mock('../../../shared/icons/DeleteIcon', () => ({
  DeleteIcon: () => <div data-testid="delete-icon" />
}))
jest.mock('../../../shared/icons/LockCircleIcon', () => ({
  LockCircleIcon: () => <div data-testid="lock-circle-icon" />
}))
jest.mock('../../../shared/icons/ShareIcon', () => ({
  ShareIcon: () => <div data-testid="share-icon" />
}))

describe('VaultActionsPopupContent', () => {
  const mockActions = [
    {
      name: 'Edit',
      icon: () => <div data-testid="edit-icon" />,
      onClick: jest.fn()
    },
    {
      name: 'Delete',
      icon: () => <div data-testid="delete-icon" />,
      onClick: jest.fn()
    }
  ]

  it('renders correctly and matches snapshot', () => {
    const { container } = render(
      <Menu open={true}>
        <VaultActionsPopupContent actions={mockActions} />
      </Menu>
    )
    expect(container).toMatchSnapshot()
  })

  it('renders all actions', () => {
    const { getByText, getByTestId } = render(
      <Menu open={true}>
        <VaultActionsPopupContent actions={mockActions} />
      </Menu>
    )

    mockActions.forEach((action) => {
      expect(getByText(action.name)).toBeInTheDocument()
      expect(
        getByTestId(`${action.name.toLowerCase()}-icon`)
      ).toBeInTheDocument()
    })
  })

  it('calls the correct action on click', () => {
    const { getByText } = render(
      <Menu open={true}>
        <VaultActionsPopupContent actions={mockActions} />
      </Menu>
    )

    mockActions.forEach((action) => {
      const actionElement = getByText(action.name)
      fireEvent.click(actionElement)
      expect(action.onClick).toHaveBeenCalled()
    })
  })
})
