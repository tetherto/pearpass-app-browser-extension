import React from 'react'

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { Loading } from './index'

jest.mock('@lingui/react', () => ({
  Trans: ({
    children,
    message,
    id
  }: {
    children?: React.ReactNode
    message?: string
    id?: string
  }) => <>{children ?? message ?? id}</>
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const R = require('react')
  return {
    useTheme: () => ({
      theme: {
        colors: {
          colorTextPrimary: '#111111',
          colorTextSecondary: '#666666'
        }
      }
    }),
    PageHeader: (props: { title: string; as?: string }) =>
      R.createElement(
        'div',
        { 'data-testid': 'loading-page-header', 'data-as': props.as ?? '' },
        R.createElement('h1', null, props.title)
      ),
    Text: (props: { children?: React.ReactNode }) =>
      R.createElement(
        'p',
        { 'data-testid': 'loading-description' },
        props.children
      )
  }
})

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => {
  const R = require('react')
  return {
    HourglassBottom: (props: {
      color?: string
      width?: number
      height?: number
    }) =>
      R.createElement('svg', {
        'data-testid': 'hourglass-bottom',
        'data-color': props.color ?? '',
        height: props.height,
        width: props.width
      })
  }
})

describe('Loading', () => {
  it('exposes loading UI as a status region', () => {
    render(<Loading />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders HourglassBottom from the UI kit with theme primary color and size', () => {
    render(<Loading />)

    const icon = screen.getByTestId('hourglass-bottom')
    expect(icon).toHaveAttribute('data-color', '#111111')
    expect(icon).toHaveAttribute('width', '24')
    expect(icon).toHaveAttribute('height', '24')
  })

  it('renders the loading title as a top-level heading', () => {
    render(<Loading />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Just a moment...' })
    ).toBeInTheDocument()
  })

  it('renders the vault connection description', () => {
    render(<Loading />)

    expect(
      screen.getByText(
        'Connecting to your local vault to sync your latest credentials.'
      )
    ).toBeInTheDocument()
    expect(screen.getByTestId('loading-description')).toBeInTheDocument()
  })
})
