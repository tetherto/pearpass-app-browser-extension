import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { PassPhraseSettings } from '../PassPhraseSettings'

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  PASSPHRASE_TYPE_OPTIONS: [{ value: 12 }, { value: 24 }]
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { _: (s) => s } })
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

const mockRadioSelectSpy = jest.fn()
const mockSwitchWithLabelSpy = jest.fn()

jest.mock('../../../components/RadioSelect', () => ({
  RadioSelect: (props) => {
    mockRadioSelectSpy(props)
    return (
      <button data-testid="radio-select" onClick={() => props.onChange(24)}>
        {props.title}
      </button>
    )
  }
}))

jest.mock('../../../components/SwitchWithLabel', () => ({
  SwitchWithLabel: (props) => {
    mockSwitchWithLabelSpy(props)
    return (
      <button
        data-testid="switch-with-label"
        onClick={() => props.onChange(true)}
        disabled={props.disabled}
      >
        toggle
      </button>
    )
  }
}))

describe('PassPhraseSettings', () => {
  const renderComponent = (overrideProps = {}) => {
    const defaultProps = {
      selectedType: 12,
      setSelectedType: jest.fn(),
      withRandomWord: false,
      setWithRandomWord: jest.fn(),
      isDisabled: false
    }

    const props = { ...defaultProps, ...overrideProps }

    const utils = render(<PassPhraseSettings {...props} />)

    return { ...utils, props }
  }

  beforeEach(() => {
    mockRadioSelectSpy.mockClear()
    mockSwitchWithLabelSpy.mockClear()
  })

  test('renders and passes correct props to RadioSelect', () => {
    const { props } = renderComponent()

    const radio = screen.getByTestId('radio-select')
    expect(radio).toBeInTheDocument()
    expect(radio).toHaveTextContent('Type')

    const passed = mockRadioSelectSpy.mock.calls[0][0]
    expect(passed.selectedOption).toBe(props.selectedType)
    expect(passed.disabled).toBe(false)
    expect(passed.options.map((o) => o.value)).toEqual([12, 24])
    expect(passed.options.map((o) => o.label)).toEqual([`12 words`, `24 words`])
  })

  test('invokes setSelectedType when RadioSelect triggers onChange', () => {
    const { props } = renderComponent()

    fireEvent.click(screen.getByTestId('radio-select'))
    expect(props.setSelectedType).toHaveBeenCalledWith(24)
  })

  test('renders and toggles SwitchWithLabel', () => {
    const { props } = renderComponent({ withRandomWord: false })

    const passed = mockSwitchWithLabelSpy.mock.calls[0][0]
    expect(passed.isOn).toBe(false)
    expect(passed.disabled).toBe(false)

    fireEvent.click(screen.getByTestId('switch-with-label'))
    expect(props.setWithRandomWord).toHaveBeenCalledWith(true)
  })

  test('forwards disabled to children', () => {
    renderComponent({ isDisabled: true })

    const radioProps = mockRadioSelectSpy.mock.calls[0][0]
    const switchProps = mockSwitchWithLabelSpy.mock.calls[0][0]
    expect(radioProps.disabled).toBe(true)
    expect(switchProps.disabled).toBe(true)
  })
})
