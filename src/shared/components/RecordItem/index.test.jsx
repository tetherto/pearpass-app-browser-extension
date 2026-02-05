import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import { RecordItem } from './index'
import { RecordAvatar } from '../../../shared/components/RecordAvatar'
import '@testing-library/jest-dom'

jest.mock('../../../shared/components/RecordAvatar', () => ({
  RecordAvatar: jest.fn(() => <div data-testid="record-avatar" />)
}))

jest.mock('pear-apps-utils-avatar-initials', () => ({
  generateAvatarInitials: jest.fn(() => 'TI')
}))

jest.mock('../../../shared/constants/recordColorByType', () => ({
  RECORD_COLOR_BY_TYPE: {
    note: 'blue',
    creditCard: 'green',
    custom: 'red',
    identity: 'yellow',
    login: 'purple'
  }
}))

describe('RecordItem', () => {
  const defaultProps = {
    websiteDomain: 'google.com',
    title: 'Test Item',
    isFavorite: true,
    type: 'note',
    folder: 'Test Folder',
    isSelected: false,
    onClick: jest.fn()
  }

  it('renders correctly with given props', () => {
    const { asFragment } = render(<RecordItem {...defaultProps} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders RecordAvatar with correct props', () => {
    render(<RecordItem {...defaultProps} />)

    expect(RecordAvatar).toHaveBeenCalledWith(
      {
        initials: 'TI',
        isSelected: false,
        isFavorite: true,
        color: 'blue',
        websiteDomain: 'google.com'
      },
      undefined
    )
  })

  it('displays the title and folder', () => {
    render(<RecordItem {...defaultProps} />)

    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.getByText('Test Folder')).toBeInTheDocument()
  })

  it('calls onClick when the item is clicked', () => {
    render(<RecordItem {...defaultProps} />)

    fireEvent.click(screen.getByText('Test Item'))
    expect(defaultProps.onClick).toHaveBeenCalled()
  })

  it('renders correctly when isSelected is true', () => {
    const { asFragment } = render(
      <RecordItem {...defaultProps} isSelected={true} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly with different record types', () => {
    const types = ['note', 'creditCard', 'custom', 'identity', 'login']

    types.forEach((type) => {
      const { asFragment } = render(
        <RecordItem {...defaultProps} type={type} />
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
