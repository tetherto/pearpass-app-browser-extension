import React from 'react'

import { render, fireEvent } from '@testing-library/react'

import { CreateNewCategoryPopupContent } from './index'
import { Menu } from '../Menu'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node
}))

beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb()
    return 1
  })
})

afterEach(() => {
  window.requestAnimationFrame.mockRestore()
})

const MenuWrapper = ({ children }) => <Menu open={true}>{children}</Menu>

describe('CreateNewCategoryPopupContent', () => {
  const mockOnClick = jest.fn()
  const mockMenuItems = [
    { type: 'type1', name: 'Item 1' },
    { type: 'type2', name: 'Item 2' }
  ]

  it('renders correctly and matches snapshot', () => {
    const { asFragment } = render(
      <MenuWrapper>
        <CreateNewCategoryPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
        />
      </MenuWrapper>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('calls onClick when a menu item is clicked', () => {
    const { getByText } = render(
      <MenuWrapper>
        <CreateNewCategoryPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
        />
      </MenuWrapper>
    )

    const menuItem = getByText('Item 1')
    fireEvent.click(menuItem)

    expect(mockOnClick).toHaveBeenCalledWith(mockMenuItems[0])
  })

  it('renders the correct number of menu items', () => {
    const { getAllByText } = render(
      <MenuWrapper>
        <CreateNewCategoryPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
        />
      </MenuWrapper>
    )

    const menuItems = getAllByText(/Item/)
    expect(menuItems).toHaveLength(mockMenuItems.length)
  })
})
