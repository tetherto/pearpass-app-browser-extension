import React from 'react'

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { LoadingV2 } from './index'

jest.mock('@lingui/core/macro', () => ({
  t: Object.assign(
    (strings: TemplateStringsArray | string) => {
      if (Array.isArray(strings)) return strings.join('')
      return strings
    },
    { __macro: true }
  )
}))

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

describe('LoadingV2', () => {
  it('renders a status landmark with full-size layout classes', () => {
    const { container } = render(<LoadingV2 />)

    const root = container.firstChild as HTMLElement
    expect(root).toHaveAttribute('role', 'status')
    expect(root).toHaveClass(
      'h-full',
      'w-full',
      'flex-col',
      'items-center',
      'justify-center'
    )
  })

  it('renders HourglassBottom from the UI kit with theme primary color and size', () => {
    render(<LoadingV2 />)

    const icon = screen.getByTestId('hourglass-bottom')
    expect(icon).toHaveAttribute('data-color', '#111111')
    expect(icon).toHaveAttribute('width', '24')
    expect(icon).toHaveAttribute('height', '24')
  })

  it('renders PageHeader as h1 with the loading title', () => {
    render(<LoadingV2 />)

    const header = screen.getByTestId('loading-page-header')
    expect(header).toHaveAttribute('data-as', 'h1')
    expect(screen.getByText('Just a moment...')).toBeInTheDocument()
  })

  it('renders the vault connection description', () => {
    render(<LoadingV2 />)

    expect(
      screen.getByText(
        'Connecting to your local vault to sync your latest credentials.'
      )
    ).toBeInTheDocument()
    expect(screen.getByTestId('loading-description')).toBeInTheDocument()
  })
})
