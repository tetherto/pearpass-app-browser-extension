import React from 'react'
import '@testing-library/jest-dom'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { PassPhrase } from '../PassPhrase'

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  PASSPHRASE_WORD_COUNTS: {
    STANDARD_12: 12,
    WITH_RANDOM_12: 13,
    STANDARD_24: 24,
    WITH_RANDOM_24: 25
  },
  VALID_WORD_COUNTS: [12, 13, 24, 25],
  DEFAULT_SELECTED_TYPE: 12
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  Button: ({ onClick, 'aria-label': ariaLabel, iconBefore }) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {iconBefore}
    </button>
  ),
  FieldError: ({ children }) => <div data-testid="field-error">{children}</div>,
  InputField: ({ label, value, onChange, readOnly, testID }) => (
    <input
      aria-label={label}
      value={value ?? ''}
      onChange={onChange || (() => {})}
      readOnly={readOnly}
      data-testid={testID}
    />
  ),
  Radio: ({ options, value, onChange }) => (
    <div data-testid="radio-group">
      {options?.map((opt) => (
        <label key={opt.value}>
          <input
            type="radio"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange?.()}
            readOnly
          />
          {opt.label}
        </label>
      ))}
    </div>
  ),
  Text: ({ children }) => <span>{children}</span>,
  useTheme: () => ({
    theme: {
      colors: {
        colorTextPrimary: '#000',
        colorSurfaceDestructiveElevated: '#f00',
        colorBorderPrimary: '#ccc'
      }
    }
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  ContentCopy: () => <i data-testid="icon-copy" />,
  ContentPaste: () => <i data-testid="icon-paste" />
}))

const mockCopy = jest.fn()
jest.mock('../../../hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard: mockCopy })
}))

const mockPaste = jest.fn()
jest.mock('../../../hooks/usePasteFromClipboard', () => ({
  usePasteFromClipboard: () => ({ pasteFromClipboard: mockPaste })
}))

const mockSetToast = jest.fn()
jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ setToast: mockSetToast })
}))

describe('PassPhrase', () => {
  const renderComponent = (props = {}) =>
    render(
      <PassPhrase
        isCreateOrEdit={false}
        onChange={jest.fn()}
        value=""
        error=""
        {...props}
      />
    )

  beforeEach(() => {
    mockCopy.mockReset()
    mockPaste.mockReset()
    mockSetToast.mockReset()
  })

  describe('view mode (isCreateOrEdit=false)', () => {
    test('renders Recovery Phrase label', () => {
      renderComponent({ value: 'one two three' })
      expect(screen.getByText('Recovery Phrase')).toBeInTheDocument()
    })

    test('renders a copy button', () => {
      renderComponent({ value: 'one two' })
      expect(
        screen.getByRole('button', { name: /copy recovery phrase/i })
      ).toBeInTheDocument()
    })

    test('renders one input per word in the value', () => {
      renderComponent({ value: 'one two three' })
      expect(screen.getAllByTestId(/passphrase-word-input-/)).toHaveLength(3)
    })

    test('copy button calls copyToClipboard with the current value', () => {
      renderComponent({ value: 'one two three' })
      fireEvent.click(
        screen.getByRole('button', { name: /copy recovery phrase/i })
      )
      expect(mockCopy).toHaveBeenCalledWith('one two three')
    })
  })

  describe('create/edit mode (isCreateOrEdit=true)', () => {
    test('renders Radio groups for 12 and 24 word options', () => {
      renderComponent({ isCreateOrEdit: true })
      expect(screen.getAllByTestId('radio-group')).toHaveLength(2)
      expect(screen.getByText('12 Words')).toBeInTheDocument()
      expect(screen.getByText('24 Words')).toBeInTheDocument()
    })

    test('renders paste buttons for each word count option', () => {
      renderComponent({ isCreateOrEdit: true })
      expect(
        screen.getAllByRole('button', { name: /paste recovery phrase/i })
      ).toHaveLength(2)
    })

    test('renders 12 input fields by default (selectedType=12)', () => {
      renderComponent({ isCreateOrEdit: true })
      expect(screen.getAllByTestId(/passphrase-word-input-/)).toHaveLength(12)
    })

    test('paste calls pasteFromClipboard and calls onChange with result', async () => {
      const onChange = jest.fn()
      const pasted = 'a b c d e f g h i j k l'
      mockPaste.mockResolvedValueOnce(pasted)
      renderComponent({ isCreateOrEdit: true, onChange })

      fireEvent.click(
        screen.getAllByRole('button', { name: /paste recovery phrase/i })[0]
      )

      await waitFor(() => expect(onChange).toHaveBeenCalledWith(pasted))
    })

    test('shows error toast when pasted word count is invalid', async () => {
      mockPaste.mockResolvedValueOnce('one two three') // 3 words — invalid
      renderComponent({ isCreateOrEdit: true, onChange: jest.fn() })

      fireEvent.click(
        screen.getAllByRole('button', { name: /paste recovery phrase/i })[0]
      )

      await waitFor(() =>
        expect(mockSetToast).toHaveBeenCalledWith({
          message: 'Only 12 or 24 words are allowed',
          icon: null
        })
      )
    })

    test('does not call onChange when pasted word count is invalid', async () => {
      const onChange = jest.fn()
      mockPaste.mockResolvedValueOnce('one two three') // 3 words — invalid
      renderComponent({ isCreateOrEdit: true, onChange })

      fireEvent.click(
        screen.getAllByRole('button', { name: /paste recovery phrase/i })[0]
      )

      await waitFor(() => expect(mockSetToast).toHaveBeenCalled())
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('error prop', () => {
    test('shows FieldError when error is set', () => {
      renderComponent({ error: 'Invalid passphrase' })
      expect(screen.getByTestId('field-error')).toHaveTextContent(
        'Invalid passphrase'
      )
    })

    test('does not render FieldError when error is empty', () => {
      renderComponent({ error: '' })
      expect(screen.queryByTestId('field-error')).not.toBeInTheDocument()
    })
  })
})
