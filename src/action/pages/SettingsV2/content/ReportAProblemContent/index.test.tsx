import React from 'react'

import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'

const mockSendSlackFeedback = jest.fn()
const mockSendGoogleFormFeedback = jest.fn()

jest.mock('@tetherto/pear-apps-lib-feedback', () => ({
  __esModule: true,
  sendSlackFeedback: (args: unknown) => mockSendSlackFeedback(args),
  sendGoogleFormFeedback: (args: unknown) => mockSendGoogleFormFeedback(args)
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  __esModule: true,
  PageHeader: ({
    title,
    subtitle
  }: {
    title: React.ReactNode
    subtitle?: React.ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  ),
  Form: ({
    children,
    onSubmit,
    testID,
    'aria-label': ariaLabel
  }: {
    children: React.ReactNode
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
    testID?: string
    'aria-label'?: string
  }) => (
    <form
      data-testid={testID}
      aria-label={ariaLabel}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(e)
      }}
    >
      {children}
    </form>
  ),
  TextArea: ({
    label,
    value,
    onChange,
    error,
    testID,
    disabled
  }: {
    label?: string
    value?: string
    onChange?: (v: string) => void
    error?: string
    testID?: string
    disabled?: boolean
  }) => (
    <label>
      <span>{label}</span>
      <textarea
        data-testid={testID}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {error ? <span data-testid={`${testID}-error`}>{error}</span> : null}
    </label>
  ),
  InputField: ({
    label,
    value,
    onChange,
    error,
    testID,
    disabled
  }: {
    label?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string
    testID?: string
    disabled?: boolean
  }) => (
    <label>
      <span>{label}</span>
      <input
        data-testid={testID}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
      {error ? <span data-testid={`${testID}-error`}>{error}</span> : null}
    </label>
  ),
  AlertMessage: ({
    title,
    description,
    testID
  }: {
    title?: React.ReactNode
    description?: React.ReactNode
    testID?: string
  }) => (
    <div data-testid={testID}>
      {title ? <strong>{title}</strong> : null}
      <span>{description}</span>
    </div>
  ),
  Button: ({
    children,
    onClick,
    type,
    disabled,
    isLoading,
    iconBefore: _iconBefore,
    variant: _variant,
    size: _size,
    ...rest
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean
    iconBefore?: React.ReactNode
    variant?: string
    size?: string
  }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...rest}
    >
      {children}
    </button>
  )
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  __esModule: true,
  Send: () => <span data-testid="icon-send" />
}))

jest.mock('../../../../../../public/manifest.json', () => ({
  __esModule: true,
  version: '1.2.3',
  default: { version: '1.2.3' }
}))

jest.mock('../../../../../shared/constants/feedback', () => ({
  __esModule: true,
  GOOGLE_FORM_KEY: 'test-form-key',
  GOOGLE_FORM_MAPPING: { message: 'entry.1' },
  SLACK_WEBHOOK_URL_PATH: '/test/slack/webhook'
}))

const mockSetToast = jest.fn()

jest.mock('../../../../../shared/context/ToastContext', () => ({
  __esModule: true,
  useToast: () => ({ setToast: mockSetToast })
}))

const mockLoggerError = jest.fn()

jest.mock('../../../../../shared/utils/logger', () => ({
  __esModule: true,
  logger: { error: (...args: unknown[]) => mockLoggerError(...args) }
}))

import { ReportAProblemContent } from './index'

