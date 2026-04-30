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
    testID,
    disabled
  }: {
    label?: string
    value?: string
    onChange?: (v: string) => void
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
    </label>
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

const mockUseGlobalLoading = jest.fn()

jest.mock('../../../../../shared/context/LoadingContext', () => ({
  __esModule: true,
  useGlobalLoading: (args: unknown) => mockUseGlobalLoading(args)
}))

const mockIsOnline = jest.fn(() => true)

jest.mock('../../../../../shared/utils/isOnline', () => ({
  __esModule: true,
  isOnline: () => mockIsOnline()
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
    mockUseGlobalLoading.mockReset()
    mockIsOnline.mockReset()
    mockIsOnline.mockReturnValue(true)
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
    const labels = screen.getAllByText('Report a problem')
    expect(labels.length).toBeGreaterThanOrEqual(2)
  })

  it('disables Send when message is empty', () => {
    render(<ReportAProblemContent />)
    expect(
      screen.getByTestId('settings-report-a-problem-submit')
    ).toBeDisabled()
  })

  it('does not call senders when offline at submit start', async () => {
    mockIsOnline.mockReturnValue(false)
    render(<ReportAProblemContent />)

    fireEvent.change(screen.getByTestId('settings-report-a-problem-message'), {
      target: { value: 'something is broken' }
    })
    fireEvent.submit(screen.getByTestId('settings-report-a-problem-form'))
    await flushAsync()

    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'You are offline, please check your internet connection'
    })
    expect(mockSendSlackFeedback).not.toHaveBeenCalled()
    expect(mockSendGoogleFormFeedback).not.toHaveBeenCalled()
  })

  it('calls both senders with payload and shows success toast', async () => {
    render(<ReportAProblemContent />)

    fireEvent.change(screen.getByTestId('settings-report-a-problem-message'), {
      target: { value: 'app crashes on open' }
    })
    fireEvent.submit(screen.getByTestId('settings-report-a-problem-form'))
    await flushAsync()

    expect(mockSendSlackFeedback).toHaveBeenCalledTimes(1)
    expect(mockSendGoogleFormFeedback).toHaveBeenCalledTimes(1)

    const slackArgs = mockSendSlackFeedback.mock.calls[0][0]
    expect(slackArgs.webhookUrPath).toBe('/test/slack/webhook')
    expect(slackArgs.message).toBe('app crashes on open')
    expect(slackArgs.topic).toBe('BUG_REPORT')
    expect(slackArgs.app).toBe('BROWSER_EXTENSION')
    expect(slackArgs.appVersion).toBe('1.2.3')

    const googleArgs = mockSendGoogleFormFeedback.mock.calls[0][0]
    expect(googleArgs.formKey).toBe('test-form-key')
    expect(googleArgs.mapping).toEqual({ message: 'entry.1' })
    expect(googleArgs.message).toBe('app crashes on open')

    expect(mockSetToast).toHaveBeenCalledWith({ message: 'Feedback sent' })
    expect(
      (
        screen.getByTestId(
          'settings-report-a-problem-message'
        ) as HTMLTextAreaElement
      ).value
    ).toBe('')
  })

  it('still shows success toast when only one sender fails (partial success)', async () => {
    mockSendGoogleFormFeedback.mockRejectedValueOnce(new Error('boom'))

    render(<ReportAProblemContent />)

    fireEvent.change(screen.getByTestId('settings-report-a-problem-message'), {
      target: { value: 'something' }
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
    fireEvent.submit(screen.getByTestId('settings-report-a-problem-form'))
    await flushAsync()

    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'Something went wrong, please try again'
    })
    expect(mockLoggerError).toHaveBeenCalledTimes(2)
  })

  it('shows offline toast when 10s timeout fires while offline', async () => {
    jest.useFakeTimers()
    mockSendSlackFeedback.mockReturnValue(new Promise(() => {}))
    mockSendGoogleFormFeedback.mockReturnValue(new Promise(() => {}))

    render(<ReportAProblemContent />)

    fireEvent.change(screen.getByTestId('settings-report-a-problem-message'), {
      target: { value: 'hangs forever' }
    })
    fireEvent.submit(screen.getByTestId('settings-report-a-problem-form'))

    mockIsOnline.mockReturnValue(false)

    await act(async () => {
      jest.advanceTimersByTime(10_000)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'You are offline, please check your internet connection'
    })

    jest.useRealTimers()
  })
})
