import React from 'react'

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  rawTokens: { radius8: 8 },
  useTheme: () => ({
    theme: { colors: { colorBorderTertiary: '#cccccc' } }
  })
}))

jest.mock('../containers/AppHeaderContainer', () => ({
  AppHeaderContainer: () => <div data-testid="app-header-container" />
}))

jest.mock('../../shared/context/RouterContext', () => ({
  useRouter: jest.fn(() => ({ currentPage: 'vault' }))
}))

jest.mock('../../shared/hooks/useVaultAccessRevoked', () => ({
  useVaultAccessRevoked: jest.fn()
}))

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  AUTHENTICATOR_ENABLED: false
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

jest.mock('./Loading', () => ({
  Loading: () => <div data-testid="loading" />
}))

jest.mock('../../shared/containers/LayoutWithSidebar', () => ({
  LayoutWithSidebar: ({ children }) => (
    <div data-testid="layout-with-sidebar">{children}</div>
  )
}))

const { App } = require('./App')
const { useRedirect } = require('./hooks/useRedirect')
const {
  useBlockingStateContext
} = require('../../shared/context/BlockingStateContext')

describe('App', () => {
  beforeEach(() => {
    useBlockingStateContext.mockReturnValue({
      isChecking: false,
      blockingState: null
    })
    useRedirect.mockReturnValue({
      isLoading: true
    })
  })

  it('renders Loading while loading', () => {
    render(<App />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.queryByTestId('fade-in-wrapper')).not.toBeInTheDocument()
    expect(screen.queryByTestId('welcome-page-wrapper')).not.toBeInTheDocument()
    expect(screen.queryByTestId('routes')).not.toBeInTheDocument()
  })
})
