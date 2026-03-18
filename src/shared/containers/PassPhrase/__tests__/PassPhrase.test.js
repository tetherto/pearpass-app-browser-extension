import React from 'react'
import '@testing-library/jest-dom'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { PassPhrase } from '../'
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

jest.mock('@lingui/core/macro', () => ({
  t: (strings, ...values) =>
    Array.isArray(strings)
      ? strings.reduce(
          (acc, s, i) => acc + s + (i < values.length ? values[i] : ''),
          ''
        )
      : strings
}))
// Icons used by component
jest.mock('../../../icons/CopyIcon', () => ({
  CopyIcon: () => <i data-testid="copy-icon" />
}))
jest.mock('../../../icons/PasteIcon', () => ({
  PasteIcon: () => <i data-testid="paste-icon" />
}))
jest.mock('../../../icons/PassPhraseIcon', () => ({
  PassPhraseIcon: () => <i data-testid="pp-icon" />
}))
jest.mock('../../../icons/ErrorIcon', () => ({
  ErrorIcon: () => <i data-testid="error-icon" />
}))

// Badge item capture
const mockBadgeCalls = []
jest.mock('../../../components/BadgeTextItem', () => ({
  BadgeTextItem: (props) => {
    mockBadgeCalls.push(props)
    return (
      <div data-testid="badge-item">
        #{props.count}:{props.word}
      </div>
    )
  }
}))

// PassPhraseSettings capture
const mockSettingsCalls = []
jest.mock('../PassPhraseSettings', () => ({
  PassPhraseSettings: (props) => {
    mockSettingsCalls.push(props)
    return <div data-testid="settings" />
  }
}))

// Hooks
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

describe('PassPhrase (container)', () => {
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
    mockBadgeCalls.length = 0
    mockSettingsCalls.length = 0
    mockCopy.mockReset()
    mockPaste.mockReset()
    mockSetToast.mockReset()
  })

  test('renders header and no words initially', () => {
    renderComponent()
    expect(screen.getByTestId('pp-icon')).toBeInTheDocument()
    expect(screen.getByText('Recovery phrase')).toBeInTheDocument()
    expect(screen.queryAllByTestId('badge-item')).toHaveLength(0)
  })

  test('renders BadgeTextItem for each word in value', () => {
    renderComponent({ value: 'alpha@ !beta ,.gamma' })
    expect(screen.getAllByTestId('badge-item')).toHaveLength(3)
    expect(mockBadgeCalls.map((c) => c.word)).toEqual([
      'alpha@',
      '!beta',
      ',.gamma'
    ])
    expect(mockBadgeCalls.map((c) => c.count)).toEqual([1, 2, 3])
  })

  test('copy button copies when not create/edit', () => {
    renderComponent({ value: 'one two' })
    fireEvent.click(screen.getByRole('button'))
    expect(mockCopy).toHaveBeenCalledWith('one two')
  })

  test('paste button pastes, updates list, and calls onChange in create/edit', async () => {
    const onChange = jest.fn()
    const value =
      'fo1o-1bar-3bam,.z-q#ux-quux-corge-gra.!ult-garpl&&!@y-waldo-!red-pl@ugh-%@xyzzy'
    mockPaste.mockResolvedValueOnce(value) // 12 words
    renderComponent({ isCreateOrEdit: true, onChange, value: '' })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(value))
    expect(mockPaste).toHaveBeenCalledTimes(1)
    // After paste we should have badges for words

    const splittedVal = value.split('-')
    expect(mockBadgeCalls.length).toBe(splittedVal.length)
    mockBadgeCalls.forEach((c) => {
      expect(c.word).toBe(splittedVal[c.count - 1])
    })
  })

  test('renders settings in create/edit, disabled when words present', async () => {
    mockPaste.mockResolvedValueOnce('a b c d e f g h i j k l') // 12 words
    renderComponent({ isCreateOrEdit: true })

    // Initially with zero words: settings shown and not disabled
    expect(screen.getByTestId('settings')).toBeInTheDocument()
    expect(mockSettingsCalls[0].isDisabled).toBe(false)

    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(mockBadgeCalls.length).toBe(12))

    const lastSettings = mockSettingsCalls[mockSettingsCalls.length - 1]
    expect(lastSettings.isDisabled).toBe(true)
  })

  test('shows error text when error prop is provided', () => {
    renderComponent({ error: 'Oops!' })
    expect(screen.getByText('Oops!')).toBeInTheDocument()
  })

  test('13 words: switch is on and radio selected to 12', () => {
    const thirteen =
      'one two three four five six seven eight nine ten eleven twelve rand'
    renderComponent({ isCreateOrEdit: true, value: thirteen })

    // Last settings props reflect current state
    const last = mockSettingsCalls[mockSettingsCalls.length - 1]
    expect(last.withRandomWord).toBe(true)
    expect(last.selectedType).toBe(12)
  })

  test('25 words: switch is on and radio selected to 24', () => {
    const twentyFive = 'a-b-c-d-!-@-g-h-i-j-k-l-(-)-o-p-q-r-s-3-u-v-w-x-y'

    renderComponent({ isCreateOrEdit: true, value: twentyFive })

    const last = mockSettingsCalls[mockSettingsCalls.length - 1]
    expect(last.withRandomWord).toBe(true)
    expect(last.selectedType).toBe(24)
  })

  test('after paste: settings are disabled', async () => {
    mockPaste.mockResolvedValueOnce(
      'one two three four five six seven eight nine ten eleven twelve'
    )
    renderComponent({ isCreateOrEdit: true })
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(mockBadgeCalls.length).toBe(12))
    const last = mockSettingsCalls[mockSettingsCalls.length - 1]
    expect(last.isDisabled).toBe(true)
  })

  test('paste with invalid word count shows error toast and does not update', async () => {
    const onChange = jest.fn()
    const invalidText = 'one two three four five six seven eight nine ten' // 10 words
    mockPaste.mockResolvedValueOnce(invalidText)
    renderComponent({ isCreateOrEdit: true, onChange, value: '' })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalledWith({
        message: 'Only 12 or 24 words are allowed',
        icon: expect.anything()
      })
    })
    expect(onChange).not.toHaveBeenCalled()
    expect(mockBadgeCalls.length).toBe(0)
  })
})
