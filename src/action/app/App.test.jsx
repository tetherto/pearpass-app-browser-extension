import React from 'react'

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { App } from './App'

const mockIsV2 = jest.fn(() => false)

jest.mock('../../shared/utils/designVersion', () => ({
  isV2: () => mockIsV2()
}))

jest.mock('./hooks/useRedirect', () => ({
  useRedirect: jest.fn()
}))

jest.mock('./hooks/useWindowResize', () => ({
  useWindowResize: jest.fn(() => ({ height: 600, width: 400 }))
}))

jest.mock('../../shared/context/BlockingStateContext', () => ({
  useBlockingStateContext: jest.fn()
}))

jest.mock('../../shared/context/LoadingContext', () => ({
  useGlobalLoading: jest.fn()
}))

jest.mock('./Routes', () => ({
  Routes: () => <div data-testid="routes" />
}))

jest.mock('../../shared/components/FadeInWrapper', () => ({
  FadeInWrapper: ({ children }) => (
    <div data-testid="fade-in-wrapper">{children}</div>
  )
}))

jest.mock('../../shared/components/WelcomePageWrapper', () => ({
  WelcomePageWrapper: () => <div data-testid="welcome-page-wrapper" />
}))

jest.mock('../../shared/components/LoadingV2', () => ({
  LoadingV2: () => <div data-testid="loading-v2" />
}))

const { useRedirect } = require('./hooks/useRedirect')
const {
  useBlockingStateContext
} = require('../../shared/context/BlockingStateContext')

describe('App', () => {
  beforeEach(() => {
    mockIsV2.mockReturnValue(false)
    useBlockingStateContext.mockReturnValue({
      isChecking: false,
      blockingState: null
    })
    useRedirect.mockReturnValue({
      isLoading: true
    })
  })

  it('renders LoadingV2 while loading when isV2() is true', () => {
    mockIsV2.mockReturnValue(true)

    render(<App />)

    expect(screen.getByTestId('loading-v2')).toBeInTheDocument()
    expect(screen.queryByTestId('fade-in-wrapper')).not.toBeInTheDocument()
    expect(screen.queryByTestId('welcome-page-wrapper')).not.toBeInTheDocument()
    expect(screen.queryByTestId('routes')).not.toBeInTheDocument()
  })

  it('renders FadeInWrapper with WelcomePageWrapper while loading when isV2() is false', () => {
    mockIsV2.mockReturnValue(false)

    render(<App />)

    expect(screen.getByTestId('fade-in-wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('welcome-page-wrapper')).toBeInTheDocument()
    expect(screen.queryByTestId('loading-v2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('routes')).not.toBeInTheDocument()
  })
})
