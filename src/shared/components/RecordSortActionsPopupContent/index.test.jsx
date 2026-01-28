import React from 'react'

import { render, fireEvent } from '@testing-library/react'

import { RecordSortActionsPopupContent } from './index'
import { Menu } from '../Menu'
import '@testing-library/jest-dom'

jest.mock('../../../shared/icons/CheckIcon', () => ({
  CheckIcon: jest.fn(() => <div data-testid="check-icon" />)
}))

// Mock createPortal to render inline for testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node
}))

// Mock requestAnimationFrame
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

describe('RecordSortActionsPopupContent', () => {
  const mockOnClick = jest.fn()
  const mockOnClose = jest.fn()
  const menuItems = [
    {
      name: 'Recent',
      type: 'recent',
      icon: jest.fn(() => <div data-testid="icon-recent" />)
    },
    {
      name: 'New to Old',
      type: 'newToOld',
      icon: jest.fn(() => <div data-testid="icon-newToOld" />)
    },
    {
      name: 'Old to New',
      type: 'oldToNew',
      icon: jest.fn(() => <div data-testid="icon-oldToNew" />)
    }
  ]

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly and matches snapshot', () => {
    const { container } = render(
      <MenuWrapper>
        <RecordSortActionsPopupContent
          menuItems={menuItems}
          onClick={mockOnClick}
          onClose={mockOnClose}
          selectedType="recent"
        />
      </MenuWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  it('renders menu items with correct icons and names', () => {
    const { getByText, getByTestId } = render(
      <MenuWrapper>
        <RecordSortActionsPopupContent
          menuItems={menuItems}
          onClick={mockOnClick}
          onClose={mockOnClose}
          selectedType="recent"
        />
      </MenuWrapper>
    )

    menuItems.forEach((item) => {
      expect(getByText(item.name)).toBeInTheDocument()
      expect(getByTestId(`icon-${item.type}`)).toBeInTheDocument()
    })
  })

  it('calls onClick and onClose when a menu item is clicked', () => {
    const { getByText } = render(
      <MenuWrapper>
        <RecordSortActionsPopupContent
          menuItems={menuItems}
          onClick={mockOnClick}
          onClose={mockOnClose}
          selectedType="recent"
        />
      </MenuWrapper>
    )

    fireEvent.click(getByText('New to Old'))
    expect(mockOnClick).toHaveBeenCalledWith('newToOld')
  })

  it('displays the CheckIcon for the selected menu item', () => {
    const { getByTestId } = render(
      <MenuWrapper>
        <RecordSortActionsPopupContent
          menuItems={menuItems}
          onClick={mockOnClick}
          onClose={mockOnClose}
          selectedType="recent"
        />
      </MenuWrapper>
    )

    expect(getByTestId('check-icon')).toBeInTheDocument()
  })
})
