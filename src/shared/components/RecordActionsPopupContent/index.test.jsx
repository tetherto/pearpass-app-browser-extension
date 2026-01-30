import React from 'react'

import { render, fireEvent } from '@testing-library/react'

import { Menu } from '../Menu'
import { RecordActionsPopupContent } from './index'
import '@testing-library/jest-dom'

jest.mock('../../../shared/constants/recordActions', () => ({
  RECORD_ACTION_ICON_BY_TYPE: {
    edit: jest.fn(() => <svg data-testid="icon-edit" />),
    delete: jest.fn(() => <svg data-testid="icon-delete" />)
  }
}))

describe('RecordActionsPopupContent', () => {
  const mockOnClick = jest.fn()
  const mockMenuItems = [
    { name: 'Edit', type: 'edit', click: jest.fn() },
    { name: 'Delete', type: 'delete' }
  ]

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with default variant', () => {
    const { container } = render(
      <Menu open={true}>
        <RecordActionsPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
        />
      </Menu>
    )
    expect(container).toMatchSnapshot()
  })

  it('renders correctly with compact variant', () => {
    const { container } = render(
      <Menu open={true}>
        <RecordActionsPopupContent
          menuItems={mockMenuItems}
          variant="compact"
          onClick={mockOnClick}
        />
      </Menu>
    )
    expect(container).toMatchSnapshot()
  })

  it('calls the item-specific click handler when an item is clicked', () => {
    const { getByText } = render(
      <Menu open={true}>
        <RecordActionsPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
        />
      </Menu>
    )

    const editItem = getByText('Edit')
    fireEvent.click(editItem)

    expect(mockMenuItems[0].click).toHaveBeenCalled()
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('calls the default onClick handler when no item-specific click handler is provided', () => {
    const { getByText } = render(
      <Menu open={true}>
        <RecordActionsPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
        />
      </Menu>
    )

    const deleteItem = getByText('Delete')
    fireEvent.click(deleteItem)

    expect(mockOnClick).toHaveBeenCalled()
  })

  it('renders icons correctly for each menu item', () => {
    const { getByTestId } = render(
      <Menu open={true}>
        <RecordActionsPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
        />
      </Menu>
    )

    expect(getByTestId('icon-edit')).toBeInTheDocument()
    expect(getByTestId('icon-delete')).toBeInTheDocument()
  })
})
