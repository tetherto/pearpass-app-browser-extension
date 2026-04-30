import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { SyncingFailedModal } from './SyncingFailedModal'

jest.mock('@lingui/core/macro', () => ({ t: (str: string) => str }))
jest.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        colorTextSecondary: '#bdc3ac',
        colorTextTertiary: '#67707e'
      }
    }
  }),
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({
    children,
    'data-testid': dataTestId
  }: {
    children: React.ReactNode
    'data-testid'?: string
  }) => <p data-testid={dataTestId}>{children}</p>,
  Button: ({
    children,
    onClick,
    disabled,
    isLoading,
    'data-testid': dataTestId
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    isLoading?: boolean
    'data-testid'?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      data-loading={isLoading ? 'true' : undefined}
    >
      {children}
    </button>
  )
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Sync: () => <span data-testid="icon-sync" />
}))

describe('SyncingFailedModal', () => {
  it('renders title and default body copy', () => {
    render(<SyncingFailedModal onRetry={jest.fn()} />)
    expect(screen.getByText('Syncing Failed')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Ensure the PearPass desktop app is open and Browser Sync is enabled\./
      )
    ).toBeInTheDocument()
  })

  it('does not render cancel button when onCancel is omitted', () => {
    render(<SyncingFailedModal onRetry={jest.fn()} />)
    expect(
      screen.queryByTestId('syncing-failed-modal-cancel')
    ).not.toBeInTheDocument()
  })

  it('renders cancel button when onCancel is provided and invokes it on click', () => {
    const onCancel = jest.fn()
    render(<SyncingFailedModal onRetry={jest.fn()} onCancel={onCancel} />)
    const cancelButton = screen.getByTestId('syncing-failed-modal-cancel')
    fireEvent.click(cancelButton)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders the upstream errorMessage when provided', () => {
    render(
      <SyncingFailedModal
        onRetry={jest.fn()}
        errorMessage="Pair code expired"
      />
    )
    expect(
      screen.getByTestId('syncing-failed-modal-error-detail')
    ).toHaveTextContent('Pair code expired')
  })

  it('omits the error detail node when errorMessage is undefined', () => {
    render(<SyncingFailedModal onRetry={jest.fn()} />)
    expect(
      screen.queryByTestId('syncing-failed-modal-error-detail')
    ).not.toBeInTheDocument()
  })

  it('invokes onRetry when the retry button is clicked', async () => {
    const onRetry = jest.fn().mockResolvedValue(undefined)
    render(<SyncingFailedModal onRetry={onRetry} />)
    await act(async () => {
      fireEvent.click(screen.getByTestId('syncing-failed-modal-retry'))
    })
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('matches snapshot with all props supplied', () => {
    const { container } = render(
      <SyncingFailedModal
        onRetry={jest.fn()}
        onCancel={jest.fn()}
        errorMessage="Pair code already used"
      />
    )
    expect(container).toMatchSnapshot()
  })
})
