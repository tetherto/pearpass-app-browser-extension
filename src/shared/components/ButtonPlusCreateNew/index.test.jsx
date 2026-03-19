import React from 'react'

import { render, fireEvent } from '@testing-library/react'

import { ButtonPlusCreateNew } from './index'

import '@testing-library/jest-dom'

jest.mock('@tetherto/pearpass-lib-ui-theme-provider', () => ({
  colors: {
    gray: { mode1: '#cccccc' },
    black: { mode1: '#000000' }
  }
}))

describe('ButtonPlusCreateNew Component', () => {
  it('renders correctly when closed', () => {
    const { container } = render(
      <ButtonPlusCreateNew isOpen={false} onClick={() => {}} />
    )
    expect(container).toMatchSnapshot()
  })

  it('renders correctly when open', () => {
    const { container } = render(
      <ButtonPlusCreateNew isOpen={true} onClick={() => {}} />
    )
    expect(container).toMatchSnapshot()
  })

  it('renders correctly when disabled', () => {
    const { container } = render(
      <ButtonPlusCreateNew isOpen={false} disabled onClick={() => {}} />
    )
    expect(container).toMatchSnapshot()
  })

  it('calls onClick when clicked and not disabled', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <ButtonPlusCreateNew isOpen={false} onClick={handleClick} />
    )

    fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when clicked and disabled', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <ButtonPlusCreateNew isOpen={false} disabled onClick={handleClick} />
    )

    fireEvent.click(getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders the correct icon when closed', () => {
    const { getByRole } = render(
      <ButtonPlusCreateNew isOpen={false} onClick={() => {}} />
    )
    expect(getByRole('button').querySelector('svg')).toBeTruthy()
  })

  it('renders the correct icon when open', () => {
    const { getByRole } = render(
      <ButtonPlusCreateNew isOpen={true} onClick={() => {}} />
    )
    expect(getByRole('button').querySelector('svg')).toBeTruthy()
  })
})