const flushAsync = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('ReportAProblemContent', () => {
  beforeEach(() => {
    mockSendSlackFeedback.mockReset()
    mockSendGoogleFormFeedback.mockReset()
    mockSetToast.mockReset()
    mockLoggerError.mockReset()
    mockSendSlackFeedback.mockResolvedValue(undefined)
    mockSendGoogleFormFeedback.mockResolvedValue(undefined)
  })

  it('renders the page header and form', () => {
    render(<ReportAProblemContent />)

    expect(screen.getByTestId('settings-report-a-problem')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Report a problem' })
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('settings-report-a-problem-form')
    ).toHaveAttribute('aria-label', 'Report a problem')
    expect(screen.getByText('Describe the issue')).toBeInTheDocument()
  })

  it('renders AlertMessage with a non-empty title', () => {
    render(<ReportAProblemContent />)

    const alert = screen.getByTestId('settings-report-a-problem-alert')
    expect(alert).toBeInTheDocument()
    expect(alert.querySelector('strong')?.textContent).toBe('Privacy')
  })

  it('shows both messageError and emailError on empty submit', async () => {
    render(<ReportAProblemContent />)

    fireEvent.submit(screen.getByTestId('settings-report-a-problem-form'))
    await flushAsync()

    expect(
      screen.getByTestId('settings-report-a-problem-message-error')
    ).toHaveTextContent('Please describe the issue.')
    expect(
      screen.getByTestId('settings-report-a-problem-email-error')
    ).toHaveTextContent('Email is required.')
    expect(mockSendSlackFeedback).not.toHaveBeenCalled()
    expect(mockSendGoogleFormFeedback).not.toHaveBeenCalled()
  })

  it('shows emailError when email format is invalid', async () => {
    render(<ReportAProblemContent />)

    fireEvent.change(screen.getByTestId('settings-report-a-problem-message'), {
      target: { value: 'something is broken' }
    })
    fireEvent.change(screen.getByTestId('settings-report-a-problem-email'), {
      target: { value: 'not-an-email' }
    })
    fireEvent.submit(screen.getByTestId('settings-report-a-problem-form'))
    await flushAsync()

    expect(
      screen.getByTestId('settings-report-a-problem-email-error')
    ).toHaveTextContent('Enter a valid email address.')
    expect(
      screen.queryByTestId('settings-report-a-problem-message-error')
    ).not.toBeInTheDocument()
    expect(mockSendSlackFeedback).not.toHaveBeenCalled()
    expect(mockSendGoogleFormFeedback).not.toHaveBeenCalled()
  })

  it('calls both senders with composed payload and shows success toast', async () => {
    render(<ReportAProblemContent />)

    fireEvent.change(screen.getByTestId('settings-report-a-problem-message'), {
      target: { value: 'app crashes on open' }
    })
    fireEvent.change(screen.getByTestId('settings-report-a-problem-email'), {
      target: { value: 'user@example.com' }
    })
    fireEvent.submit(screen.getByTestId('settings-report-a-problem-form'))
    await flushAsync()

    expect(mockSendSlackFeedback).toHaveBeenCalledTimes(1)
    expect(mockSendGoogleFormFeedback).toHaveBeenCalledTimes(1)

    const slackArgs = mockSendSlackFeedback.mock.calls[0][0]
    expect(slackArgs.webhookUrPath).toBe('/test/slack/webhook')
    expect(slackArgs.message).toBe(
      'app crashes on open\n\nFollow-up email: user@example.com'
    )
    expect(slackArgs.topic).toBe('BUG_REPORT')
    expect(slackArgs.app).toBe('BROWSER_EXTENSION')
    expect(slackArgs.appVersion).toBe('1.2.3')

    const googleArgs = mockSendGoogleFormFeedback.mock.calls[0][0]
    expect(googleArgs.formKey).toBe('test-form-key')
    expect(googleArgs.mapping).toEqual({ message: 'entry.1' })
    expect(googleArgs.message).toBe(
      'app crashes on open\n\nFollow-up email: user@example.com'
    )

    expect(mockSetToast).toHaveBeenCalledWith({ message: 'Feedback sent' })
  })

  it('still shows success toast when only one sender fails (partial success)', async () => {
    mockSendGoogleFormFeedback.mockRejectedValueOnce(new Error('boom'))

    render(<ReportAProblemContent />)

    fireEvent.change(screen.getByTestId('settings-report-a-problem-message'), {
      target: { value: 'something' }
    })
    fireEvent.change(screen.getByTestId('settings-report-a-problem-email'), {
      target: { value: 'user@example.com' }
    })
    fireEvent.submit(screen.getByTestId('settings-report-a-problem-form'))
    await flushAsync()

    expect(mockSetToast).toHaveBeenCalledWith({ message: 'Feedback sent' })
    expect(mockLoggerError).toHaveBeenCalled()
  })

  it('shows error toast when both senders fail', async () => {
    mockSendSlackFeedback.mockRejectedValueOnce(new Error('slack fail'))
    mockSendGoogleFormFeedback.mockRejectedValueOnce(new Error('google fail'))

    render(<ReportAProblemContent />)

    fireEvent.change(screen.getByTestId('settings-report-a-problem-message'), {
      target: { value: 'something' }
    })
    fireEvent.change(screen.getByTestId('settings-report-a-problem-email'), {
      target: { value: 'user@example.com' }
    })
    fireEvent.submit(screen.getByTestId('settings-report-a-problem-form'))
    await flushAsync()

    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'Something went wrong, please try again'
    })
    expect(mockLoggerError).toHaveBeenCalledTimes(2)
  })
})
